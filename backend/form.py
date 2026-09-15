"""
=============================================================================
Nuzoviya MEDICAL PLATFORM - DATA TRANSFER & FORM OBJECTS
=============================================================================
Module: form.py
Description: Encapsulates incoming request and form transfer objects for
             patients, bookings, payments, logins, staff profiles, lab records,
             and doctor schedules.
=============================================================================
"""


# =============================================================================
# PATIENT FORM
# =============================================================================

class PatientForm:
    """Represents form payload for creating or updating a patient record."""

    def __init__(self, patient_id, first_name, last_name, nic, dob, address, telephone, email):
        self.patient_id = patient_id
        self.first_name = first_name
        self.last_name = last_name
        self.nic = nic
        self.dob = dob
        self.address = address
        self.telephone = telephone
        self.email = email

    def __repr__(self):
        return f"<PatientForm id={self.patient_id} name={self.first_name} {self.last_name}>"


# =============================================================================
# BOOKING FORM
# =============================================================================

class BookingForm:
    """Represents form payload for scheduling an appointment booking."""

    def __init__(self, booking_id, first_name, last_name, telephone, doctor_name, appointment_date, appointment_time):
        self.booking_id = booking_id
        self.first_name = first_name
        self.last_name = last_name
        self.telephone = telephone
        self.doctor_name = doctor_name
        self.appointment_date = appointment_date
        self.appointment_time = appointment_time

    def __repr__(self):
        return f"<BookingForm id={self.booking_id} doctor={self.doctor_name}>"


# =============================================================================
# PAYMENT FORM
# =============================================================================

class PaymentForm:
    """Represents form payload for processing a patient payment transaction."""

    def __init__(
        self,
        payment_id,
        first_name,
        last_name,
        telephone,
        hospital_fee,
        doctor_fee,
        mlt_fee,
        radiologist_fee,
        additional_reason,
        additional_charge,
        total_amount,
        payment_date,
    ):
        self.payment_id = payment_id
        self.first_name = first_name
        self.last_name = last_name
        self.telephone = telephone
        self.hospital_fee = hospital_fee
        self.doctor_fee = doctor_fee
        self.mlt_fee = mlt_fee
        self.radiologist_fee = radiologist_fee
        self.additional_reason = additional_reason
        self.additional_charge = additional_charge
        self.total_amount = total_amount
        self.payment_date = payment_date

    def __repr__(self):
        return f"<PaymentForm id={self.payment_id} total={self.total_amount}>"


# =============================================================================
# LOGIN FORM
# =============================================================================

class LoginForm:
    """Represents form payload for user authentication requests."""

    def __init__(self, login_id, username, password, role):
        self.login_id = login_id
        self.username = username
        self.password = password
        self.role = role

    def __repr__(self):
        return f"<LoginForm username={self.username} role={self.role}>"


# =============================================================================
# STAFF FORMS (DOCTOR, NURSE, MLT, RADIOLOGIST)
# =============================================================================

class DoctorForm:
    """Represents form payload for registering a doctor."""

    def __init__(self, doctor_id, doctor_first_name, doctor_last_name):
        self.doctor_id = doctor_id
        self.doctor_first_name = doctor_first_name
        self.doctor_last_name = doctor_last_name
        self.doctor_full_name = f"{doctor_first_name} {doctor_last_name}"

    def __repr__(self):
        return f"<DoctorForm id={self.doctor_id} name={self.doctor_full_name}>"


class NurseForm:
    """Represents form payload for registering a nurse."""

    def __init__(self, nurse_id, nurse_first_name, nurse_last_name):
        self.nurse_id = nurse_id
        self.nurse_first_name = nurse_first_name
        self.nurse_last_name = nurse_last_name
        self.nurse_full_name = f"{nurse_first_name} {nurse_last_name}"

    def __repr__(self):
        return f"<NurseForm id={self.nurse_id} name={self.nurse_full_name}>"


class MLTForm:
    """Represents form payload for registering a Medical Laboratory Technician."""

    def __init__(self, MLT_id, MLT_first_name, MLT_last_name):
        self.MLT_id = MLT_id
        self.MLT_first_name = MLT_first_name
        self.MLT_last_name = MLT_last_name
        self.MLT_full_name = f"{MLT_first_name} {MLT_last_name}"

    def __repr__(self):
        return f"<MLTForm id={self.MLT_id} name={self.MLT_full_name}>"


class RadiologistForm:
    """Represents form payload for registering a Radiologist."""

    def __init__(self, radiologist_id, radiologist_first_name, radiologist_last_name):
        self.radiologist_id = radiologist_id
        self.radiologist_first_name = radiologist_first_name
        self.radiologist_last_name = radiologist_last_name
        self.radiologist_full_name = f"{radiologist_first_name} {radiologist_last_name}"

    def __repr__(self):
        return f"<RadiologistForm id={self.radiologist_id} name={self.radiologist_full_name}>"


# =============================================================================
# CLINICAL & SCHEDULE FORMS
# =============================================================================

class LabRecordForm:
    """Represents form payload for submitting laboratory test results."""

    def __init__(self, test_id, patient_id, patient_first_name, patient_last_name, test_name, test_date, result):
        self.test_id = test_id
        self.patient_id = patient_id
        self.patient_first_name = patient_first_name
        self.patient_last_name = patient_last_name
        self.test_name = test_name
        self.test_date = test_date
        self.result = result

    def __repr__(self):
        return f"<LabRecordForm id={self.test_id} patient_id={self.patient_id}>"


class DoctorScheduleForm:
    """Represents form payload for managing doctor availability schedules."""

    def __init__(
        self,
        schedule_id,
        doctor_id,
        doctor_full_name,
        available_date,
        available_initial_time,
        available_final_time,
    ):
        self.schedule_id = schedule_id
        self.doctor_id = doctor_id
        self.doctor_full_name = doctor_full_name
        self.available_date = available_date
        self.available_initial_time = available_initial_time
        self.available_final_time = available_final_time

    def __repr__(self):
        return f"<DoctorScheduleForm id={self.schedule_id} doctor={self.doctor_full_name}>"


# =============================================================================
# PRESCRIPTION FORM
# =============================================================================

class PrescriptionForm:
    """Represents form payload for creating or updating a prescription record."""

    def __init__(
        self,
        prescription_id,
        patient_id,
        patient_name,
        age,
        doctor_name,
        problem,
        description,
        medicines,
        solution,
        notes,
        appointment_date,
        include_surgery,
        is_authorized,
        surgery_date,
        surgery_time,
        assigned_staff,
        surgery_preparation,
        surgery_process,
        prescription_date,
    ):
        self.prescription_id = prescription_id
        self.patient_id = patient_id
        self.patient_name = patient_name
        self.age = age
        self.doctor_name = doctor_name
        self.problem = problem
        self.description = description
        self.medicines = medicines
        self.solution = solution
        self.notes = notes
        self.appointment_date = appointment_date
        self.include_surgery = include_surgery
        self.is_authorized = is_authorized
        self.surgery_date = surgery_date
        self.surgery_time = surgery_time
        self.assigned_staff = assigned_staff
        self.surgery_preparation = surgery_preparation
        self.surgery_process = surgery_process
        self.prescription_date = prescription_date

    def __repr__(self):
        return (
            f"<PrescriptionForm id={self.prescription_id} "
            f"patient={self.patient_name} "
            f"doctor={self.doctor_name}>"
        )


# =============================================================================
# FEEDBACK FORM
# =============================================================================

class FeedbackForm:
    """Represents form payload for submitting doctor patient feedback messages."""

    def __init__(
        self,
        feedback_id,
        patient_id,
        patient_name,
        doctor_name,
        subject,
        description,
        stamp_image,
        feedback_date,
    ):
        self.feedback_id = feedback_id
        self.patient_id = patient_id
        self.patient_name = patient_name
        self.doctor_name = doctor_name
        self.subject = subject
        self.description = description
        self.stamp_image = stamp_image
        self.feedback_date = feedback_date

    def __repr__(self):
        return (
            f"<FeedbackForm id={self.feedback_id} "
            f"patient={self.patient_name} "
            f"doctor={self.doctor_name} "
            f"subject={self.subject}>"
        )