"""
=============================================================================
Nuzoviya MEDICAL PLATFORM - DATABASE MODELS
=============================================================================
Module: models.py
Description: Defines SQLAlchemy ORM database models representing patients,
             appointments, medical staff, role authentication, payments,
             laboratory results, X-ray reports, and doctor schedules.
=============================================================================
"""

import enum
import re
from datetime import date, datetime
from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import validates
from config import Database


# =============================================================================
# HELPER VALIDATION FUNCTIONS
# =============================================================================

def normalize_and_validate_telephone(value):
    """
    Normalizes Sri Lanka (+94 or 0094) to '0'.
    Validates that telephone is a valid standard phone number (any country number permitted).
    Restricts against WhatsApp links, URLs, letters, or plain text.
    Validates digit length (minimum 7, maximum 15 digits as per E.164 standard).
    """
    if not value:
        return value
    val_str = str(value).strip()

    # Reject WhatsApp links, URLs, or web mentions
    lower = val_str.lower()
    disallowed_keywords = [
        "wa.me", "whatsapp", "http://", "https://", "www.", ".com", ".me", "chat.whatsapp", "api.whatsapp"
    ]
    if any(kw in lower for kw in disallowed_keywords):
        raise ValueError("Invalid telephone: WhatsApp links or web URLs are not allowed. Please enter a standard phone number.")

    # Convert Sri Lanka prefix (+94 or 0094) to '0'
    if val_str.startswith("+94"):
        val_str = "0" + val_str[3:].lstrip(" -")
    elif val_str.startswith("0094"):
        val_str = "0" + val_str[4:].lstrip(" -")

    # Check for invalid characters - only digits, leading '+', spaces, hyphens, and parentheses allowed
    if not re.match(r"^\+?[\d\s\-\(\)]+$", val_str):
        raise ValueError("Invalid telephone: Letters or special symbols are not allowed. Please enter a valid phone number.")

    # Check digits count
    digits = re.sub(r"\D", "", val_str)
    if len(digits) < 7:
        raise ValueError("Invalid telephone: Phone number must have at least 7 digits.")
    if len(digits) > 15:
        raise ValueError("Invalid telephone: Phone number cannot exceed 15 digits.")

    return val_str


def _to_date(value):
    """
    Parses a string date in YYYY-MM-DD format to a datetime.date object.
    Returns the object as-is if it is already a date or None.
    """
    if isinstance(value, str):
        return datetime.strptime(value, "%Y-%m-%d").date()
    return value


def _to_time(value):
    """
    Parses a string time in %H:%M or %H:%M:%S format to a datetime.time object.
    Returns the object as-is if it is already a time or None.
    """
    if isinstance(value, str):
        for fmt in ("%H:%M", "%H:%M:%S"):
            try:
                return datetime.strptime(value, fmt).time()
            except ValueError:
                pass
        raise ValueError(f"Time data '{value}' does not match format '%H:%M' or '%H:%M:%S'")
    return value


# =============================================================================
# USER ROLES ENUMERATION
# =============================================================================

class UserRole(enum.Enum):
    """Enumeration of authorized hospital staff roles for authentication."""
    Receptionist = "Receptionist"
    Doctor = "Doctor"
    MLT = "MLT"
    Radiologist = "Radiologist"


# =============================================================================
# AUTHENTICATION MODEL
# =============================================================================

class Login(Database.Model):
    """
    Authentication model storing credentials and access roles for hospital staff.
    """
    __tablename__ = "login"
    __table_args__ = (
        UniqueConstraint("username", "role", name="uq_username_role"),
    )

    id = Database.Column(Database.Integer, primary_key=True, autoincrement=True)
    username = Database.Column(Database.String(50), nullable=False)
    password = Database.Column(Database.String(255), nullable=False)
    role = Database.Column(Database.Enum(UserRole), nullable=False)

    def __repr__(self):
        return f"<Login username={self.username} role={self.role.value if self.role else None}>"

    def to_json(self):
        """Serializes login user details to a dictionary."""
        return {
            "id": self.id,
            "username": self.username,
            "password": self.password,
            "role": self.role.value if isinstance(self.role, UserRole) else self.role,
        }

    def to_dict(self):
        """Alias for to_json()."""
        return self.to_json()


# =============================================================================
# PATIENT MODEL
# =============================================================================

class Patient(Database.Model):
    """
    Patient master record model containing demographic and contact information.
    """
    __tablename__ = "patient"

    patient_id = Database.Column(Database.Integer, primary_key=True, autoincrement=True)
    first_name = Database.Column(Database.String(50), nullable=False)
    last_name = Database.Column(Database.String(50), nullable=False)
    nic = Database.Column(Database.String(10), nullable=True)
    dob = Database.Column(Database.Date, nullable=True)
    address = Database.Column(Database.String(200), nullable=True)
    telephone = Database.Column(Database.String(15), nullable=False)
    email = Database.Column(Database.String(50), nullable=True)

    @validates("dob")
    def validate_dob(self, key, value):
        """Ensures date of birth is properly converted to a date object."""
        return _to_date(value)

    @validates("telephone")
    def validate_telephone(self, key, value):
        """Ensures telephone is normalized (+94 -> 0) and restricted to valid standard phone formats."""
        return normalize_and_validate_telephone(value)

    def __repr__(self):
        return f"<Patient id={self.patient_id} name={self.first_name} {self.last_name}>"

    def to_json(self):
        """Serializes patient attributes to a JSON-compatible dictionary."""
        return {
            "patient_id": self.patient_id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "nic": self.nic,
            "dob": self.dob.isoformat() if self.dob else None,
            "address": self.address,
            "telephone": self.telephone,
            "email": self.email,
        }

    def to_dict(self):
        """Alias for to_json()."""
        return self.to_json()


# =============================================================================
# BOOKING / APPOINTMENT MODEL
# =============================================================================

class Booking(Database.Model):
    """
    Appointment booking model storing scheduled patient consultations with doctors.
    """
    __tablename__ = "booking"

    booking_id = Database.Column(Database.Integer, primary_key=True, autoincrement=True)
    first_name = Database.Column(Database.String(50), nullable=False)
    last_name = Database.Column(Database.String(50), nullable=False)
    telephone = Database.Column(Database.String(15), nullable=False)
    nic = Database.Column(Database.String(20), nullable=True)
    status = Database.Column(Database.String(20), default="Booked")
    doctor_name = Database.Column(Database.String(50), nullable=False)
    appointment_date = Database.Column(Database.Date, nullable=False)
    appointment_time = Database.Column(Database.Time, nullable=False)

    @validates("appointment_date")
    def validate_appointment_date(self, key, value):
        """Validates and parses the appointment date."""
        return _to_date(value)

    @validates("appointment_time")
    def validate_appointment_time(self, key, value):
        """Validates and parses the appointment time."""
        return _to_time(value)

    @validates("telephone")
    def validate_telephone(self, key, value):
        """Ensures telephone is normalized (+94 -> 0) and restricted to valid standard phone formats."""
        return normalize_and_validate_telephone(value)

    def __repr__(self):
        return f"<Booking id={self.booking_id} doctor={self.doctor_name} date={self.appointment_date}>"

    def to_json(self):
        """Serializes booking details to a JSON-compatible dictionary."""
        return {
            "booking_id": self.booking_id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "telephone": self.telephone,
            "nic": self.nic,
            "status": self.status or "Booked",
            "doctor_name": self.doctor_name,
            "appointmentDate": self.appointment_date.isoformat() if self.appointment_date else None,
            "appointmentTime": self.appointment_time.strftime("%H:%M") if self.appointment_time else None,
        }

    def to_dict(self):
        """Alias for to_json()."""
        return self.to_json()


# =============================================================================
# MEDICAL STAFF MODELS (DOCTOR, NURSE, MLT, RADIOLOGIST)
# =============================================================================

class Doctor(Database.Model):
    """
    Doctor staff profile model.
    """
    __tablename__ = "doctor"

    doctor_id = Database.Column(Database.Integer, primary_key=True, autoincrement=True)
    doctor_first_name = Database.Column(Database.String(50), nullable=False)
    doctor_last_name = Database.Column(Database.String(50), nullable=False)

    @property
    def doctor_full_name(self):
        """Returns the doctor's full name combining first and last name."""
        return f"{self.doctor_first_name} {self.doctor_last_name}"

    def __repr__(self):
        return f"<Doctor id={self.doctor_id} name={self.doctor_full_name}>"

    def to_dict(self):
        """Serializes doctor record to dictionary."""
        return {
            "id": self.doctor_id,
            "name": self.doctor_full_name,
            "first_name": self.doctor_first_name,
            "last_name": self.doctor_last_name,
        }


class Nurse(Database.Model):
    """
    Nurse staff profile model.
    """
    __tablename__ = "nurse"

    nurse_id = Database.Column(Database.Integer, primary_key=True, autoincrement=True)
    nurse_first_name = Database.Column(Database.String(50), nullable=False)
    nurse_last_name = Database.Column(Database.String(50), nullable=False)

    @property
    def nurse_full_name(self):
        """Returns the nurse's full name."""
        return f"{self.nurse_first_name} {self.nurse_last_name}"

    def __repr__(self):
        return f"<Nurse id={self.nurse_id} name={self.nurse_full_name}>"

    def to_dict(self):
        """Serializes nurse record to dictionary."""
        return {
            "nurse_id": self.nurse_id,
            "first_name": self.nurse_first_name,
            "last_name": self.nurse_last_name,
            "nurse_full_name": self.nurse_full_name,
        }


class MLT(Database.Model):
    """
    Medical Laboratory Technician (MLT) staff profile model.
    """
    __tablename__ = "mlt"

    MLT_id = Database.Column(Database.Integer, primary_key=True, autoincrement=True)
    MLT_first_name = Database.Column(Database.String(50), nullable=False)
    MLT_last_name = Database.Column(Database.String(50), nullable=False)

    @property
    def MLT_full_name(self):
        """Returns the MLT's full name."""
        return f"{self.MLT_first_name} {self.MLT_last_name}"

    def __repr__(self):
        return f"<MLT id={self.MLT_id} name={self.MLT_full_name}>"

    def to_dict(self):
        """Serializes MLT record to dictionary."""
        return {
            "MLT_id": self.MLT_id,
            "first_name": self.MLT_first_name,
            "last_name": self.MLT_last_name,
            "MLT_full_name": self.MLT_full_name,
        }


class Radiologist(Database.Model):
    """
    Radiologist staff profile model.
    """
    __tablename__ = "radiologist"

    radiologist_id = Database.Column(Database.Integer, primary_key=True, autoincrement=True)
    radiologist_first_name = Database.Column(Database.String(50), nullable=False)
    radiologist_last_name = Database.Column(Database.String(50), nullable=False)

    @property
    def radiologist_full_name(self):
        """Returns the radiologist's full name."""
        return f"{self.radiologist_first_name} {self.radiologist_last_name}"

    def __repr__(self):
        return f"<Radiologist id={self.radiologist_id} name={self.radiologist_full_name}>"

    def to_dict(self):
        """Serializes radiologist record to dictionary."""
        return {
            "radiologist_id": self.radiologist_id,
            "first_name": self.radiologist_first_name,
            "last_name": self.radiologist_last_name,
            "radiologist_full_name": self.radiologist_full_name,
        }


# =============================================================================
# PAYMENT / BILLING MODEL
# =============================================================================

class Payment(Database.Model):
    """
    Payment transaction model for hospital consultations, lab tests, and imaging fees.
    """
    __tablename__ = "payment"

    # Standard fixed service fees
    HOSPITAL_FEE = 500
    DOCTOR_FEE = 2000
    MLT_FEE = 1000
    RADIOLOGIST_FEE = 1000

    payment_id = Database.Column(Database.Integer, primary_key=True, autoincrement=True)
    booking_id = Database.Column(Database.Integer, nullable=True)
    first_name = Database.Column(Database.String(50), nullable=False)
    last_name = Database.Column(Database.String(50), nullable=False)
    telephone = Database.Column(Database.String(15), nullable=False)

    # Breakdown of service fees
    hospital_fee = Database.Column(Database.Integer, default=HOSPITAL_FEE)
    doctor_fee = Database.Column(Database.Integer, default=DOCTOR_FEE)
    mlt_fee = Database.Column(Database.Integer, default=MLT_FEE)
    radiologist_fee = Database.Column(Database.Integer, default=RADIOLOGIST_FEE)

    additional_reason = Database.Column(Database.String(200), nullable=True)
    additional_charge = Database.Column(Database.Integer, default=0)

    total_amount = Database.Column(Database.Integer, nullable=False, default=0)
    payment_date = Database.Column(Database.Date, default=date.today)

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if "total_amount" not in kwargs or kwargs.get("total_amount") is None:
            self.total_amount = (
                (self.hospital_fee or 0)
                + (self.doctor_fee or 0)
                + (self.mlt_fee or 0)
                + (self.radiologist_fee or 0)
                + (self.additional_charge or 0)
            )

    @validates("payment_date")
    def validate_payment_date(self, key, value):
        """Ensures payment date is formatted as a datetime.date object."""
        return _to_date(value)

    @validates("telephone")
    def validate_telephone(self, key, value):
        """Ensures telephone is normalized (+94 -> 0) and restricted to valid standard phone formats."""
        return normalize_and_validate_telephone(value)

    def __repr__(self):
        return f"<Payment id={self.payment_id} total={self.total_amount}>"

    def to_json(self):
        """Serializes payment record to dictionary."""
        return {
            "payment_id": self.payment_id,
            "booking_id": self.booking_id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "telephone": self.telephone,
            "hospital_fee": self.hospital_fee,
            "doctor_fee": self.doctor_fee,
            "mlt_fee": self.mlt_fee,
            "radiologist_fee": self.radiologist_fee,
            "additional_reason": self.additional_reason,
            "additional_charge": self.additional_charge,
            "total_amount": self.total_amount,
            "payment_date": self.payment_date.isoformat() if self.payment_date else None,
        }

    def to_dict(self):
        """Alias for to_json()."""
        return self.to_json()


# =============================================================================
# LABORATORY & RADIOLOGY RECORDS
# =============================================================================

class LabRecord(Database.Model):
    """
    Medical laboratory test record containing uploaded report paths.
    """
    __tablename__ = "lab_records"

    test_id = Database.Column(Database.Integer, primary_key=True, autoincrement=True)
    patient_id = Database.Column(Database.Integer, nullable=False)
    patient_first_name = Database.Column(Database.String(100), nullable=False)
    patient_last_name = Database.Column(Database.String(100), nullable=False)
    test_name = Database.Column(Database.String(100), nullable=False)
    test_date = Database.Column(Database.Date, nullable=False)
    result = Database.Column(Database.String(500), nullable=True)

    @validates("test_date")
    def validate_test_date(self, key, value):
        """Validates and converts test date."""
        return _to_date(value)

    def __repr__(self):
        return f"<LabRecord test_id={self.test_id} patient_id={self.patient_id}>"

    def to_dict(self):
        """Serializes lab record to dictionary."""
        return {
            "test_id": self.test_id,
            "patient_id": self.patient_id,
            "patient_first_name": self.patient_first_name,
            "patient_last_name": self.patient_last_name,
            "test_name": self.test_name,
            "test_date": self.test_date.isoformat() if self.test_date else None,
            "result": self.result,
        }


class XrayRecord(Database.Model):
    """
    X-ray radiology examination record containing uploaded image/document paths.
    """
    __tablename__ = "xray_records"

    xray_id = Database.Column(Database.Integer, primary_key=True, autoincrement=True)
    patient_id = Database.Column(Database.Integer, nullable=False)
    patient_first_name = Database.Column(Database.String(100), nullable=False)
    patient_last_name = Database.Column(Database.String(100), nullable=False)
    xray_type = Database.Column(Database.Text, nullable=False)
    xray_date = Database.Column(Database.Date, nullable=False)
    xray_result = Database.Column(Database.Text, nullable=True)

    @validates("xray_date")
    def validate_xray_date(self, key, value):
        """Validates and converts X-ray date."""
        return _to_date(value)

    def __repr__(self):
        return f"<XrayRecord xray_id={self.xray_id} patient_id={self.patient_id}>"

    def to_dict(self):
        """Serializes X-ray record to dictionary."""
        return {
            "xray_id": self.xray_id,
            "patient_id": self.patient_id,
            "patient_first_name": self.patient_first_name,
            "patient_last_name": self.patient_last_name,
            "xray_type": self.xray_type,
            "xray_date": self.xray_date.isoformat() if self.xray_date else None,
            "xray_result": self.xray_result,
        }


# =============================================================================
# DOCTOR SCHEDULE MODEL
# =============================================================================

class DoctorSchedule(Database.Model):
    """
    Doctor availability schedule model storing scheduled dates and shift timeframes.
    """
    __tablename__ = "doctor_schedule"

    schedule_id = Database.Column(Database.Integer, primary_key=True, autoincrement=True)
    doctor_id = Database.Column(
        Database.Integer,
        ForeignKey("doctor.doctor_id"),
        nullable=False
    )
    doctor_full_name = Database.Column(Database.String(100), nullable=False)
    available_date = Database.Column(Database.Date, nullable=False)
    available_initial_time = Database.Column(Database.Time, nullable=False)
    available_final_time = Database.Column(Database.Time, nullable=False)

    @validates("available_date")
    def validate_available_date(self, key, value):
        """Validates and parses available date."""
        return _to_date(value)

    @validates("available_initial_time", "available_final_time")
    def validate_available_time(self, key, value):
        """Validates and parses shift times."""
        return _to_time(value)

    def __repr__(self):
        return f"<DoctorSchedule id={self.schedule_id} doctor_id={self.doctor_id} date={self.available_date}>"

    def to_dict(self):
        """Serializes doctor schedule to dictionary."""
        return {
            "schedule_id": self.schedule_id,
            "doctor_id": self.doctor_id,
            "doctor_full_name": self.doctor_full_name,
            "available_date": (
                self.available_date.isoformat()
                if self.available_date else None
            ),
            "available_initial_time": (
                self.available_initial_time.strftime("%H:%M")
                if self.available_initial_time else None
            ),
            "available_final_time": (
                self.available_final_time.strftime("%H:%M")
                if self.available_final_time else None
            ),
        }


# =============================================================================
# PRESCRIPTION MODEL
# =============================================================================

class Prescription(Database.Model):
    """
    Medical prescription model storing doctor diagnosis, prescribed medicines,
    solution/dosage instructions, follow-up dates, and surgical procedure recommendations.
    """
    __tablename__ = "prescription"

    prescription_id = Database.Column(Database.Integer, primary_key=True, autoincrement=True)
    patient_id = Database.Column(Database.Integer, nullable=True)
    patient_name = Database.Column(Database.String(100), nullable=False)
    age = Database.Column(Database.Integer, nullable=True)
    doctor_name = Database.Column(Database.String(100), nullable=False)
    problem = Database.Column(Database.String(255), nullable=True)
    description = Database.Column(Database.Text, nullable=True)
    medicines = Database.Column(Database.Text, nullable=True)
    solution = Database.Column(Database.Text, nullable=True)
    notes = Database.Column(Database.Text, nullable=True)
    appointment_date = Database.Column(Database.Date, nullable=True)
    include_surgery = Database.Column(Database.Boolean, default=False)
    is_authorized = Database.Column(Database.Boolean, default=False)
    surgery_date = Database.Column(Database.Date, nullable=True)
    surgery_time = Database.Column(Database.Time, nullable=True)
    assigned_staff = Database.Column(Database.Text, nullable=True)
    surgery_preparation = Database.Column(Database.Text, nullable=True)
    surgery_process = Database.Column(Database.Text, nullable=True)
    prescription_date = Database.Column(Database.Date, default=date.today)

    @validates("appointment_date", "prescription_date", "surgery_date")
    def validate_dates(self, key, value):
        """Validates and converts date fields."""
        return _to_date(value)

    @validates("surgery_time")
    def validate_times(self, key, value):
        """Validates and converts time fields."""
        return _to_time(value)

    def __repr__(self):
        return (
            f"<Prescription id={self.prescription_id} "
            f"patient={self.patient_name} "
            f"doctor={self.doctor_name}>"
        )

    def to_json(self):
        """Serializes prescription attributes to a JSON-compatible dictionary."""
        return {
            "prescription_id": self.prescription_id,
            "patient_id": self.patient_id,
            "patient_name": self.patient_name,
            "age": self.age,
            "doctor_name": self.doctor_name,
            "problem": self.problem,
            "description": self.description,
            "medicines": self.medicines,
            "solution": self.solution,
            "notes": self.notes,
            "appointment_date": (
                self.appointment_date.isoformat()
                if self.appointment_date else None
            ),
            "include_surgery": self.include_surgery,
            "is_authorized": self.is_authorized,
            "surgery_date": (
                self.surgery_date.isoformat()
                if self.surgery_date else None
            ),
            "surgery_time": (
                self.surgery_time.strftime("%H:%M")
                if self.surgery_time else None
            ),
            "assigned_staff": self.assigned_staff,
            "surgery_preparation": self.surgery_preparation,
            "surgery_process": self.surgery_process,
            "prescription_date": (
                self.prescription_date.isoformat()
                if self.prescription_date else None
            ),
        }

    def to_dict(self):
        """Alias for to_json()."""
        return self.to_json()


# =============================================================================
# FEEDBACK MODEL
# =============================================================================

class Feedback(Database.Model):
    """
    Medical feedback model storing doctor consultation messages, diagnosis summaries,
    and optional stamp/signature image attachments for a patient.
    """
    __tablename__ = "feedback"

    feedback_id = Database.Column(Database.Integer, primary_key=True, autoincrement=True)
    booking_id = Database.Column(Database.Integer, nullable=True)
    patient_id = Database.Column(Database.Integer, nullable=True)
    patient_name = Database.Column(Database.String(100), nullable=False)
    doctor_name = Database.Column(Database.String(100), nullable=False)
    subject = Database.Column(Database.String(255), nullable=False)
    description = Database.Column(Database.Text, nullable=False)
    stamp_image = Database.Column(Database.String(255), nullable=True)
    feedback_date = Database.Column(Database.Date, default=date.today)

    @validates("feedback_date")
    def validate_feedback_date(self, key, value):
        """Validates and parses feedback date."""
        return _to_date(value)

    def __repr__(self):
        return (
            f"<Feedback id={self.feedback_id} "
            f"patient={self.patient_name} "
            f"doctor={self.doctor_name} "
            f"subject={self.subject}>"
        )

    def to_json(self):
        """Serializes feedback attributes to a JSON-compatible dictionary."""
        return {
            "feedback_id": self.feedback_id,
            "booking_id": self.booking_id,
            "patient_id": self.patient_id,
            "patient_name": self.patient_name,
            "doctor_name": self.doctor_name,
            "subject": self.subject,
            "description": self.description,
            "stamp_image": self.stamp_image,
            "feedback_date": (
                self.feedback_date.isoformat()
                if self.feedback_date else None
            ),
        }

    def to_dict(self):
        """Alias for to_json()."""
        return self.to_json()