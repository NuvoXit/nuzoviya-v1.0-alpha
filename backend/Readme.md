# Medical Admin PANEL

## admin.py

Assigned the admin name as **Medical Admin PANEL**.

LabRecord, X-ray, and Stamp image saving paths are given (any format).

    "allowed_extensions": [
        "pdf",
        "png",
        "jpg",
        "jpeg"
    ]

The `init_admin` function contains the **patient booking, logins, and payments**.

### Staff

- Doctors
- Nurses
- MLT
- Radiologist

### Records

- Lab Records
- X-ray Records
- Prescription
- Feedback
- Doctor Schedules


# config.py

## Flask CORS and SQLAlchemy

Flask CORS and SQLAlchemy have been implemented in the application.

### CORS Configuration

The application allows requests from the following frontend origins:

    origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

### Database Configuration

A SQLAlchemy `instance` folder and `database.db` SQLite database are used for database storage.

    Application.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{clean_db_path}"
    Application.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    Application.config["SECRET_KEY"] = "Nuzoviya-secret-key-change-in-production"

The `SQLALCHEMY_DATABASE_URI` connects the application to the SQLite database, `SQLALCHEMY_TRACK_MODIFICATIONS` is disabled, and a secret key is configured for the application.


# model.py and form.py

Here, `normalize_and_validate_telephone` is used to validate and normalize the telephone number when the user enters it. The `_to_date` and `_to_time` functions are used for date and time validation.

User roles have been assigned, and the `Login` and `Patient` classes have been added.

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
        UserRole,
        XrayRecord,
        _to_date,
        _to_time,
        normalize_and_validate_telephone,
    )

Validation has been implemented for the following forms:

- PrescriptionForm
- FeedbackForm
- DoctorScheduleForm
- LabRecordForm
- RadiologistForm
- MLTForm
- NurseForm
- DoctorForm
- LoginForm
- PaymentForm
- BookingForm
- PatientForm


# main.py

`main.py` consists of routes and more than 1,000 lines of code.