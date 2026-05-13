class PatientForm:
    def __init__(self, nic, first_name, last_name, dob, address, telephone, email):
        self.nic = nic
        self.first_name = first_name
        self.last_name = last_name
        self.dob = dob
        self.address = address
        self.telephone = telephone
        self.email = email


class BookingForm:
    def __init__(self, first_name, last_name, telephone, patient_id, doctor_name, appointment_date, appointment_time):
        self.first_name = first_name
        self.last_name = last_name
        self.telephone = telephone
        self.patient_id = patient_id
        self.doctor_name = doctor_name
        self.appointment_date = appointment_date
        self.appointment_time = appointment_time


class LoginForm:
    def __init__(self, username, password, role):
        self.username = username
        self.password = password
        self.role = role
