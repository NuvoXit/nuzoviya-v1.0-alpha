from datetime import datetime
from config import db
from sqlalchemy.orm import validates
import enum


def _to_date(value):
    if isinstance(value, str):
        return datetime.strptime(value, '%Y-%m-%d').date()
    return value


def _to_time(value):
    if isinstance(value, str):
        return datetime.strptime(value, '%H:%M').time()
    return value


# =========================
# USER ROLE ENUM
# =========================

class UserRole(enum.Enum):
    Doctor = "Doctor"
    Receptionist = "Receptionist"
    Nurse = "Nurse"


# =========================
# PATIENT MODEL
# =========================

class Patient(db.Model):

    __tablename__ = 'patient'

    NIC = db.Column(db.String(10), primary_key=True, nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    DOB = db.Column(db.Date, nullable=False)
    address = db.Column(db.String(200), nullable=False)
    telephone = db.Column(db.String(15), nullable=False)
    email = db.Column(db.String(50), nullable=False)

    bookings = db.relationship('Booking', backref='patient', lazy=True)

    @validates('DOB')
    def validate_dob(self, key, value):
        return _to_date(value)

    def __repr__(self):
        return f'<Patient {self.NIC}>'

    def to_json(self):
        return {
            "NIC": self.NIC,
            "firstName": self.first_name,
            "lastName": self.last_name,
            "DOB": self.DOB.isoformat() if self.DOB else None,
            "address": self.address,
            "telephone": self.telephone,
            "email": self.email
        }

    def to_dict(self):
        return self.to_json()


# =========================
# BOOKING MODEL
# =========================

class Booking(db.Model):

    __tablename__ = 'booking'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    patient_nic = db.Column(db.String(10), db.ForeignKey('patient.NIC'), nullable=False)
    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    telephone = db.Column(db.String(15), nullable=False)
    doctor_name = db.Column(db.String(50), nullable=False)
    appointment_date = db.Column(db.Date, nullable=False)
    appointment_time = db.Column(db.Time, nullable=False)

    @validates('appointment_date')
    def validate_appointment_date(self, key, value):
        return _to_date(value)

    @validates('appointment_time')
    def validate_appointment_time(self, key, value):
        return _to_time(value)

    def __repr__(self):
        return f'<Booking {self.id}>'

    def to_json(self):
        return {
            "id": self.id,
            "patientNIC": self.patient_nic,
            "firstName": self.first_name,
            "lastName": self.last_name,
            "telephone": self.telephone,
            "doctorName": self.doctor_name,
            "appointmentDate": self.appointment_date.isoformat() if self.appointment_date else None,
            "appointmentTime": self.appointment_time.strftime('%H:%M') if self.appointment_time else None
        }

    def to_dict(self):
        return self.to_json()


# =========================
# LOGIN MODEL
# =========================

class Login(db.Model):

    __tablename__ = 'login'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    username = db.Column(db.String(50), nullable=False, unique=True)

    password = db.Column(db.String(255), nullable=False)

    role = db.Column(db.Enum(UserRole), nullable=False)

    def __repr__(self):
        return f'<Login {self.username}>'

    def to_json(self):
        return {
            "id": self.id,
            "username": self.username,
            "role": self.role.value
        }

    def to_dict(self):
        return self.to_json()