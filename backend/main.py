import binascii
import hashlib

from flask import request, jsonify
from werkzeug.security import check_password_hash, generate_password_hash
from sqlalchemy import func, or_
from sqlalchemy.exc import IntegrityError
from config import Application, Database
from admin import init_admin
from models import Patient, Booking, Login, UserRole, Doctor, Nurse

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


# =========================
# DELETE PATIENT
# =========================


@Application.route("/patient/delete/<int:patient_id>", methods=["DELETE"])
def delete_patient(patient_id):
    try:
        patient = Patient.query.get(patient_id)
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
        patient = Patient.query.filter_by(
            first_name=first_name, last_name=last_name, telephone=telephone
        ).first()

        # Create patient only if not found
        if not patient:
            patient = Patient(
                first_name=first_name,
                last_name=last_name,
                nic=None,
                dob=None,
                address=None,
                telephone=telephone,
                email=None,
            )

            Database.session.add(patient)
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


def seed_default_doctors():
    if Doctor.query.count() == 0:
        Database.session.add_all([
            Doctor(doctor_first_name="Leanne", doctor_last_name="Walker"),
            Doctor(doctor_first_name="Sanjay", doctor_last_name="Patel"),
            Doctor(doctor_first_name="Aisha", doctor_last_name="Khan"),
            Doctor(doctor_first_name="John", doctor_last_name="Doe"),
            Doctor(doctor_first_name="Emma", doctor_last_name="Brown"),
        ])
        Database.session.commit()


# =========================
# MAIN
# =========================



if __name__ == "__main__":
    with Application.app_context():
        Database.create_all()
        seed_default_doctors()
    init_admin(Application)
    Application.run(debug=True, host="0.0.0.0", port=5000)
