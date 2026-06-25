class PatientForm:
    def __init__(self, patient_id, first_name, last_name, nic, dob, address, telephone, email):
        self.patient_id = patient_id
        self.first_name = first_name
        self.last_name = last_name
        self.nic = nic
        self.dob = dob
        self.address = address
        self.telephone = telephone
        self.email = email

class BookingForm:
    def __init__(self, booking_id, first_name, last_name, telephone, doctor_name, appointment_date, appointment_time):
        self.booking_id = booking_id
        self.first_name = first_name
        self.last_name = last_name
        self.telephone = telephone
        self.doctor_name = doctor_name
        self.appointment_date = appointment_date
        self.appointment_time = appointment_time

class PaymentForm:
    def __init__(self, payment_id, first_name, last_name, telephone, hospital_fee, doctor_fee, mlt_fee, radiologist_fee, optician_fee, additional_reason, additional_charge, total_amount, payment_date):
        self.payment_id = payment_id
        self.first_name = first_name
        self.last_name = last_name
        self.telephone = telephone
        self.hospital_fee = hospital_fee
        self.doctor_fee = doctor_fee
        self.mlt_fee = mlt_fee
        self.radiologist_fee = radiologist_fee
        self.optician_fee = optician_fee
        self.additional_reason = additional_reason
        self.additional_charge = additional_charge
        self.total_amount = total_amount
        self.payment_date = payment_date

class LoginForm:
    def __init__(self, login_id, username, password, role):
        self.login_id = login_id
        self.username = username
        self.password = password
        self.role = role  # Role will be set after authentication
 
class DoctorForm:
    def __init__(self, doctor_id, doctor_first_name, doctor_last_name):
        self.doctor_id = doctor_id
        self.doctor_first_name = doctor_first_name
        self.doctor_last_name = doctor_last_name
        self.doctor_full_name = f"{doctor_first_name} {doctor_last_name}"

class NurseForm:
    def __init__(self, nurse_id, nurse_first_name, nurse_last_name):
        self.nurse_id = nurse_id
        self.nurse_first_name = nurse_first_name
        self.nurse_last_name = nurse_last_name
        self.nurse_full_name = f"{nurse_first_name} {nurse_last_name}"

class MLTForm:
    def __init__(self, MLT_id, MLT_first_name, MLT_last_name):
        self.MLT_id = MLT_id
        self.MLT_first_name = MLT_first_name
        self.MLT_last_name = MLT_last_name
        self.MLT_full_name = f"{MLT_first_name} {MLT_last_name}"

class RadiologistForm:
    def __init__(self, radiologist_id, radiologist_first_name, radiologist_last_name):
        self.radiologist_id = radiologist_id
        self.radiologist_first_name = radiologist_first_name
        self.radiologist_last_name = radiologist_last_name
        self.radiologist_full_name = f"{radiologist_first_name} {radiologist_last_name}"

class OpticianForm:
    def __init__(self, optician_id, optician_first_name, optician_last_name):
        self.optician_id = optician_id
        self.optician_first_name = optician_first_name
        self.optician_last_name = optician_last_name
        self.optician_full_name = f"{optician_first_name} {optician_last_name}"