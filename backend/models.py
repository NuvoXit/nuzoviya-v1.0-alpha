from datetime import datetime
from config import Database
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

class UserRole(enum.Enum):
    Doctor = "Doctor"
    Receptionist = "Receptionist"
    Nurse = "Nurse"

class Patient(Database.Model):

    __tablename__ = 'patient'

    NIC = Database.Column(Database.String(10), primary_key=True, nullable=False)
    first_name = Database.Column(Database.String(50), nullable=False)
    last_name = Database.Column(Database.String(50), nullable=False)
    DOB = Database.Column(Database.Date, nullable=False)
    address = Database.Column(Database.String(200), nullable=False)
    telephone = Database.Column(Database.String(15), nullable=False)
    email = Database.Column(Database.String(50), nullable=False)

    bookings = Database.relationship('Booking', backref='patient', lazy=True)

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

class Booking(Database.Model):

    __tablename__ = 'booking'

    id = Database.Column(Database.Integer, primary_key=True, autoincrement=True)

    patient_nic = Database.Column(Database.String(10), Database.ForeignKey('patient.NIC'), nullable=False)
    first_name = Database.Column(Database.String(50), nullable=False)
    last_name = Database.Column(Database.String(50), nullable=False)
    telephone = Database.Column(Database.String(15), nullable=False)
    doctor_name = Database.Column(Database.String(50), Database.ForeignKey('doctor.Doctor_name'), nullable=False)
    appointment_date = Database.Column(Database.Date, nullable=False)
    appointment_time = Database.Column(Database.Time, nullable=False)

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

class Login(Database.Model):

    __tablename__ = 'login'

    id = Database.Column(Database.Integer, primary_key=True, autoincrement=True)
    username = Database.Column(Database.String(50), nullable=False, unique=True)
    password = Database.Column(Database.String(255), nullable=False)
    role = Database.Column(Database.Enum(UserRole), nullable=False)

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
      
class Nurse(Database.Model):

    __tablename__ = 'nurse'

    id = Database.Column(Database.Integer, primary_key=True, autoincrement=True)
    Nurse_name = Database.Column(Database.String(50), nullable=False, unique=True)
    
    def __repr__(self):
        return f'<Nurse {self.Nurse_name}>'

    def to_json(self):
        return {
            "id": self.id,
            "NurseName": self.Nurse_name
        }

    def to_dict(self):
        return self.to_json()
    
class Doctor(Database.Model):

    __tablename__ = 'doctor'

    id = Database.Column(Database.Integer, primary_key=True, autoincrement=True)
    Doctor_First_name = Database.Column(Database.String(50), nullable=False, unique=True)
    Doctor_Last_name = Database.Column(Database.String(50), nullable=False, unique=True)
    Doctor_name = Doctor_First_name + " " + Doctor_Last_name


    def __repr__(self):
        return f'<Doctor {self.Doctor_name}>'

    def to_json(self):
        return {
            "id": self.id,
            "DoctorName": self.Doctor_name
        }

    def to_dict(self):
        return self.to_json()
    

