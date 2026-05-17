from flask import request, jsonify, redirect
from werkzeug.security import generate_password_hash, check_password_hash
from config import Application, Database
from admin import init_admin
from models import Patient, Booking, Login, UserRole, Nurse, Doctor
# from login import login_access

# login_access(Application)

# =========================
# ADD PATIENT
# =========================

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
    return jsonify([patient.to_dict() for patient in patients])


# =========================
# DELETE PATIENT
# =========================


@Application.route("/patient/delete/<nic>", methods=["DELETE"])
def delete_patient(nic):
    try:
        patient = Patient.query.get(nic)
        if not patient:
            return jsonify({"error": "Patient not found"}), 404

        Database.session.delete(patient)
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
    return jsonify([booking.to_dict() for booking in bookings])




@Application.route("/login", methods=["POST"])
def login():
        try:
            data = request.get_json()

            username = data.get("username")
            password = data.get("password")
            role = data.get("role")

            # Check required fields
            if not all([username, password, role]):
                return jsonify({"error": "Missing required fields"}), 400

            # Check user in database
            existing_user = Login.query.filter_by(username=username,password=password,role=role).first()

            # If user exists
            if existing_user:
                return jsonify({"message": "Successfully Logged In"}), 200

            # If user not found
            return jsonify({"error": "Invalid username, password, or role"}), 401

        except Exception as e:
            Database.session.rollback()
            return jsonify({"error": str(e)}), 500
    
# =========================
# MAIN
# =========================

if __name__ == "__main__":

    with Application.app_context():
        Database.create_all()

    init_admin(Application)

    Application.run(debug=True, host="0.0.0.0", port=5000)
