from datetime import date, time, datetime
from config import db
from sqlalchemy.orm import validates


def _to_date(value):
    if value is None or isinstance(value, date):
        return value
    for fmt in ('%Y-%m-%d',):
        try:
            return datetime.strptime(value, fmt).date()
        except (ValueError, TypeError):
            pass
    raise ValueError(f"Cannot parse date: {value!r}")


def _to_time(value):
    if value is None or isinstance(value, time):
        return value
    for fmt in ('%H:%M:%S', '%H:%M'):
        try:
            return datetime.strptime(value, fmt).time()
        except (ValueError, TypeError):
            continue
    raise ValueError(f"Cannot parse time: {value!r}")


class Patient(db.Model):
    __tablename__ = 'patient'

    NIC = db.Column(db.String(10), nullable=False, primary_key=True)
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
            "email": self.email,
        }


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
            "appointmentTime": self.appointment_time.strftime('%H:%M') if self.appointment_time else None,
        }
        
