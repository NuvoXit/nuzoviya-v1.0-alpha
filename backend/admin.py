from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from flask_admin.form import ImageUploadField
from config import Database
from models import Patient, Booking, Login, Doctor, Nurse, MLT, Radiologist, Optician, Payment, LabRecord

admin = Admin(name="Medical Admin Panel")


class LabRecordAdmin(ModelView):
    form_overrides = {
        'result': ImageUploadField
    }

    form_args = {
        'result': {
            'base_path': 'static/uploads/lab_reports/',
            'relative_path': 'lab_reports/'
        }
    }




def init_admin(app):
    admin.init_app(app)

    admin.add_view(ModelView(Patient, Database.session))
    admin.add_view(ModelView(Booking, Database.session))
    admin.add_view(ModelView(Login, Database.session))
    admin.add_view(ModelView(Payment, Database.session))
    admin.add_view(ModelView(Doctor, Database.session, category="Staff"))
    admin.add_view(ModelView(Nurse, Database.session, category="Staff"))
    admin.add_view(ModelView(MLT, Database.session, category="Staff"))
    admin.add_view(ModelView(Radiologist, Database.session, category="Staff"))
    admin.add_view(ModelView(Optician, Database.session, category="Staff")) 
    admin.add_view(LabRecordAdmin(LabRecord, Database.session, category="Records"))