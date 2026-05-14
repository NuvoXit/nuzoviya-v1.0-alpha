from flask import request, jsonify, redirect
from werkzeug.security import generate_password_hash, check_password_hash
from config import Application, db
from admin import init_admin
from models import Patient, Booking, Login, UserRole
from flask_login import login_required
from login import login_acess

login_access(Application)

# @Application.route("/", methods=["GET"])
# def Application():
#     return send_from_directory(frontend_dist, "index.html")
# =========================
# ADD PATIENT
# =========================

@login_required
@Application.route("/patient/add_patient", methods=["POST"])
def add_patient():
    try:
        data = request.get_json()
        patient_id = data.get("NIC") or data.get("patientID") or data.get("PatientID")
        first_name = data.get("firstName")
        last_name = data.get("lastName")
        DOB = data.get("DOB") or data.get("dob")
        address = data.get("address")
        telephone = data.get("telephone")
        email = data.get("email")

        if not all([patient_id, first_name, last_name, DOB, address, telephone, email]):
            return jsonify({"error": "Missing required fields"}), 400

        existing_patient = Patient.query.get(patient_id)

        if existing_patient:
            return jsonify({"error": "Patient already exists"}), 409

        new_patient = Patient(
            NIC=patient_id,
            first_name=first_name,
            last_name=last_name,
            DOB=DOB,
            address=address,
            telephone=telephone,
            email=email,
        )

        db.session.add(new_patient)
        db.session.commit()

        return jsonify({"message": "Patient added successfully"}), 201

    except Exception as e:

        db.session.rollback()

        return jsonify({"error": str(e)}), 500


# =========================
# GET ALL PATIENTS
# =========================

@login_required
@Application.route("/patient/all_patients", methods=["GET"])
def all_patients():
    patients = Patient.query.all()
    return jsonify([patient.to_dict() for patient in patients])


# =========================
# DELETE PATIENT
# =========================

@login_required
@Application.route("/patient/delete/<nic>", methods=["DELETE"])
def delete_patient(nic):
    try:
        patient = Patient.query.get(nic)
        if not patient:
            return jsonify({"error": "Patient not found"}), 404

        db.session.delete(patient)
        db.session.commit()
        return jsonify({"message": "Patient deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# =========================
# ADD BOOKING
# =========================

@login_required
@Application.route("/booking/add_booking", methods=["POST"])
def add_booking():

    try:

        data = request.get_json()

        first_name = data.get("firstName")
        last_name = data.get("lastName")
        telephone = data.get("telephone")
        patient_id = data.get("patientID")
        doctor_name = data.get("doctorName")
        appointment_date = data.get("appointmentDate")
        appointment_time = data.get("appointmentTime")

        if not all(
            [
                first_name,
                last_name,
                telephone,
                patient_id,
                doctor_name,
                appointment_date,
                appointment_time,
            ]
        ):
            return jsonify({"error": "Missing required fields"}), 400

        patient = Patient.query.get(patient_id)

        if not patient:
            return jsonify({"error": "Patient not found"}), 404

        new_booking = Booking(
            first_name=first_name,
            last_name=last_name,
            telephone=telephone,
            patient_nic=patient_id,
            doctor_name=doctor_name,
            appointment_date=appointment_date,
            appointment_time=appointment_time,
        )

        db.session.add(new_booking)
        db.session.commit()

        return jsonify({"message": "Booking added successfully"}), 201

    except Exception as e:

        db.session.rollback()

        return jsonify({"error": str(e)}), 500


# =========================
# GET ALL BOOKINGS
# =========================

@login_required
@Application.route("/booking/all_bookings", methods=["GET"])
def all_bookings():
    bookings = Booking.query.all()
    return jsonify([booking.to_dict() for booking in bookings])


# =========================
# MAIN
# =========================

if __name__ == "__main__":

    with Application.app_context():
        db.create_all()

    init_admin(Application)

    Application.run(debug=True, host="0.0.0.0", port=5000)
