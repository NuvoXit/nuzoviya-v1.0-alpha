from flask import request, jsonify
from werkzeug.security import check_password_hash, generate_password_hash
from sqlalchemy import or_
from datetime import date
from config import Application, Database
from admin import init_admin
from models import Patient, Booking, Login, Payment, UserRole, Doctor, Nurse
from models import LabRecord, XrayRecord, MLT, Radiologist, DoctorSchedule


# =========================
# ROUTES
# =========================


@Application.route("/", methods=["GET"])
def main():
    return {"message": "First Page of Nuvo Medical Platform Backend"}


@Application.route("/home", methods=["GET"])
def home():
    return {"message": "Welcome to the Home Page"}


@Application.route("/patient", methods=["GET"])
def patient():
    return {"message": "Welcome to the Patient Page"}


@Application.route("/booking", methods=["GET"])
def booking():
    return {"message": "Welcome to the Booking Page"}


# =========================
# ADD PATIENT
# =========================


@Application.route("/patient/add_patient", methods=["POST"])
def add_patient():
    try:
        data = request.get_json()

        first_name = data.get("firstName")
        last_name = data.get("lastName")
        nic = data.get("nic")
        dob = data.get("dob")
        address = data.get("address")
        telephone = data.get("telephone")
        email = data.get("email")

        if not all([first_name, last_name, nic, dob, address, telephone, email]):
            return jsonify({"error": "Missing required fields"}), 400

        if Patient.query.filter_by(nic=nic).first():
            return jsonify({"error": "Patient with this NIC already exists"}), 409

        new_patient = Patient(
            first_name=first_name,
            last_name=last_name,
            nic=nic,
            dob=dob,
            address=address,
            telephone=telephone,
            email=email,
        )

        Database.session.add(new_patient)
        Database.session.commit()
        return jsonify({"message": "Patient added successfully"}), 201

    except Exception as e:
        Database.session.rollback()
        return jsonify({"error": str(e)}), 500


# =========================
# GET ALL PATIENTS
# =========================


@Application.route("/patient/all_patients", methods=["GET"])
def all_patients():
    patients = Patient.query.all()
    return jsonify([p.to_dict() for p in patients])


@Application.route("/patient/<int:patient_id>", methods=["GET"])
def get_patient(patient_id):
    patient = Patient.query.get(patient_id)
    if not patient:
        return jsonify({"error": "Patient not found"}), 404
    return jsonify(patient.to_dict())


# =========================
# GET PAYMENTS FOR A PATIENT
# =========================
@Application.route("/payments", methods=["GET"])
def all_payments():
    payments = Payment.query.all()
    return jsonify([pa.to_dict() for pa in payments])


@Application.route("/payments/mlt", methods=["GET"])
def mlt_payments():
    payments = (
        Payment.query.filter(Payment.mlt_fee >= Payment.MLT_FEE)
        .order_by(Payment.payment_date.desc(), Payment.payment_id.desc())
        .all()
    )
    return jsonify([pa.to_dict() for pa in payments])


@Application.route("/payments/radiologist", methods=["GET"])
def radiologist_payments():
    payments = (
        Payment.query.filter(Payment.radiologist_fee >= Payment.RADIOLOGIST_FEE)
        .order_by(Payment.payment_date.desc(), Payment.payment_id.desc())
        .all()
    )
    return jsonify([pa.to_dict() for pa in payments])




# =========================
# DELETE PATIENT
# =========================

@Application.route("/patient/delete/<int:patient_id>", methods=["DELETE"])
def delete_patient(patient_id):
    try:
        existing_patient = Patient.query.get(patient_id)
        if not existing_patient:
            return jsonify({"error": "Patient not found"}), 404
        Database.session.delete(existing_patient)
        Database.session.commit()
        return jsonify({"message": "Patient deleted successfully"}), 200
    except Exception as e:
        Database.session.rollback()
        return jsonify({"error": str(e)}), 500


# =========================
# ADD BOOKING
# =========================

@Application.route("/booking/add_booking", methods=["POST"])
def add_booking():
    try:
        data = request.get_json()

        first_name = data.get("firstName")
        last_name = data.get("lastName")
        telephone = data.get("telephone")
        doctor_name = data.get("doctorName")
        appointment_date = data.get("appointmentDate")
        appointment_time = data.get("appointmentTime")

        # Validate required fields
        if not all(
            [
                first_name,
                last_name,
                telephone,
                doctor_name,
                appointment_date,
                appointment_time,
            ]
        ):
            return jsonify({"error": "Missing required fields"}), 400

        # Remove extra spaces
        first_name = first_name.strip()
        last_name = last_name.strip()
        telephone = telephone.strip()

        # Check if patient exists
        existing_patient = Patient.query.filter_by(
            first_name=first_name, last_name=last_name, telephone=telephone
        ).first()

        # Create patient only if not found
        if not existing_patient:
            existing_patient = Patient(
                first_name=first_name,
                last_name=last_name,
                nic=None,
                dob=None,
                address=None,
                telephone=telephone,
                email=None,
            )

            Database.session.add(existing_patient)
            Database.session.commit()

        # Create booking
        new_booking = Booking(
            first_name=first_name,
            last_name=last_name,
            telephone=telephone,
            doctor_name=doctor_name,
            appointment_date=appointment_date,
            appointment_time=appointment_time,
        )

        Database.session.add(new_booking)
        Database.session.commit()

        return jsonify({"message": "Booking added successfully"}), 201

    except Exception as e:
        Database.session.rollback()
        return jsonify({"error": str(e)}), 500


# =========================
# GET ALL BOOKINGS
# =========================


@Application.route("/booking/all_bookings", methods=["GET"])
def all_bookings():
    bookings = Booking.query.all()
    return jsonify([b.to_dict() for b in bookings])


@Application.route("/nurse/all_nurses", methods=["GET"])
def all_nurses():
    nurses = Nurse.query.all()
    return jsonify([n.to_dict() for n in nurses])

# @Application.route("payment/all_payments", methods=["GET"])

@Application.route("/login", methods=["POST"])
def login():
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

        password_valid = False
        try:
            password_valid = check_password_hash(existing_user.password, password)
        except (ValueError, TypeError):
            password_valid = False

        if not password_valid and existing_user.password == password:
            password_valid = True

        

        if password_valid:
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


# =========================
# Search Doctors
# =========================
@Application.route("/booking/search_doctors", methods=["GET"])
def search_doctors():
    try:
        query = request.args.get("query", "").strip()

        if not query:
            return jsonify([])

        search_pattern = f"%{query}%"
        full_name_expr = Doctor.doctor_first_name + " " + Doctor.doctor_last_name
        Doctors = Doctor.query.filter(
            or_(
                full_name_expr.ilike(search_pattern),
                Doctor.doctor_first_name.ilike(search_pattern),
                Doctor.doctor_last_name.ilike(search_pattern),
            )
        ).all()

        return jsonify([d.to_dict() for d in Doctors])

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =========================
# Payment Route
# =========================
@Application.route("/payment", methods=["POST"])
def payment():
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

        # Validate required fields
        if not all([first_name, last_name, telephone]):
            return jsonify({"error": "Missing required fields"}), 400

        total_amount = 0
        if hospital_fee_selected:
            total_amount += 500
        if doctor_fee_selected:
            total_amount += 2000
        if mlt_fee_selected:
            total_amount += 1000
        if radiologist_fee_selected:
            total_amount += 1000

        if additional_charge:
            total_amount += additional_charge

        
        # Remove extra spaces
        first_name = first_name.strip()
        last_name = last_name.strip()
        telephone = telephone.strip()

        # Check if patient exists
        existing_patient = Patient.query.filter_by(
            first_name=first_name, last_name=last_name, telephone=telephone
        ).first()

        # Create patient only if not found
        if not existing_patient:
            new_patient = Patient(
                first_name=first_name,
                last_name=last_name,
                telephone=telephone,
            )

            Database.session.add(new_patient)
            Database.session.commit()

        # Create payment record
        new_payment = Payment(
            first_name=first_name,
            last_name=last_name,
            telephone=telephone,
            hospital_fee=500 if hospital_fee_selected else 0,
            doctor_fee=2000 if doctor_fee_selected else 0,
            mlt_fee=1000 if mlt_fee_selected else 0,
            radiologist_fee=1000 if radiologist_fee_selected else 0,
            additional_reason=additional_reason,
            additional_charge=additional_charge,
            total_amount=total_amount,
            payment_date=payment_date,
        )

        Database.session.add(new_payment)
        Database.session.commit()

        return jsonify({"message": "Payment processed successfully"}), 201
    

    except Exception as e:
        Database.session.rollback()
        return jsonify({"error": str(e)}), 500

# =========================
# GET LAB RECORDS FOR A PATIENT
# =========================
from flask import send_from_directory
import os

@Application.route("/lab_records/all_lab_records", methods=["GET"])
def all_lab_records():
    LabRecords = LabRecord.query.all()
    return jsonify([lr.to_dict() for lr in LabRecords])


@Application.route("/lab_records/patient/<int:patient_id>", methods=["GET"])
def patient_lab_records(patient_id):
    LabRecords = LabRecord.query.filter_by(patient_id=patient_id).order_by(LabRecord.test_date.desc()).all()
    return jsonify([lr.to_dict() for lr in LabRecords])


@Application.route("/lab_reports/<path:filename>", methods=["GET"])
def serve_lab_report(filename):
    """Serve uploaded lab report files (PDF/images)."""
    # Normalize backslashes
    clean = filename.replace("\\", "/")

    # Strip doubled "lab_reports/" prefix
    if clean.startswith("lab_reports/"):
        clean = clean[len("lab_reports/"):]

    # Handle legacy DB values where secure_filename converted
    # "lab_reports/file.pdf" → "lab_reports_file.pdf"
    legacy_clean = None
    if clean.startswith("lab_reports_"):
        legacy_clean = clean[len("lab_reports_"):]

    base_dir = os.path.abspath(os.path.dirname(__file__))
    admin_dir = os.path.join(base_dir, "Submitted_Files", "lab_reports")
    api_dir = os.path.join(base_dir, "lab_reports")

    # Try each candidate filename against both directories
    candidates = [clean]
    if legacy_clean:
        candidates.append(legacy_clean)

    for name in candidates:
        if os.path.isfile(os.path.join(admin_dir, name)):
            return send_from_directory(admin_dir, name)
        if os.path.isfile(os.path.join(api_dir, name)):
            return send_from_directory(api_dir, name)

    return jsonify({"error": "File not found", "searched": candidates}), 404

# =========================
# ADD LAB RECORDS FOR A PATIENT (MLT)
# =========================
@Application.route("/lab_records/add_lab_record", methods=["POST"])
def add_lab_record():
    try:

        data = request.form.to_dict()
        # Get form data
        
        patient_id = data.get("patientId")
        patient_first_name = data.get("patientFirstName")
        patient_last_name = data.get("patientLastName")
        test_name = data.get("testName")
        test_result_file = request.files.get("testResult")
        
        # Validate required fields
        if not all([patient_id, test_name, test_result_file]):
            return jsonify({"error": "Missing required fields"}), 400
        
        # Check if patient exists
        patient = Patient.query.get(patient_id)
        if not patient:
            return jsonify({"error": "Patient not found"}), 404

        # Prevent duplicate: only one lab record per patient per payment
        existing_record = LabRecord.query.filter_by(patient_id=patient_id).first()
        if existing_record:
            return jsonify({"error": "A lab test has already been submitted for this patient"}), 409
        
        # Save uploaded file
        import os
        from werkzeug.utils import secure_filename
        
        upload_folder = "lab_reports"
        os.makedirs(upload_folder, exist_ok=True)
        
        filename = secure_filename(test_result_file.filename)
        filepath = os.path.join(upload_folder, filename)
        test_result_file.save(filepath)
        
        # Create lab record
        new_lab_record = LabRecord(
            patient_id=patient_id,
            patient_first_name=patient_first_name,
            patient_last_name=patient_last_name,
            test_name=test_name,
            test_date=date.today(),
            result=filename
        )
        
        Database.session.add(new_lab_record)
        Database.session.commit()
        
        return jsonify({"message": "Lab record created successfully", "test_id": new_lab_record.test_id}), 201
    
    except Exception as e:
        Database.session.rollback()
        return jsonify({"error": str(e)}), 500


# =========================
# GET X-RAY RECORDS
# =========================
@Application.route("/xray_records/all_xray_records", methods=["GET"])
def all_xray_records():
    records = XrayRecord.query.all()
    return jsonify([r.to_dict() for r in records])


@Application.route("/xray_records/patient/<int:patient_id>", methods=["GET"])
def patient_xray_records(patient_id):
    records = XrayRecord.query.filter_by(patient_id=patient_id).order_by(XrayRecord.xray_date.desc()).all()
    return jsonify([r.to_dict() for r in records])


@Application.route("/xray_reports/<path:filename>", methods=["GET"])
def serve_xray_report(filename):
    """Serve uploaded X-ray report files (PDF/images)."""
    clean = filename.replace("\\", "/")
    if clean.startswith("xray_reports/"):
        clean = clean[len("xray_reports/"):]

    base_dir = os.path.abspath(os.path.dirname(__file__))
    xray_dir = os.path.join(base_dir, "xray_reports")

    if os.path.isfile(os.path.join(xray_dir, clean)):
        return send_from_directory(xray_dir, clean)

    return jsonify({"error": "File not found"}), 404


# =========================
# ADD X-RAY RECORD (Radiologist)
# =========================
@Application.route("/xray_records/add_xray_record", methods=["POST"])
def add_xray_record():
    try:
        data = request.form.to_dict()

        patient_id = data.get("patientId")
        patient_first_name = data.get("patientFirstName")
        patient_last_name = data.get("patientLastName")
        xray_type = data.get("xrayType")
        xray_result_file = request.files.get("xrayResult")

        if not all([patient_id, xray_type, xray_result_file]):
            return jsonify({"error": "Missing required fields"}), 400

        patient = Patient.query.get(patient_id)
        if not patient:
            return jsonify({"error": "Patient not found"}), 404

        # Prevent duplicate: only one X-ray record per patient per payment
        existing_record = XrayRecord.query.filter_by(patient_id=patient_id).first()
        if existing_record:
            return jsonify({"error": "An X-ray has already been submitted for this patient"}), 409

        from werkzeug.utils import secure_filename

        upload_folder = "xray_reports"
        os.makedirs(upload_folder, exist_ok=True)

        filename = secure_filename(xray_result_file.filename)
        filepath = os.path.join(upload_folder, filename)
        xray_result_file.save(filepath)

        new_xray_record = XrayRecord(
            patient_id=patient_id,
            patient_first_name=patient_first_name,
            patient_last_name=patient_last_name,
            xray_type=xray_type,
            xray_date=date.today(),
            xray_result=filename,
        )

        Database.session.add(new_xray_record)
        Database.session.commit()

        return jsonify({"message": "X-ray record created successfully", "xray_id": new_xray_record.xray_id}), 201

    except Exception as e:
        Database.session.rollback()
        return jsonify({"error": str(e)}), 500




#add doctor schedule route
@Application.route("/doctor_schedule/add_schedule", methods=["POST"])
def add_doctor_schedule():
    try:
        data = request.get_json()

        schedule_id = data.get("scheduleId")
        doctor_id = data.get("doctorId")
        doctor_full_name = data.get("doctorFullName")
        available_date = data.get("availableDate")
        available_initial_time = data.get("availableInitialTime")
        available_final_time = data.get("availableFinalTime")

        if not all([doctor_id, doctor_full_name, available_date, available_initial_time, available_final_time]):
            return jsonify({"error": "Missing required fields"}), 400
        
        new_schedule = DoctorSchedule(
            doctor_id=doctor_id,
            doctor_full_name=doctor_full_name,
            available_date=available_date,
            available_initial_time=available_initial_time,
            available_final_time=available_final_time
        )

        Database.session.add(new_schedule)
        Database.session.commit()

        return jsonify({"message": "Doctor schedule added successfully", "schedule_id": new_schedule.schedule_id}), 201
    
    except Exception as e:
        Database.session.rollback()
        return jsonify({"error": str(e)}), 500
    
@Application.route("/doctor_schedule/<int:doctor_id>", methods=["GET"])
def get_doctor_schedules(doctor_id):
    try:
        schedules = DoctorSchedule.query.filter_by(doctor_id=doctor_id).order_by(DoctorSchedule.available_date.asc()).all()
        return jsonify([schedule.to_dict() for schedule in schedules])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# =========================
# Get All Doctor Schedules
# Added to automatically populate the Existing Schedules table on page load
# =========================
@Application.route("/doctor_schedule/all_schedules", methods=["GET"])
def get_all_doctor_schedules():
    try:
        schedules = DoctorSchedule.query.order_by(DoctorSchedule.available_date.asc()).all()
        return jsonify([schedule.to_dict() for schedule in schedules])
    except Exception as e:
        return jsonify({"error": str(e)}), 500



# =========================
# MAIN
# =========================
if __name__ == "__main__":
    with Application.app_context():
        Database.create_all()
        # seed_default_doctors()
    init_admin(Application)
    Application.run(debug=True, host="0.0.0.0", port=5000)