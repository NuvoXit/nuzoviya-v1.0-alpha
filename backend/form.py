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
    def __init__(self, booking_id, first_name, last_name, telephone, booked_patient_id, doctor_name, appointment_date, appointment_time):
        self.booking_id = booking_id
        self.first_name = first_name
        self.last_name = last_name
        self.telephone = telephone
        self.booked_patient_id = booked_patient_id
        self.doctor_name = doctor_name
        self.appointment_date = appointment_date
        self.appointment_time = appointment_time


class LoginForm:
    def __init__(self, login_id, username, password):
        self.login_id = login_id
        self.username = username
        self.password = password
 
class DoctorForm:
    def __init__(self, doctor_id, doctor_first_name, doctor_last_name):
        self.doctor_id = doctor_id
        self.doctor_first_name = doctor_first_name
        self.doctor_last_name = doctor_last_name


class NurseForm:
    def __init__(self, nurse_id, nurse_first_name, nurse_last_name):
        self.nurse_id = nurse_id
        self.nurse_first_name = nurse_first_name
        self.nurse_last_name = nurse_last_name
        

