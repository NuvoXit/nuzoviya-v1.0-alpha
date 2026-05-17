from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from flask_admin.theme import Bootstrap4Theme

from config import Database
from models import Patient, Booking, Login, Nurse, Doctor   


admin = Admin(name="Medical Admin Panel", theme=Bootstrap4Theme())

def init_admin(app):

    admin.init_app(app)

    admin.add_view(ModelView(Patient, Database.session))
    admin.add_view(ModelView(Booking, Database.session))
    admin.add_view(ModelView(Login, Database.session))
    admin.add_view(ModelView(Nurse, Database.session))
    admin.add_view(ModelView(Doctor, Database.session))
