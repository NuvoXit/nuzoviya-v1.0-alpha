"""
=============================================================================
Nuzoviya MEDICAL PLATFORM - API SERVER & ROUTE HANDLERS
=============================================================================
Module: main.py
Description: Defines REST API endpoints for patient management, appointment
             bookings, staff authentication, billing, medical lab records,
             radiology reports, and doctor schedules.
=============================================================================
"""

import json
import os
from datetime import date, datetime
from flask import jsonify, request, send_from_directory
from sqlalchemy import or_, func
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename

from admin import init_admin
from config import Application, Database
from models import (
    Booking,
    Doctor,
    DoctorSchedule,
    Feedback,
    LabRecord,
    Login,
    MLT,
    Nurse,
    Patient,
    Payment,
    Prescription,
    Radiologist,
    UserRole,
    XrayRecord,
    _to_date,
    _to_time,
    normalize_and_validate_telephone,
)


# =============================================================================
# INFORMATIONAL & WELCOME ENDPOINTS
# =============================================================================

@Application.route("/", methods=["GET"])
def main():
    """Returns backend service status message."""
    return jsonify({"message": "First Page of Nuzoviya Medical Platform Backend"}), 200


@Application.route("/home", methods=["GET"])
def home():
    """Returns home landing status message."""
    return jsonify({"message": "Welcome to the Home Page"}), 200


@Application.route("/patient", methods=["GET"])
def patient():
    """Returns patient module status message."""
    return jsonify({"message": "Welcome to the Patient Page"}), 200


@Application.route("/booking", methods=["GET"])
def booking():
    """Returns booking module status message."""
    return jsonify({"message": "Welcome to the Booking Page"}), 200


# =============================================================================
# PATIENT MANAGEMENT ENDPOINTS
# =============================================================================

@Application.route("/patient/add_patient", methods=["POST"])
def add_patient():
    """
    Creates a new patient record.

    JSON Request Body:
        firstName (str): First name
        lastName (str): Last name
        nic (str): National Identity Card number
        dob (str): Date of birth in YYYY-MM-DD format
        address (str): Home address
        telephone (str): Contact phone number
        email (str): Email address

    Returns:
        201: Patient created successfully
        400: Missing required fields
        409: Duplicate NIC conflict
        500: Database / server error
    """
    try:
        data = request.get_json() or {}

        first_name = data.get("firstName")
        last_name = data.get("lastName")
        nic = data.get("nic")
        dob = data.get("dob")
        address = data.get("address")
        telephone = data.get("telephone")
        email = data.get("email")

        # Validate that all required fields are provided
        if not all([first_name, last_name, nic, dob, address, telephone, email]):
            return jsonify({"error": "Missing required fields"}), 400

        try:
            telephone = normalize_and_validate_telephone(telephone)
        except ValueError as ve:
            return jsonify({"error": str(ve)}), 400

        # Check for existing patient by NIC or by Full Name (case-insensitive)
        existing_by_nic = Patient.query.filter_by(nic=nic.strip()).first() if nic else None
        existing_by_name = Patient.query.filter(
            func.lower(Patient.first_name) == first_name.lower().strip(),
            func.lower(Patient.last_name) == last_name.lower().strip(),
        ).first()

        if existing_by_nic and existing_by_name and existing_by_nic.patient_id != existing_by_name.patient_id:
            return jsonify({"error": "Patient with this NIC already exists under a different record"}), 409

        existing_patient = existing_by_name or existing_by_nic

        if existing_patient:
            # Update existing record if it had missing details or update demographics
            existing_patient.first_name = first_name.strip()
            existing_patient.last_name = last_name.strip()
            existing_patient.nic = nic.strip() if nic else existing_patient.nic
            existing_patient.dob = _to_date(dob) if dob else existing_patient.dob
            existing_patient.address = address.strip() if address else existing_patient.address
            existing_patient.telephone = telephone.strip() if telephone else existing_patient.telephone
            existing_patient.email = email.strip() if email else existing_patient.email

            Database.session.commit()
            return jsonify({"message": "Patient record updated successfully", "patient_id": existing_patient.patient_id}), 200

        new_patient = Patient(
            first_name=first_name.strip(),
            last_name=last_name.strip(),
            nic=nic.strip(),
            dob=dob,
            address=address.strip(),
            telephone=telephone.strip(),
            email=email.strip(),
        )

        Database.session.add(new_patient)
        Database.session.commit()

        return jsonify({"message": "Patient added successfully", "patient_id": new_patient.patient_id}), 201

    except Exception as e:
        Database.session.rollback()
        return jsonify({"error": str(e)}), 500


@Application.route("/patient/all_patients", methods=["GET"])
def all_patients():
    """
    Retrieves all registered patient records, deduplicating repeat entries by Name.

    Returns:
        200: List of unique patient objects in JSON format
    """
    patients = Patient.query.order_by(Patient.patient_id.asc()).all()
    unique_patients = {}
    for p in patients:
        name_key = f"{p.first_name.strip()} {p.last_name.strip()}".lower()
        if name_key not in unique_patients:
            unique_patients[name_key] = p.to_dict()
        else:
            # Merge richer fields into the existing unique record
            current = unique_patients[name_key]
            if not current.get("nic") and p.nic:
                current["nic"] = p.nic
            if not current.get("dob") and p.dob:
                current["dob"] = p.dob.isoformat() if hasattr(p.dob, 'isoformat') else p.dob
            if not current.get("address") and p.address:
                current["address"] = p.address
            if not current.get("email") and p.email:
                current["email"] = p.email
            if not current.get("telephone") and p.telephone:
                current["telephone"] = p.telephone

    return jsonify(list(unique_patients.values())), 200


@Application.route("/patient/search_patients", methods=["GET"])
def search_patients():
    """
    Searches patients matching query term in first_name, last_name, nic, or telephone.
    Used by booking page to show suggestions and auto-fill previous patient details.

    Query Parameters:
        query (str): Search keyword

    Returns:
        200: List of matched patient dictionaries
    """
    try:
        query = request.args.get("query", "").strip()
        if not query:
            return jsonify([]), 200

        search_pattern = f"%{query}%"
        full_name_expr = Patient.first_name + " " + Patient.last_name

        patients = Patient.query.filter(
            or_(
                full_name_expr.ilike(search_pattern),
                Patient.first_name.ilike(search_pattern),
                Patient.last_name.ilike(search_pattern),
                Patient.nic.ilike(search_pattern),
                Patient.telephone.ilike(search_pattern),
            )
        ).limit(20).all()

        seen = set()
        unique_list = []
        for p in patients:
            key = p.nic.strip().lower() if p.nic else f"{p.first_name.strip().lower()} {p.last_name.strip().lower()}"
            if key not in seen:
                seen.add(key)
                unique_list.append(p.to_dict())

        return jsonify(unique_list), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@Application.route("/patient/<int:patient_id>", methods=["GET"])
def get_patient(patient_id):
    """
    Retrieves a single patient record by unique ID.

    Path Parameters:
        patient_id (int): Patient ID

    Returns:
        200: Patient object
        404: Patient not found
    """
    patient = Database.session.get(Patient, patient_id)
    if not patient:
        return jsonify({"error": "Patient not found"}), 404
    return jsonify(patient.to_dict()), 200


@Application.route("/patient/delete/<int:patient_id>", methods=["DELETE"])
def delete_patient(patient_id):
    """
    Deletes an existing patient record by ID.

    Path Parameters:
        patient_id (int): Patient ID to delete

    Returns:
        200: Patient deleted successfully
        404: Patient not found
        500: Server error
    """
    try:
        existing_patient = Database.session.get(Patient, patient_id)
        if not existing_patient:
            return jsonify({"error": "Patient not found"}), 404

        Database.session.delete(existing_patient)
        Database.session.commit()

        return jsonify({"message": "Patient deleted successfully"}), 200

    except Exception as e:
        Database.session.rollback()
        return jsonify({"error": str(e)}), 500


# =============================================================================
# APPOINTMENT BOOKING ENDPOINTS
# =============================================================================

@Application.route("/booking/add_booking", methods=["POST"])
def add_booking():
    """
    Creates a new doctor appointment booking.
    Auto-creates patient record if not already registered.

    JSON Request Body:
        firstName (str): Patient first name
        lastName (str): Patient last name
        telephone (str): Patient contact number
        doctorName (str, optional): Doctor full name
        doctorId (int, optional): Doctor identifier
        appointmentDate (str): Date in YYYY-MM-DD
        appointmentTime (str): Time in HH:MM format

    Returns:
        201: Booking created successfully
        400: Missing required fields
        500: Server error
    """
    try:
        data = request.get_json() or {}

        first_name = data.get("firstName")
        last_name = data.get("lastName")
        telephone = data.get("telephone")
        nic = data.get("nic")
        doctor_name = data.get("doctorName")
        doctor_id = data.get("doctorId")
        appointment_date = data.get("appointmentDate")
        appointment_time = data.get("appointmentTime")

        # Resolve doctor name if only doctorId was provided
        if not doctor_name and doctor_id:
            doc = Database.session.get(Doctor, int(doctor_id))
            if doc:
                doctor_name = doc.doctor_full_name

        # Validate required fields
        if not all([first_name, last_name, telephone, doctor_name, appointment_date, appointment_time]):
            return jsonify({"error": "Missing required fields"}), 400

        try:
            telephone = normalize_and_validate_telephone(telephone)
        except ValueError as ve:
            return jsonify({"error": str(ve)}), 400

        # Clean string inputs
        first_name = first_name.strip()
        last_name = last_name.strip()
        doctor_name = doctor_name.strip()
        clean_nic = nic.strip() if nic else None

        # Check for existing patient: Check NIC first as primary identifier
        existing_patient = None
        if clean_nic:
            existing_patient = Patient.query.filter_by(nic=clean_nic).first()

        if not existing_patient:
            existing_patient = Patient.query.filter(
                or_(
                    (func.lower(Patient.first_name) == first_name.lower()) & (func.lower(Patient.last_name) == last_name.lower()),
                    Patient.telephone == telephone,
                )
            ).first()

        if existing_patient:
            # If patient changed telephone number, identify by NIC and update telephone in database
            if clean_nic and not existing_patient.nic:
                existing_patient.nic = clean_nic
            if telephone:
                existing_patient.telephone = telephone
            existing_patient.first_name = first_name
            existing_patient.last_name = last_name
        else:
            existing_patient = Patient(
                first_name=first_name,
                last_name=last_name,
                nic=clean_nic,
                dob=None,
                address=None,
                telephone=telephone,
                email=None,
            )
            Database.session.add(existing_patient)
            Database.session.flush()

        # Create appointment booking
        new_booking = Booking(
            first_name=first_name,
            last_name=last_name,
            telephone=telephone,
            nic=clean_nic or existing_patient.nic,
            status="Booked",
            doctor_name=doctor_name,
            appointment_date=appointment_date,
            appointment_time=appointment_time,
        )

        Database.session.add(new_booking)
        Database.session.commit()

        return jsonify({"message": "Booking added successfully", "booking_id": new_booking.booking_id}), 201

    except Exception as e:
        Database.session.rollback()
        return jsonify({"error": str(e)}), 500


@Application.route("/booking/all_bookings", methods=["GET"])
def all_bookings():
    """
    Retrieves all scheduled appointment bookings.

    Returns:
        200: List of all bookings in JSON format
    """
    bookings = Booking.query.all()
    return jsonify([b.to_dict() for b in bookings]), 200


@Application.route("/booking/search_doctors", methods=["GET"])
def search_doctors():
    """
    Searches doctors matching query term in first name or last name.

    Query Parameters:
        query (str): Search term

    Returns:
        200: List of matched doctors
    """
    try:
        query = request.args.get("query", "").strip()

        if not query:
            return jsonify([]), 200

        search_pattern = f"%{query}%"
        full_name_expr = Doctor.doctor_first_name + " " + Doctor.doctor_last_name
        doctors = Doctor.query.filter(
            or_(
                full_name_expr.ilike(search_pattern),
                Doctor.doctor_first_name.ilike(search_pattern),
                Doctor.doctor_last_name.ilike(search_pattern),
            )
        ).all()

        return jsonify([d.to_dict() for d in doctors]), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@Application.route("/booking/search_bookings", methods=["GET"])
def search_bookings():
    """
    Searches appointment bookings by patient name, telephone, or NIC.
    Used by payment page to auto-fill booked patient details.

    Query Parameters:
        query (str): Search term

    Returns:
        200: List of matched bookings
    """
    try:
        query = request.args.get("query", "").strip()

        if not query:
            return jsonify([]), 200

        search_pattern = f"%{query}%"
        full_name_expr = Booking.first_name + " " + Booking.last_name
        bookings = Booking.query.filter(
            or_(
                full_name_expr.ilike(search_pattern),
                Booking.first_name.ilike(search_pattern),
                Booking.last_name.ilike(search_pattern),
                Booking.telephone.ilike(search_pattern),
                Booking.nic.ilike(search_pattern),
            )
        ).order_by(Booking.booking_id.desc()).limit(20).all()

        return jsonify([b.to_dict() for b in bookings]), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =============================================================================
# STAFF & AUTHENTICATION ENDPOINTS
# =============================================================================

@Application.route("/nurse/all_nurses", methods=["GET"])
def all_nurses():
    """
    Retrieves all registered nurse records.

    Returns:
        200: List of nurses
    """
    nurses = Nurse.query.all()
    return jsonify([n.to_dict() for n in nurses]), 200


@Application.route("/login", methods=["POST"])
def login():
    """
    Authenticates staff credentials against the database.
    Upgrades legacy plain-text passwords to secure hashes on successful login.

    JSON Request Body:
        username (str): Staff username
        password (str): Account password
        role (str): Staff role (Doctor, Receptionist, Nurse, MLT, Radiologist)

    Returns:
        200: Authentication success with user details
        400: Invalid role or missing fields
        401: Invalid credentials
        500: Server error
    """
    try:
        data = request.get_json() or {}

        username = data.get("username")
        password = data.get("password")
        role = data.get("role")

        if not all([username, password, role]):
            return jsonify({"error": "Missing required fields"}), 400

        try:
            role_enum = UserRole(role)
        except ValueError:
            return jsonify({"error": "Invalid role"}), 400

        existing_user = Login.query.filter_by(username=username, role=role_enum).first()
        if not existing_user:
            return jsonify({"error": "Invalid username, password, or role"}), 401

        # Check hashed password or fallback to plain-text
        password_valid = False
        try:
            password_valid = check_password_hash(existing_user.password, password)
        except (ValueError, TypeError):
            password_valid = False

        if not password_valid and existing_user.password == password:
            password_valid = True

        if password_valid:
            # Upgrade plain-text password to hash
            if not existing_user.password.startswith("pbkdf2:"):
                existing_user.password = generate_password_hash(password)
                Database.session.commit()

            return jsonify({
                "message": "Successfully Logged In",
                "username": existing_user.username,
                "role": existing_user.role.value,
                "id": existing_user.id,
            }), 200

        return jsonify({"error": "Invalid username, password, or role"}), 401

    except Exception as e:
        Database.session.rollback()
        return jsonify({"error": str(e)}), 500


# =============================================================================
# PAYMENT & BILLING ENDPOINTS
# =============================================================================

@Application.route("/payment", methods=["POST"])
def payment():
    """
    Processes a patient payment transaction.

    JSON Request Body:
        firstName (str): Patient first name
        lastName (str): Patient last name
        telephone (str): Patient telephone
        hospitalFeeSelected (bool): Include hospital fee (500)
        doctorFeeSelected (bool): Include doctor fee (2000)
        mltFeeSelected (bool): Include MLT fee (1000)
        radiologistFeeSelected (bool): Include Radiologist fee (1000)
        additionalReason (str, optional): Reason for additional charge
        additionalCharge (float, optional): Extra charge amount
        paymentDate (str, optional): Date of payment

    Returns:
        201: Payment processed successfully
        400: Missing required fields
        500: Server error
    """
    try:
        data = request.get_json() or {}

        first_name = data.get("firstName")
        last_name = data.get("lastName")
        telephone = data.get("telephone")
        hospital_fee_selected = bool(data.get("hospitalFeeSelected"))
        doctor_fee_selected = bool(data.get("doctorFeeSelected"))
        mlt_fee_selected = bool(data.get("mltFeeSelected"))
        radiologist_fee_selected = bool(data.get("radiologistFeeSelected"))
        additional_reason = data.get("additionalReason")
        additional_charge = float(data.get("additionalCharge") or 0)
        payment_date = data.get("paymentDate")

        # Validate required contact info
        if not all([first_name, last_name, telephone]):
            return jsonify({"error": "Missing required fields"}), 400

        try:
            telephone = normalize_and_validate_telephone(telephone)
        except ValueError as ve:
            return jsonify({"error": str(ve)}), 400

        # Calculate total amount
        total_amount = 0
        if hospital_fee_selected:
            total_amount += Payment.HOSPITAL_FEE
        if doctor_fee_selected:
            total_amount += Payment.DOCTOR_FEE
        if mlt_fee_selected:
            total_amount += Payment.MLT_FEE
        if radiologist_fee_selected:
            total_amount += Payment.RADIOLOGIST_FEE
        if additional_charge:
            total_amount += additional_charge

        first_name = first_name.strip()
        last_name = last_name.strip()

        # Check or create patient (case-insensitive name match or telephone match)
        existing_patient = Patient.query.filter(
            or_(
                (func.lower(Patient.first_name) == first_name.lower()) & (func.lower(Patient.last_name) == last_name.lower()),
                Patient.telephone == telephone,
            )
        ).first()

        if not existing_patient:
            new_patient = Patient(
                first_name=first_name,
                last_name=last_name,
                telephone=telephone,
            )
            Database.session.add(new_patient)
            Database.session.commit()

        # Associate with booking if provided or match recent active booking
        booking_id = data.get("bookingId") or data.get("booking_id")
        if booking_id:
            bk = Database.session.get(Booking, int(booking_id))
            if bk:
                bk.status = "Paid"
        else:
            recent_booking = Booking.query.filter_by(telephone=telephone).order_by(Booking.booking_id.desc()).first()
            if recent_booking and recent_booking.status != "Completed":
                recent_booking.status = "Paid"
                booking_id = recent_booking.booking_id

        # Create payment record
        new_payment = Payment(
            booking_id=int(booking_id) if booking_id else None,
            first_name=first_name,
            last_name=last_name,
            telephone=telephone,
            hospital_fee=Payment.HOSPITAL_FEE if hospital_fee_selected else 0,
            doctor_fee=Payment.DOCTOR_FEE if doctor_fee_selected else 0,
            mlt_fee=Payment.MLT_FEE if mlt_fee_selected else 0,
            radiologist_fee=Payment.RADIOLOGIST_FEE if radiologist_fee_selected else 0,
            additional_reason=additional_reason,
            additional_charge=additional_charge,
            total_amount=total_amount,
            payment_date=payment_date,
        )

        Database.session.add(new_payment)
        Database.session.commit()

        return jsonify({"message": "Payment processed successfully", "payment_id": new_payment.payment_id}), 201

    except Exception as e:
        Database.session.rollback()
        return jsonify({"error": str(e)}), 500


@Application.route("/payments", methods=["GET"])
@Application.route("/payment/all_payments", methods=["GET"])
def all_payments():
    """
    Retrieves all payment transaction records.

    Returns:
        200: List of all payment records
    """
    payments = Payment.query.all()
    return jsonify([pa.to_dict() for pa in payments]), 200


@Application.route("/payments/mlt", methods=["GET"])
def mlt_payments():
    """
    Retrieves payments having laboratory MLT fees, ordered by recent date.

    Returns:
        200: List of MLT payments
    """
    payments = (
        Payment.query.filter(Payment.mlt_fee >= Payment.MLT_FEE)
        .order_by(Payment.payment_date.desc(), Payment.payment_id.desc())
        .all()
    )
    return jsonify([pa.to_dict() for pa in payments]), 200


@Application.route("/payments/radiologist", methods=["GET"])
def radiologist_payments():
    """
    Retrieves payments having radiology examination fees, ordered by recent date.

    Returns:
        200: List of radiologist payments
    """
    payments = (
        Payment.query.filter(Payment.radiologist_fee >= Payment.RADIOLOGIST_FEE)
        .order_by(Payment.payment_date.desc(), Payment.payment_id.desc())
        .all()
    )
    return jsonify([pa.to_dict() for pa in payments]), 200


# =============================================================================
# LABORATORY RECORDS & REPORT FILE SERVING
# =============================================================================

@Application.route("/lab_records/all_lab_records", methods=["GET"])
def all_lab_records():
    """
    Retrieves all laboratory test records.

    Returns:
        200: List of lab records
    """
    lab_records = LabRecord.query.all()
    return jsonify([lr.to_dict() for lr in lab_records]), 200


@Application.route("/lab_records/patient/<int:patient_id>", methods=["GET"])
def patient_lab_records(patient_id):
    """
    Retrieves laboratory test records for a specific patient by ID.

    Path Parameters:
        patient_id (int): Patient identifier

    Returns:
        200: List of patient's lab records
    """
    lab_records = (
        LabRecord.query.filter_by(patient_id=patient_id)
        .order_by(LabRecord.test_date.desc())
        .all()
    )
    return jsonify([lr.to_dict() for lr in lab_records]), 200


@Application.route("/lab_reports/<path:filename>", methods=["GET"])
def serve_lab_report(filename):
    """
    Serves uploaded lab report files (PDF or images) securely.

    Path Parameters:
        filename (str): Uploaded file path / name
    """
    clean = filename.replace("\\", "/")

    if clean.startswith("lab_reports/"):
        clean = clean[len("lab_reports/"):]

    legacy_clean = None
    if clean.startswith("lab_reports_"):
        legacy_clean = clean[len("lab_reports_"):]

    base_dir = os.path.abspath(os.path.dirname(__file__))
    admin_dir = os.path.join(base_dir, "Submitted_Files", "lab_reports")
    api_dir = os.path.join(base_dir, "lab_reports")

    candidates = [clean]
    if legacy_clean:
        candidates.append(legacy_clean)

    for name in candidates:
        if os.path.isfile(os.path.join(admin_dir, name)):
            return send_from_directory(admin_dir, name)
        if os.path.isfile(os.path.join(api_dir, name)):
            return send_from_directory(api_dir, name)

    return jsonify({"error": "File not found", "searched": candidates}), 404


@Application.route("/lab_records/add_lab_record", methods=["POST"])
def add_lab_record():
    """
    Uploads and creates a new lab test record with an attached report file.

    Form Multipart Data:
        patientId (int): Patient ID
        patientFirstName (str): Patient first name
        patientLastName (str): Patient last name
        testName (str): Name of laboratory test
        testResult (File): Uploaded document or image

    Returns:
        201: Lab record created successfully
        400: Missing required fields
        404: Patient not found
        409: Duplicate submission conflict
        500: Server error
    """
    try:
        data = request.form.to_dict()

        patient_id = data.get("patientId")
        patient_first_name = data.get("patientFirstName")
        patient_last_name = data.get("patientLastName")
        test_name = data.get("testName")
        test_result_file = request.files.get("testResult")

        if not all([patient_id, test_name, test_result_file]):
            return jsonify({"error": "Missing required fields"}), 400

        patient = Database.session.get(Patient, int(patient_id))
        if not patient:
            return jsonify({"error": "Patient not found"}), 404

        # Prevent duplicate submissions
        existing_record = LabRecord.query.filter_by(patient_id=patient_id).first()
        if existing_record:
            return jsonify({"error": "A lab test has already been submitted for this patient"}), 409

        upload_folder = os.path.join(os.path.abspath(os.path.dirname(__file__)), "lab_reports")
        os.makedirs(upload_folder, exist_ok=True)

        filename = secure_filename(test_result_file.filename)
        filepath = os.path.join(upload_folder, filename)
        test_result_file.save(filepath)

        new_lab_record = LabRecord(
            patient_id=patient_id,
            patient_first_name=patient_first_name,
            patient_last_name=patient_last_name,
            test_name=test_name,
            test_date=date.today(),
            result=filename,
        )

        Database.session.add(new_lab_record)
        Database.session.commit()

        return jsonify({
            "message": "Lab record created successfully",
            "test_id": new_lab_record.test_id,
        }), 201

    except Exception as e:
        Database.session.rollback()
        return jsonify({"error": str(e)}), 500


# =============================================================================
# RADIOLOGY (X-RAY) RECORDS & REPORT FILE SERVING
# =============================================================================

@Application.route("/xray_records/all_xray_records", methods=["GET"])
def all_xray_records():
    """
    Retrieves all radiology examination records.

    Returns:
        200: List of X-ray records
    """
    records = XrayRecord.query.all()
    return jsonify([r.to_dict() for r in records]), 200


@Application.route("/xray_records/patient/<int:patient_id>", methods=["GET"])
def patient_xray_records(patient_id):
    """
    Retrieves radiology records for a specific patient by ID.

    Path Parameters:
        patient_id (int): Patient identifier

    Returns:
        200: List of patient X-ray records
    """
    records = (
        XrayRecord.query.filter_by(patient_id=patient_id)
        .order_by(XrayRecord.xray_date.desc())
        .all()
    )
    return jsonify([r.to_dict() for r in records]), 200


@Application.route("/xray_reports/<path:filename>", methods=["GET"])
def serve_xray_report(filename):
    """
    Serves uploaded X-ray image / PDF report files.

    Path Parameters:
        filename (str): Uploaded file path / name
    """
    clean = filename.replace("\\", "/")
    if clean.startswith("xray_reports/"):
        clean = clean[len("xray_reports/"):]

    base_dir = os.path.abspath(os.path.dirname(__file__))
    xray_dir = os.path.join(base_dir, "xray_reports")

    if os.path.isfile(os.path.join(xray_dir, clean)):
        return send_from_directory(xray_dir, clean)

    return jsonify({"error": "File not found"}), 404


@Application.route("/xray_records/add_xray_record", methods=["POST"])
def add_xray_record():
    """
    Uploads and creates a new X-ray radiology record with an attached report file.

    Form Multipart Data:
        patientId (int): Patient ID
        patientFirstName (str): Patient first name
        patientLastName (str): Patient last name
        xrayType (str): Type of X-ray scan
        xrayResult (File): Uploaded document or image

    Returns:
        201: X-ray record created successfully
        400: Missing required fields
        404: Patient not found
        409: Duplicate submission conflict
        500: Server error
    """
    try:
        data = request.form.to_dict()

        patient_id = data.get("patientId")
        patient_first_name = data.get("patientFirstName")
        patient_last_name = data.get("patientLastName")

        # Collect all xray types (from list or single field)
        xray_types = (
            request.form.getlist("xrayTypes[]")
            or request.form.getlist("xrayTypes")
            or request.form.getlist("xrayType[]")
            or request.form.getlist("xrayType")
        )
        if not xray_types:
            single_t = data.get("xrayType") or data.get("xray_type")
            if single_t:
                xray_types = [single_t]

        # Clean up types
        xray_types = [t.strip() for t in xray_types if t and t.strip()]

        # Collect all xray files (from list or single field)
        xray_files = (
            request.files.getlist("xrayResults[]")
            or request.files.getlist("xrayResults")
            or request.files.getlist("xrayResult[]")
            or request.files.getlist("xrayResult")
        )
        if not xray_files:
            single_f = request.files.get("xrayResult") or request.files.get("xray_result")
            if single_f:
                xray_files = [single_f]

        if not patient_id or not xray_types or not xray_files:
            return jsonify({"error": "Missing required fields"}), 400

        patient = Database.session.get(Patient, int(patient_id))
        if not patient:
            return jsonify({"error": "Patient not found"}), 404

        # Prevent duplicate submissions
        existing_record = XrayRecord.query.filter_by(patient_id=patient_id).first()
        if existing_record:
            return jsonify({"error": "An X-ray has already been submitted for this patient"}), 409

        upload_folder = os.path.join(os.path.abspath(os.path.dirname(__file__)), "xray_reports")
        os.makedirs(upload_folder, exist_ok=True)

        saved_filenames = []
        for i, file_obj in enumerate(xray_files):
            if file_obj and file_obj.filename:
                orig_name = secure_filename(file_obj.filename)
                timestamp_prefix = int(datetime.now().timestamp())
                filename = f"{timestamp_prefix}_{i}_{orig_name}" if len(xray_files) > 1 else orig_name
                filepath = os.path.join(upload_folder, filename)
                file_obj.save(filepath)
                saved_filenames.append(filename)

        if not saved_filenames:
            return jsonify({"error": "No valid files uploaded"}), 400

        # If multiple types/files, store as serialized JSON list; if single, store direct string
        xray_type_str = json.dumps(xray_types) if len(xray_types) > 1 else xray_types[0]
        xray_result_str = json.dumps(saved_filenames) if len(saved_filenames) > 1 else saved_filenames[0]

        new_xray_record = XrayRecord(
            patient_id=patient_id,
            patient_first_name=patient_first_name or patient.first_name,
            patient_last_name=patient_last_name or patient.last_name,
            xray_type=xray_type_str,
            xray_date=date.today(),
            xray_result=xray_result_str,
        )

        Database.session.add(new_xray_record)
        Database.session.commit()

        return jsonify({
            "message": "X-ray record created successfully",
            "xray_id": new_xray_record.xray_id,
            "xray_types": xray_types,
            "xray_results": saved_filenames,
        }), 201

    except Exception as e:
        Database.session.rollback()
        return jsonify({"error": str(e)}), 500


# =============================================================================
# DOCTOR SCHEDULE ENDPOINTS
# =============================================================================

@Application.route("/doctor_schedule/add_schedule", methods=["POST"])
def add_doctor_schedule():
    """
    Creates a new availability schedule for a doctor.

    JSON Request Body:
        doctorId (int, optional): Doctor ID
        doctorFullName (str, optional): Doctor's full name
        availableDate (str): Available date in YYYY-MM-DD
        availableInitialTime (str): Shift start time in HH:MM
        availableFinalTime (str): Shift end time in HH:MM

    Returns:
        201: Doctor schedule created successfully
        400: Missing required fields
        404: Doctor not found
        500: Server error
    """
    try:
        data = request.get_json() or {}

        doctor_id = data.get("doctorId")
        doctor_full_name = data.get("doctorFullName")
        available_date = data.get("availableDate")
        available_initial_time = data.get("availableInitialTime")
        available_final_time = data.get("availableFinalTime")

        # Resolve doctor_id if missing but doctor_full_name provided
        if not doctor_id and doctor_full_name:
            search_pat = f"%{doctor_full_name.strip()}%"
            doc = Doctor.query.filter(
                or_(
                    (Doctor.doctor_first_name + " " + Doctor.doctor_last_name).ilike(doctor_full_name.strip()),
                    Doctor.doctor_first_name.ilike(search_pat),
                    Doctor.doctor_last_name.ilike(search_pat),
                )
            ).first()
            if doc:
                doctor_id = doc.doctor_id
                doctor_full_name = doc.doctor_full_name

        if not all([doctor_id, doctor_full_name, available_date, available_initial_time, available_final_time]):
            return jsonify({"error": "Missing required fields"}), 400

        doctor = Database.session.get(Doctor, int(doctor_id))
        if not doctor:
            return jsonify({"error": "Doctor not found"}), 404

        if not doctor_full_name:
            doctor_full_name = doctor.doctor_full_name

        new_schedule = DoctorSchedule(
            doctor_id=int(doctor_id),
            doctor_full_name=doctor_full_name,
            available_date=available_date,
            available_initial_time=available_initial_time,
            available_final_time=available_final_time,
        )

        Database.session.add(new_schedule)
        Database.session.commit()

        return jsonify({
            "message": "Doctor schedule added successfully",
            "schedule_id": new_schedule.schedule_id,
        }), 201

    except Exception as e:
        Database.session.rollback()
        return jsonify({"error": str(e)}), 500


@Application.route("/doctor_schedule/<int:doctor_id>", methods=["GET"])
def get_doctor_schedules(doctor_id):
    """
    Retrieves active / upcoming schedules for a given doctor ID.
    Schedules whose date and time have passed real time are filtered out by default,
    while remaining safely saved in the backend database model.

    Path Parameters:
        doctor_id (int): Doctor identifier

    Query Parameters:
        include_past (bool, optional): If 'true', includes past schedules.

    Returns:
        200: List of doctor schedules
    """
    try:
        include_past = request.args.get("include_past", "false").lower() == "true"
        query = DoctorSchedule.query.filter_by(doctor_id=doctor_id)

        if not include_past:
            now = datetime.now()
            today = date.today()
            current_time = now.time()
            query = query.filter(
                or_(
                    DoctorSchedule.available_date > today,
                    (DoctorSchedule.available_date == today) & (DoctorSchedule.available_final_time >= current_time)
                )
            )

        schedules = query.order_by(DoctorSchedule.available_date.asc(), DoctorSchedule.available_initial_time.asc()).all()
        return jsonify([schedule.to_dict() for schedule in schedules]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@Application.route("/doctor_schedule/all_schedules", methods=["GET"])
def get_all_doctor_schedules():
    """
    Retrieves doctor schedules across all physicians.
    Schedules that have passed the current real time are omitted by default from existing schedules,
    while remaining safely saved in the backend model database. Pass ?include_past=true to view all.

    Query Parameters:
        include_past (bool, optional): If 'true', includes historical/passed schedules.

    Returns:
        200: List of doctor schedules
    """
    try:
        include_past = request.args.get("include_past", "false").lower() == "true"
        query = DoctorSchedule.query

        if not include_past:
            now = datetime.now()
            today = date.today()
            current_time = now.time()
            query = query.filter(
                or_(
                    DoctorSchedule.available_date > today,
                    (DoctorSchedule.available_date == today) & (DoctorSchedule.available_final_time >= current_time)
                )
            )

        schedules = query.order_by(DoctorSchedule.available_date.asc(), DoctorSchedule.available_initial_time.asc()).all()
        return jsonify([schedule.to_dict() for schedule in schedules]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@Application.route("/doctor_schedule/delete/<int:schedule_id>", methods=["DELETE"])
def delete_doctor_schedule(schedule_id):
    """
    Deletes a doctor availability schedule by ID.

    Path Parameters:
        schedule_id (int): Schedule ID to delete

    Returns:
        200: Schedule deleted successfully
        404: Schedule not found
        500: Server error
    """
    try:
        schedule = Database.session.get(DoctorSchedule, int(schedule_id))
        if not schedule:
            return jsonify({"error": "Schedule not found"}), 404

        Database.session.delete(schedule)
        Database.session.commit()

        return jsonify({"message": "Doctor schedule deleted successfully"}), 200

    except Exception as e:
        Database.session.rollback()
        return jsonify({"error": str(e)}), 500


# =============================================================================
# PRESCRIPTION ENDPOINTS
# =============================================================================

@Application.route("/prescription/add_prescription", methods=["POST"])
def add_prescription():
    """
    Creates a new medical prescription record.

    JSON Request Body:
        patientId (int, optional): Unique ID of patient
        patientName (str): Full name of the patient
        age (int, optional): Patient age
        doctorName (str): Attending physician full name
        problem (str, optional): Chief complaint / diagnosis subject
        description (str, optional): Detailed symptoms & clinical notes
        medicines (list or str, optional): Prescribed medicines and dosages
        solution (str, optional): Prescribed treatment or solution
        notes (str, optional): Additional clinical instructions
        appointmentDate (str, optional): Next follow-up appointment in YYYY-MM-DD
        includeSurgery (bool, optional): Whether surgical procedure is included
        isAuthorized (bool, optional): Doctor confirmation and authorization state
        assignedStaff (list or str, optional): Assigned medical team / nurses
        surgeryPreparation (str, optional): Pre-operative preparation details
        surgeryProcess (str, optional): Surgical operative technique & instructions
        surgicalProcedure (dict, optional): Nested surgical procedure object

    Returns:
        201: Prescription created successfully
        400: Missing required fields (patientName)
        500: Server error
    """
    try:
        data = request.get_json() or {}

        patient_id = data.get("patientId") or data.get("patient_id")
        patient_name = data.get("patientName") or data.get("patient_name")
        age = data.get("age")
        doctor_name = data.get("doctorName") or data.get("doctor_name")
        problem = data.get("problem")
        description = data.get("description")
        solution = data.get("solution")
        notes = data.get("notes")
        appointment_date = data.get("appointmentDate") or data.get("appointment_date")

        # Handle medicines list serialization
        medicines_data = data.get("medicines")
        if isinstance(medicines_data, (list, dict)):
            medicines_str = json.dumps(medicines_data)
        else:
            medicines_str = str(medicines_data) if medicines_data else None

        # Handle nested or flat surgical procedure attributes
        surgical_obj = data.get("surgicalProcedure") or data.get("surgical_procedure") or {}
        include_surgery = bool(data.get("includeSurgery") or data.get("include_surgery") or surgical_obj.get("included"))
        is_authorized = bool(data.get("isAuthorized") or data.get("is_authorized") or surgical_obj.get("authorized"))

        assigned_staff_data = (
            data.get("assignedStaff")
            or data.get("assigned_staff")
            or surgical_obj.get("assignedStaff")
            or surgical_obj.get("assigned_staff")
        )
        if isinstance(assigned_staff_data, (list, dict)):
            assigned_staff_str = json.dumps(assigned_staff_data)
        else:
            assigned_staff_str = str(assigned_staff_data) if assigned_staff_data else None

        surgery_prep = (
            data.get("surgeryPreparation")
            or data.get("surgery_preparation")
            or surgical_obj.get("preparation")
        )
        surgery_proc = (
            data.get("surgeryProcess")
            or data.get("surgery_process")
            or surgical_obj.get("process")
        )
        surgery_date = (
            data.get("surgeryDate")
            or data.get("surgery_date")
            or surgical_obj.get("surgeryDate")
            or surgical_obj.get("surgery_date")
        )
        surgery_time = (
            data.get("surgeryTime")
            or data.get("surgery_time")
            or surgical_obj.get("surgeryTime")
            or surgical_obj.get("surgery_time")
        )

        if not patient_name:
            return jsonify({"error": "Patient name is required"}), 400

        # Fallback default doctor name if not provided
        if not doctor_name:
            doctor_name = "Dr. Consulting Physician"

        # Validate age integer
        parsed_age = None
        if age is not None and str(age).strip() != "":
            try:
                parsed_age = int(age)
            except ValueError:
                parsed_age = None

        # Check for exclusive surgical time slot conflict
        if include_surgery and surgery_date and surgery_time:
            parsed_s_date = _to_date(surgery_date)
            parsed_s_time = _to_time(surgery_time)
            if parsed_s_date and parsed_s_time:
                conflicting = Prescription.query.filter(
                    Prescription.include_surgery == True,
                    Prescription.surgery_date == parsed_s_date,
                    Prescription.surgery_time == parsed_s_time,
                ).first()

                if conflicting:
                    return jsonify({
                        "error": f"Surgery time slot ({surgery_time} on {surgery_date}) is already allocated exclusively to patient '{conflicting.patient_name}'. Please select an alternate time duration.",
                        "conflict": True,
                        "conflicting_patient": conflicting.patient_name,
                        "booked_date": str(surgery_date),
                        "booked_time": str(surgery_time),
                    }), 409

        new_prescription = Prescription(
            patient_id=int(patient_id) if patient_id else None,
            patient_name=patient_name.strip(),
            age=parsed_age,
            doctor_name=doctor_name.strip(),
            problem=problem.strip() if problem else None,
            description=description.strip() if description else None,
            medicines=medicines_str,
            solution=solution.strip() if solution else None,
            notes=notes.strip() if notes else None,
            appointment_date=appointment_date if appointment_date else None,
            include_surgery=include_surgery,
            is_authorized=is_authorized,
            surgery_date=surgery_date if surgery_date else None,
            surgery_time=surgery_time if surgery_time else None,
            assigned_staff=assigned_staff_str,
            surgery_preparation=surgery_prep.strip() if surgery_prep else None,
            surgery_process=surgery_proc.strip() if surgery_proc else None,
            prescription_date=date.today(),
        )

        Database.session.add(new_prescription)
        Database.session.commit()

        return jsonify({
            "message": "Prescription created successfully",
            "prescription_id": new_prescription.prescription_id,
        }), 201

    except Exception as e:
        Database.session.rollback()
        return jsonify({"error": str(e)}), 500


@Application.route("/prescription/all_prescriptions", methods=["GET"])
def all_prescriptions():
    """
    Retrieves all prescription records ordered by most recent date.

    Returns:
        200: List of all prescription records
    """
    try:
        prescriptions = (
            Prescription.query.order_by(
                Prescription.prescription_date.desc(),
                Prescription.prescription_id.desc()
            ).all()
        )
        return jsonify([pr.to_dict() for pr in prescriptions]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@Application.route("/prescription/scheduled_surgeries", methods=["GET"])
def get_scheduled_surgeries():
    """
    Retrieves all prescriptions that include scheduled surgical procedures.

    Returns:
        200: List of scheduled surgical prescription records
    """
    try:
        surgeries = (
            Prescription.query.filter_by(include_surgery=True)
            .order_by(
                Prescription.surgery_date.asc(),
                Prescription.prescription_date.desc(),
                Prescription.prescription_id.desc()
            ).all()
        )
        return jsonify([s.to_dict() for s in surgeries]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@Application.route("/prescription/<int:prescription_id>", methods=["GET"])
def get_prescription(prescription_id):
    """
    Retrieves a single prescription record by unique ID.

    Path Parameters:
        prescription_id (int): Prescription identifier

    Returns:
        200: Prescription object
        404: Prescription not found
        500: Server error
    """
    try:
        prescription = Database.session.get(Prescription, int(prescription_id))
        if not prescription:
            return jsonify({"error": "Prescription not found"}), 404
        return jsonify(prescription.to_dict()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@Application.route("/prescription/patient/<int:patient_id>", methods=["GET"])
def patient_prescriptions(patient_id):
    """
    Retrieves all prescription records for a specific patient ID.

    Path Parameters:
        patient_id (int): Patient identifier

    Returns:
        200: List of patient prescriptions
        500: Server error
    """
    try:
        prescriptions = (
            Prescription.query.filter_by(patient_id=int(patient_id))
            .order_by(Prescription.prescription_date.desc(), Prescription.prescription_id.desc())
            .all()
        )
        return jsonify([pr.to_dict() for pr in prescriptions]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@Application.route("/prescription/delete/<int:prescription_id>", methods=["DELETE"])
def delete_prescription(prescription_id):
    """
    Deletes an existing prescription record by ID.

    Path Parameters:
        prescription_id (int): Prescription ID to delete

    Returns:
        200: Prescription deleted successfully
        404: Prescription not found
        500: Server error
    """
    try:
        prescription = Database.session.get(Prescription, int(prescription_id))
        if not prescription:
            return jsonify({"error": "Prescription not found"}), 404

        Database.session.delete(prescription)
        Database.session.commit()

        return jsonify({"message": "Prescription deleted successfully"}), 200
    except Exception as e:
        Database.session.rollback()
        return jsonify({"error": str(e)}), 500


# =============================================================================
# DOCTOR FEEDBACK ENDPOINTS
# =============================================================================

@Application.route("/feedback/add_feedback", methods=["POST"])
def add_feedback():
    """
    Creates a new doctor feedback record for a patient.
    Supports both JSON and Multipart Form Data (with optional stamp image file).

    Request Parameters (JSON or Multipart Form):
        patientId (int, optional): Patient identifier
        patientName (str): Patient full name
        doctorName (str, optional): Attending doctor's name
        subject (str): Feedback / diagnosis subject
        description (str): Detailed feedback notes
        stampImage (File, optional): Uploaded stamp / signature image file

    Returns:
        201: Feedback created successfully
        400: Missing required fields (patientName, subject, description)
        500: Server error
    """
    try:
        # Determine whether request is JSON or multipart/form-data
        if request.is_json:
            data = request.get_json() or {}
            stamp_filename = data.get("stampImage") or data.get("stamp_image")
        else:
            data = request.form.to_dict()
            stamp_file = request.files.get("stampImage") or request.files.get("stamp_image") or request.files.get("file")
            stamp_filename = None

            if stamp_file and stamp_file.filename:
                upload_folder = os.path.join(os.path.abspath(os.path.dirname(__file__)), "feedback_stamps")
                os.makedirs(upload_folder, exist_ok=True)
                stamp_filename = secure_filename(stamp_file.filename)
                filepath = os.path.join(upload_folder, stamp_filename)
                stamp_file.save(filepath)

        patient_id = data.get("patientId") or data.get("patient_id")
        patient_name = data.get("patientName") or data.get("patient_name")
        doctor_name = data.get("doctorName") or data.get("doctor_name")
        subject = data.get("subject")
        description = data.get("description")

        if not all([patient_name, subject, description]):
            return jsonify({"error": "Missing required fields (patientName, subject, description)"}), 400

        if not doctor_name:
            doctor_name = "Dr. Consulting Physician"

        booking_id = data.get("bookingId") or data.get("booking_id")
        if booking_id:
            bk = Database.session.get(Booking, int(booking_id))
            if bk:
                bk.status = "Completed"
        else:
            if patient_id:
                p = Database.session.get(Patient, int(patient_id))
                if p:
                    bk = Booking.query.filter(
                        or_(
                            Booking.telephone == p.telephone,
                            (func.lower(Booking.first_name) == p.first_name.lower()) & (func.lower(Booking.last_name) == p.last_name.lower())
                        )
                    ).order_by(Booking.booking_id.desc()).first()
                    if bk:
                        bk.status = "Completed"
                        booking_id = bk.booking_id

        new_feedback = Feedback(
            booking_id=int(booking_id) if booking_id else None,
            patient_id=int(patient_id) if patient_id else None,
            patient_name=patient_name.strip(),
            doctor_name=doctor_name.strip(),
            subject=subject.strip(),
            description=description.strip(),
            stamp_image=stamp_filename,
            feedback_date=date.today(),
        )

        Database.session.add(new_feedback)
        Database.session.commit()

        return jsonify({
            "message": "Feedback submitted successfully",
            "feedback_id": new_feedback.feedback_id,
            "booking_id": booking_id,
        }), 201

    except Exception as e:
        Database.session.rollback()
        return jsonify({"error": str(e)}), 500


@Application.route("/feedback/all_feedbacks", methods=["GET"])
def all_feedbacks():
    """
    Retrieves all doctor feedback records ordered by most recent date.

    Returns:
        200: List of all feedback records
    """
    try:
        feedbacks = (
            Feedback.query.order_by(
                Feedback.feedback_date.desc(),
                Feedback.feedback_id.desc()
            ).all()
        )
        return jsonify([fb.to_dict() for fb in feedbacks]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@Application.route("/feedback/<int:feedback_id>", methods=["GET"])
def get_feedback(feedback_id):
    """
    Retrieves a single doctor feedback record by unique ID.

    Path Parameters:
        feedback_id (int): Feedback identifier

    Returns:
        200: Feedback object
        404: Feedback not found
        500: Server error
    """
    try:
        feedback_obj = Database.session.get(Feedback, int(feedback_id))
        if not feedback_obj:
            return jsonify({"error": "Feedback not found"}), 404
        return jsonify(feedback_obj.to_dict()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@Application.route("/feedback/patient/<int:patient_id>", methods=["GET"])
def patient_feedbacks(patient_id):
    """
    Retrieves all feedback records for a specific patient ID.

    Path Parameters:
        patient_id (int): Patient identifier

    Returns:
        200: List of patient feedback records
        500: Server error
    """
    try:
        feedbacks = (
            Feedback.query.filter_by(patient_id=int(patient_id))
            .order_by(Feedback.feedback_date.desc(), Feedback.feedback_id.desc())
            .all()
        )
        return jsonify([fb.to_dict() for fb in feedbacks]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@Application.route("/feedback/delete/<int:feedback_id>", methods=["DELETE"])
def delete_feedback(feedback_id):
    """
    Deletes an existing doctor feedback record by ID.

    Path Parameters:
        feedback_id (int): Feedback ID to delete

    Returns:
        200: Feedback deleted successfully
        404: Feedback not found
        500: Server error
    """
    try:
        feedback_obj = Database.session.get(Feedback, int(feedback_id))
        if not feedback_obj:
            return jsonify({"error": "Feedback not found"}), 404

        Database.session.delete(feedback_obj)
        Database.session.commit()

        return jsonify({"message": "Feedback deleted successfully"}), 200
    except Exception as e:
        Database.session.rollback()
        return jsonify({"error": str(e)}), 500


@Application.route("/feedback_stamps/<path:filename>", methods=["GET"])
def serve_feedback_stamp(filename):
    """
    Serves uploaded doctor stamp / signature images securely.

    Path Parameters:
        filename (str): Stamp image file name
    """
    clean = filename.replace("\\", "/")
    if clean.startswith("feedback_stamps/"):
        clean = clean[len("feedback_stamps/"):]

    base_dir = os.path.abspath(os.path.dirname(__file__))
    admin_dir = os.path.join(base_dir, "Submitted_Files", "feedback_stamps")
    api_dir = os.path.join(base_dir, "feedback_stamps")

    for dir_path in [admin_dir, api_dir]:
        if os.path.isfile(os.path.join(dir_path, clean)):
            return send_from_directory(dir_path, clean)

    return jsonify({"error": "Stamp file not found"}), 404


# =============================================================================
def ensure_schema_migrations():
    """Ensures newly added table columns exist in SQLite without breaking live data."""
    try:
        from sqlalchemy import text
        with Database.engine.connect() as conn:
            # Prescription migrations
            res = conn.execute(text("PRAGMA table_info(prescription)")).fetchall()
            cols = [r[1] for r in res]
            if cols:
                if "surgery_date" not in cols:
                    conn.execute(text("ALTER TABLE prescription ADD COLUMN surgery_date DATE"))
                if "surgery_time" not in cols:
                    conn.execute(text("ALTER TABLE prescription ADD COLUMN surgery_time TIME"))

            # Booking migrations
            res_b = conn.execute(text("PRAGMA table_info(booking)")).fetchall()
            b_cols = [r[1] for r in res_b]
            if b_cols:
                if "nic" not in b_cols:
                    conn.execute(text("ALTER TABLE booking ADD COLUMN nic VARCHAR(20)"))
                if "status" not in b_cols:
                    conn.execute(text("ALTER TABLE booking ADD COLUMN status VARCHAR(20) DEFAULT 'Booked'"))

            # Payment migrations
            res_p = conn.execute(text("PRAGMA table_info(payment)")).fetchall()
            p_cols = [r[1] for r in res_p]
            if p_cols:
                if "booking_id" not in p_cols:
                    conn.execute(text("ALTER TABLE payment ADD COLUMN booking_id INTEGER"))

            # Feedback migrations
            res_f = conn.execute(text("PRAGMA table_info(feedback)")).fetchall()
            f_cols = [r[1] for r in res_f]
            if f_cols:
                if "booking_id" not in f_cols:
                    conn.execute(text("ALTER TABLE feedback ADD COLUMN booking_id INTEGER"))

            conn.commit()
    except Exception as e:
        print("Schema migration notice:", e)


_migrations_run = False


@Application.before_request
def run_migrations_once():
    """Runs schema migrations on the first incoming request seamlessly without manual restart."""
    global _migrations_run
    if not _migrations_run:
        ensure_schema_migrations()
        _migrations_run = True


if __name__ == "__main__":
    with Application.app_context():
        Database.create_all()
        ensure_schema_migrations()
    init_admin(Application)
    Application.run(debug=True, host="0.0.0.0", port=5000)