from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView

from flask_admin.theme import Bootstrap4Theme

from config import db
from models import Patient, Booking, Login

admin = Admin(name="Medical Admin Panel", theme=Bootstrap4Theme())


class PatientAdmin(ModelView):
    form_columns = [
        "NIC",
        "first_name",
        "last_name",
        "DOB",
        "address",
        "telephone",
        "email",
    ]


def init_admin(app):

    admin.init_app(app)

    admin.add_view(PatientAdmin(Patient, db.session))
    admin.add_view(ModelView(Booking, db.session))
    admin.add_view(ModelView(Login, db.session))
