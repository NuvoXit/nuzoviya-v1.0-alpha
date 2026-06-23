from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from config import Database
from models import Patient, Booking, Login, Doctor, Nurse
# from models import Radiologist, MLT, Optician


admin = Admin(name="Medical Admin Panel")

def init_admin(app):

    admin.init_app(app)

    admin.add_view(ModelView(Patient, Database.session))
    admin.add_view(ModelView(Booking, Database.session))
    admin.add_view(ModelView(Login, Database.session))
    admin.add_view(ModelView(Doctor, Database.session, category="Staff"))
    admin.add_view(ModelView(Nurse, Database.session, category="Staff"))
    # admin.add_view(ModelView(Radiologist, Database.session, category="Staff"))
    # admin.add_view(ModelView(MLT, Database.session, category="Staff"))
    # admin.add_view(ModelView(Optician, Database.session, category="Staff"))
