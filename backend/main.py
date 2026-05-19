from flask import request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from config import Application, db
from admin import init_admin
from models import Patient, Booking, Login, UserRole, Nurse, Doctor
# from login import login_access

login_access(Application)
CORS(Application)



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
        patient_id = data.get("NIC") or data.get("patientID") or data.get("PatientID")
        NIC =data.get("NIC") 
        first_name = data.get("firstName")
        last_name  = data.get("lastName")
        DOB        = data.get("DOB") or data.get("dob")
        address    = data.get("address")
        telephone  = data.get("telephone")
        email      = data.get("email")

        if not all([patient_id, first_name, last_name, DOB, address, telephone, email]):
            return jsonify({"error": "Missing required fields"}), 400

        if Patient.query.get(patient_id):
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

@Application.route("/patient/all_patients", methods=["GET"])
def all_patients():
    patients = Patient.query.all()
    return jsonify([p.to_dict() for p in patients])


# =========================
# DELETE PATIENT
# =========================

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

        if not Patient.query.get(patient_id):
            return jsonify({"error": "Patient not found"}), 404

        new_booking = Booking(
            first_name=first_name, last_name=last_name, telephone=telephone,
            patient_nic=patient_id, doctor_name=doctor_name,
            appointment_date=appointment_date, appointment_time=appointment_time,
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

@Application.route("/booking/all_bookings", methods=["GET"])
def all_bookings():
    bookings = Booking.query.all()
    return jsonify([b.to_dict() for b in bookings])




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
        db.create_all()
    init_admin(Application)
    Application.run(debug=True, host="0.0.0.0", port=5000)
