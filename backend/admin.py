"""
=============================================================================
Nuzoviya MEDICAL PLATFORM - FLASK-ADMIN DASHBOARD
=============================================================================
Module: admin.py
Description: Registers Flask-Admin views for managing database records,
             including custom file upload handlers for lab and X-ray records.
=============================================================================
"""

from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from flask_admin.form import FileUploadField

from config import Database
from models import (
    Booking,
    Doctor,
    DoctorSchedule,
    Feedback,
    LabRecord,
    Login,
    MLT,
    Nurse,
    Patient,
    Payment,
    Prescription,
    Radiologist,
    XrayRecord,
)


# =============================================================================
# ADMIN INSTANCE
# =============================================================================

admin = Admin(name="Medical Admin Panel")


# =============================================================================
# CUSTOM MODEL VIEWS FOR FILE ATTACHMENTS
# =============================================================================

class LabRecordAdmin(ModelView):
    """
    Admin view for managing Laboratory test records with file upload capability.
    """
    form_overrides = {
        "result": FileUploadField,
    }

    form_args = {
        "result": {
            "label": "Lab Report (PDF/Image)",
            "base_path": "Submitted_Files",
            "relative_path": "lab_reports/",
            "allowed_extensions": [
                "pdf",
                "png",
                "jpg",
                "jpeg",
            ],
        }
    }


class XrayRecordAdmin(ModelView):
    """
    Admin view for managing Radiology X-ray records with file upload capability.
    """
    form_overrides = {
        "xray_result": FileUploadField,
    }

    form_args = {
        "xray_result": {
            "label": "X-ray Report (PDF/Image)",
            "base_path": "Submitted_Files",
            "relative_path": "xray_reports/",
            "allowed_extensions": [
                "pdf",
                "png",
                "jpg",
                "jpeg",
            ],
        }
    }


class FeedbackAdmin(ModelView):
    """
    Admin view for managing Doctor Feedback records with stamp image upload capability.
    """
    form_overrides = {
        "stamp_image": FileUploadField,
    }

    form_args = {
        "stamp_image": {
            "label": "Stamp / Signature Image",
            "base_path": "Submitted_Files",
            "relative_path": "feedback_stamps/",
            "allowed_extensions": [
                "png",
                "jpg",
                "jpeg",
            ],
        }
    }


# =============================================================================
# ADMIN INITIALIZATION FUNCTION
# =============================================================================

def init_admin(app):
    """
    Initializes Flask-Admin extension and attaches categorized model views.

    Args:
        app (Flask): The running Flask application instance.
    """
    admin.init_app(app)

    # Core hospital tables
    admin.add_view(ModelView(Patient, Database.session, name="Patients"))
    admin.add_view(ModelView(Booking, Database.session, name="Bookings"))
    admin.add_view(ModelView(Login, Database.session, name="Logins"))
    admin.add_view(ModelView(Payment, Database.session, name="Payments"))

    # Staff categories
    admin.add_view(ModelView(Doctor, Database.session, category="Staff", name="Doctors"))
    admin.add_view(ModelView(Nurse, Database.session, category="Staff", name="Nurses"))
    admin.add_view(ModelView(MLT, Database.session, category="Staff", name="MLT"))
    admin.add_view(ModelView(Radiologist, Database.session, category="Staff", name="Radiologists"))

    # Medical & Schedule Records
    admin.add_view(LabRecordAdmin(LabRecord, Database.session, category="Records", name="Lab Records"))
    admin.add_view(XrayRecordAdmin(XrayRecord, Database.session, category="Records", name="X-Ray Records"))
    admin.add_view(ModelView(Prescription, Database.session, category="Records", name="Prescriptions"))
    admin.add_view(FeedbackAdmin(Feedback, Database.session, category="Records", name="Feedback Records"))
    admin.add_view(ModelView(DoctorSchedule, Database.session, category="Schedules", name="Doctor Schedules"))