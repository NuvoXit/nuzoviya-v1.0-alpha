from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from flask_admin.form import FileUploadField
from config import Database
from models import (Patient, Booking, Login, Doctor, Nurse, MLT, Radiologist, Payment, LabRecord, DoctorSchedule, XrayRecord)
from werkzeug.utils import secure_filename
import os

admin = Admin(name="Medical Admin Panel")

class LabRecordAdmin(ModelView):
    form_overrides = {
        'result': FileUploadField
    }

    form_args = {
        'result': {
            'label': 'Lab Report (PDF/Image)',
            'base_path': 'Submitted_Files',
            'relative_path': 'lab_reports/',
            'allowed_extensions': [
                'pdf',
                'png',
                'jpg',
                'jpeg'
            ]
        }
    }

class XrayRecordAdmin(ModelView):
    form_overrides = {
        'result': FileUploadField
    }

    form_args = {
        'result': {
            'label': 'X-ray Report (PDF/Image)',
            'base_path': 'Submitted_Files',
            'relative_path': 'xray_reports/',
            'allowed_extensions': [
                'pdf',
                'png',
                'jpg',
                'jpeg'
            ]
        }
    }



def init_admin(app):
    # Initialize Flask-Admin
    admin.init_app(app)

    # General tables
    admin.add_view(ModelView(Patient, Database.session))
    admin.add_view(ModelView(Booking, Database.session))
    admin.add_view(ModelView(Login, Database.session))
    admin.add_view(ModelView(Payment, Database.session))

    # Staff category
    admin.add_view(ModelView(Doctor, Database.session, category="Staff"))
    admin.add_view(ModelView(Nurse, Database.session, category="Staff"))
    admin.add_view(ModelView(MLT, Database.session, category="Staff"))
    admin.add_view(ModelView(Radiologist, Database.session, category="Staff"))

    # Lab records with PDF/Image upload
    admin.add_view(LabRecordAdmin(LabRecord, Database.session, category="Records"))
    admin.add_view(XrayRecordAdmin(XrayRecord, Database.session, category="Records"))
    admin.add_view(ModelView(DoctorSchedule, Database.session, category="Schedules"))