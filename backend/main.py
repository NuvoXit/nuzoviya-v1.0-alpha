from datetime import date, time, datetime
from flask import request, jsonify
from flask.views import MethodView
from config import app, db
from models import Patient, Booking
import login  # registers /login, /logout, /register routes onto the shared app


def parse_date(value):
    if isinstance(value, date):
        return value
    try:
        return datetime.strptime(value, '%Y-%m-%d').date()
    except (ValueError, TypeError):
        return None


def parse_time(value):
    if isinstance(value, time):
        return value
    for fmt in ('%H:%M:%S', '%H:%M'):
        try:
            return datetime.strptime(value, fmt).time()
        except (ValueError, TypeError):
            continue
    return None


# ── Patient Views ────────────────────────────────────────────────────────────

class PatientView(MethodView):
    def get(self):
        """Return all patients."""
        patients = Patient.query.all()
        return jsonify({'patients': [p.to_json() for p in patients]})

    def post(self):
        """Create a new patient."""
        data = request.json or {}
        first_name = data.get('first_name')
        last_name  = data.get('last_name')
        NIC        = data.get('NIC')
        DOB_raw    = data.get('DOB')
        address    = data.get('address')
        phone      = data.get('Tel_no')
        email      = data.get('email')

        if not all([first_name, last_name, NIC, DOB_raw, address, phone, email]):
            return jsonify({'error': 'Missing required fields'}), 400

        DOB = parse_date(DOB_raw)
        if DOB is None:
            return jsonify({'error': 'Invalid DOB format, expected YYYY-MM-DD'}), 400

        if Patient.query.get(NIC):
            return jsonify({'error': 'Patient with this NIC already exists'}), 409

        new_patient = Patient(
            first_name=first_name, last_name=last_name, NIC=NIC,
            DOB=DOB, address=address, telephone=phone, email=email,
        )
        try:
            db.session.add(new_patient)
            db.session.commit()
            return jsonify({'message': 'Patient created successfully'}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500


class PatientDetailView(MethodView):
    def delete(self, nic):
        """Delete a patient by NIC."""
        patient = Patient.query.get(nic)
        if not patient:
            return jsonify({'error': 'Patient not found'}), 404
        try:
            db.session.delete(patient)
            db.session.commit()
            return jsonify({'message': 'Patient deleted successfully'}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500


# ── Booking Views ────────────────────────────────────────────────────────────

class BookingView(MethodView):
    def get(self):
        """Return all bookings."""
        bookings = Booking.query.all()
        return jsonify({'bookings': [b.to_json() for b in bookings]})

    def post(self):
        """Create a new booking."""
        data = request.json or {}
        patient_nic          = data.get('patientNIC')
        first_name           = data.get('firstName')
        last_name            = data.get('lastName')
        telephone            = data.get('telephone')
        doctor_name          = data.get('doctorName')
        appointment_date_raw = data.get('appointmentDate')
        appointment_time_raw = data.get('appointmentTime')

        if not all([patient_nic, first_name, last_name, telephone, doctor_name,
                    appointment_date_raw, appointment_time_raw]):
            return jsonify({'error': 'Missing required fields'}), 400

        appointment_date = parse_date(appointment_date_raw)
        if appointment_date is None:
            return jsonify({'error': 'Invalid appointmentDate format, expected YYYY-MM-DD'}), 400

        appointment_time = parse_time(appointment_time_raw)
        if appointment_time is None:
            return jsonify({'error': 'Invalid appointmentTime format, expected HH:MM'}), 400

        if not Patient.query.get(patient_nic):
            return jsonify({'error': 'Patient not found'}), 404

        new_booking = Booking(
            patient_nic=patient_nic, first_name=first_name, last_name=last_name,
            telephone=telephone, doctor_name=doctor_name,
            appointment_date=appointment_date, appointment_time=appointment_time,
        )
        try:
            db.session.add(new_booking)
            db.session.commit()
            return jsonify({'message': 'Booking created successfully'}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 500


# ── Register all routes ──────────────────────────────────────────────────────

app.add_url_rule('/patient',             view_func=PatientView.as_view('patient'))
app.add_url_rule('/patient/add_patient', view_func=PatientView.as_view('patient_add'))
app.add_url_rule('/patient/all_patients',view_func=PatientView.as_view('patient_all'))
app.add_url_rule('/patient/delete/<nic>',view_func=PatientDetailView.as_view('patient_delete'))
app.add_url_rule('/bookings',            view_func=BookingView.as_view('bookings'))
app.add_url_rule('/bookings/add_booking',view_func=BookingView.as_view('booking_add'))


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)







