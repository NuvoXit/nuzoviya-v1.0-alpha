class PatientForm:
    def __init__(self, patient_id, nic, first_name, last_name, dob, address, telephone, email):
        self.patient_id = patient_id
        self.NIC = nic
        self.first_name = first_name
        self.last_name = last_name
        self.dob = dob
        self.address = address
        self.telephone = telephone
        self.email = email

    # def to_dict(self):
    #     return {
    #         "patient_id": self.patient_id,
    #         "nic": self.nic,
    #         "first_name": self.first_name,
    #         "last_name": self.last_name,
    #         "dob": self.dob,
    #         "address": self.address,
    #         "telephone": self.telephone,
    #         "email": self.email
    #     }

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


class DoctorForm:
    def __init__(self, doctor_first_name, doctor_last_name):
        self.doctor_first_name = doctor_first_name
        self.doctor_last_name = doctor_last_name
        self._name = self.doctor_first_name + " " + self.doctor_last_name

    
    
