from datetime import datetime 
from config import Database    
from sqlalchemy import UniqueConstraint
from sqlalchemy.orm import validates
import enum

# Date Validation Functions
def _to_date(value):
    if isinstance(value, str):
        return datetime.strptime(value, '%Y-%m-%d').date()
    return value

# Time Validation Functions
def _to_time(value):
    if isinstance(value, str):
        return datetime.strptime(value, '%H:%M').time()
    return value


class Patient(Database.Model):
    __tablename__ = 'patient'

    patient_id = Database.Column(Database.Integer, primary_key=True, autoincrement=True)
    

    
    first_name = Database.Column(Database.String(50), nullable=False)
    last_name = Database.Column(Database.String(50), nullable=False)
    nic = Database.Column(Database.String(10), nullable=True)
    dob = Database.Column(Database.Date, nullable=True)
    address = Database.Column(Database.String(200), nullable=True)
    telephone = Database.Column(Database.String(15), nullable=False)
    email = Database.Column(Database.String(50), nullable=True)

    @validates('dob')
    def validate_dob(self, key, value):
        return _to_date(value)

    def __repr__(self):
        return f'<Patient {self.nic}>'
    
    def to_json(self):
        return {
            "patient_id": self.patient_id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "nic": self.nic,
            "dob": self.dob.isoformat() if self.dob else None, # Attribute Error Fix Happened Here
            "address": self.address,
            "telephone": self.telephone,
            "email": self.email
        }

    def to_dict(self):
        return self.to_json()

class Booking(Database.Model):

    __tablename__ = 'booking'

    booking_id = Database.Column(Database.Integer, primary_key=True, autoincrement=True)

    first_name = Database.Column(Database.String(50), nullable=False)
    last_name = Database.Column(Database.String(50), nullable=False)
    telephone = Database.Column(Database.String(15), nullable=False)
    doctor_name = Database.Column(Database.String(50), nullable=False)
    appointment_date = Database.Column(Database.Date, nullable=False)
    appointment_time = Database.Column(Database.Time, nullable=False)

    @validates('appointment_date')
    def validate_appointment_date(self, key, value):
        return _to_date(value)

    @validates('appointment_time')
    def validate_appointment_time(self, key, value):
        return _to_time(value)

    def __repr__(self):
        return f'<Booking {self.booking_id}>'

    def to_json(self):
        return {
            "booking_id": self.booking_id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "telephone": self.telephone,
            "doctor_name": self.doctor_name,
            "appointmentDate": self.appointment_date.isoformat() if self.appointment_date else None,
            "appointmentTime": self.appointment_time.strftime('%H:%M') if self.appointment_time else None
        }

    def to_dict(self):
        return self.to_json()

class UserRole(enum.Enum):
    Doctor = "Doctor"
    Receptionist = "Receptionist"
    Nurse = "Nurse"

class Login(Database.Model):

    __tablename__ = 'login'
    __table_args__ = (
        UniqueConstraint('username', 'role', name='uq_username_role'),
    )

    id = Database.Column(Database.Integer, primary_key=True, autoincrement=True)
    username = Database.Column(Database.String(50), nullable=False)
    password = Database.Column(Database.String(255), nullable=False)
    role = Database.Column(Database.Enum(UserRole), nullable=False)

    def __repr__(self):
        return f'<Login {self.username}>'

    def to_json(self):
        return {
            "id": self.id,
            "username": self.username,
            "password": self.password,
            "role": self.role.value
        }

    def to_dict(self):
        return self.to_json()
      
class Doctor(Database.Model):
    __tablename__ = 'doctor'

    doctor_id = Database.Column(Database.Integer, primary_key=True, autoincrement=True)
    doctor_first_name = Database.Column(Database.String(50), nullable=False)
    doctor_last_name = Database.Column(Database.String(50), nullable=False)

    @property
    def doctor_full_name(self):
        return f"{self.doctor_first_name} {self.doctor_last_name}"

    def __repr__(self):
        return f"<Doctor {self.doctor_full_name}>"

    def to_dict(self):
        return {
            "id": self.doctor_id,
            "name": self.doctor_full_name,
            "first_name": self.doctor_first_name,
            "last_name": self.doctor_last_name
        }
    
class Nurse(Database.Model):
    __tablename__ = 'nurse'

    nurse_id = Database.Column(Database.Integer, primary_key=True, autoincrement=True)
    nurse_first_name = Database.Column(Database.String(50), nullable=False)
    nurse_last_name = Database.Column(Database.String(50), nullable=False)

    @property
    def nurse_full_name(self):
        return f"{self.nurse_first_name} {self.nurse_last_name}"

    def __repr__(self):
        return f"<Nurse {self.nurse_full_name}>"

    def to_dict(self):
        return {
            "nurse_id": self.nurse_id,
            "first_name": self.nurse_first_name,
            "last_name": self.nurse_last_name,
            "nurse_full_name": self.nurse_full_name
        }
    
class MLT(Database.Model):
    __tablename__ = 'mlt'

    MLT_id = Database.Column(Database.Integer, primary_key=True, autoincrement=True)
    MLT_first_name = Database.Column(Database.String(50), nullable=False)
    MLT_last_name = Database.Column(Database.String(50), nullable=False)

    @property
    def MLT_full_name(self):
        return f"{self.MLT_first_name} {self.MLT_last_name}"

    def __repr__(self):
        return f"<MLT {self.MLT_full_name}>"

    def to_dict(self):
        return {
            "MLT_id": self.MLT_id,
            "first_name": self.MLT_first_name,
            "last_name": self.MLT_last_name,
            "MLT_full_name": self.MLT_full_name
        }

class Radiologist(Database.Model):
    __tablename__ = 'radiologist'

    radiologist_id = Database.Column(Database.Integer, primary_key=True, autoincrement=True)
    radiologist_first_name = Database.Column(Database.String(50), nullable=False)
    radiologist_last_name = Database.Column(Database.String(50), nullable=False)

    @property
    def radiologist_full_name(self):
        return f"{self.radiologist_first_name} {self.radiologist_last_name}"

    def __repr__(self):
        return f"<Radiologist {self.radiologist_full_name}>"

    def to_dict(self):
        return {
            "radiologist_id": self.radiologist_id,
            "first_name": self.radiologist_first_name,
            "last_name": self.radiologist_last_name,
            "radiologist_full_name": self.radiologist_full_name
        }   