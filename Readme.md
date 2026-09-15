# 🏥 Nuzoviya Medical Platform

> **Nuzoviya Medical Platform v1.0.0 Alpha — Lite Edition**
> A lightweight Hospital Information System (HIS) and Clinical Management Platform built with **React + Vite** and **Python Flask**.

---

## 📋 Overview

<div align="justify">

Nuzoviya is designed to support common hospital and clinical workflows, including patient registration and NIC-based patient identification, doctor appointment scheduling, doctor availability management, cashier and hospital fee management, payment-verified doctor consultations, digital prescriptions, laboratory testing workflows, radiology workflows, and surgical procedure management. The system also incorporates Role-Based Access Control (RBAC) to ensure secure and controlled access to information, along with Flask-Admin functionality for efficient staff and user management.

</div>

> ⚠️ **Alpha Notice:** This is an early release. Some features are still under development and may change in future versions.

---

## 🛠️ Tech Stack

| **Backend** | **Frontend** | **Development Tools** |
|---|---|---|
| Python 3.10+ | React 19 | `uv` — Python environment and package management |
| Flask | Vite | `npm` — Frontend package management |
| Flask-SQLAlchemy / SQLAlchemy | React Router | |
| Flask-CORS | Three.js | |
| Flask-Admin | React Three Fiber | |
| WTForms | React Datepicker | |
| Werkzeug | Responsive CSS | |
| SQLite | | |

---

## 🚀 Quick Start (First Install ALL Dependencies)

### Windows

Run the provided launcher:

```cmd
.\start_project.bat
```

This starts:

```text
Backend:  http://127.0.0.1:5000
Frontend: http://localhost:5173
```

---

## ⚙️ Manual Setup

### Backend

From the project root:

```powershell
uv venv
```

Activate the environment:

```powershell
.venv\Scripts\Activate.ps1
```

Install dependencies:

```powershell
uv pip install -r backend/requirements.txt
```

Run Flask:

```powershell
python backend/main.py
```

### Frontend

Open another terminal:

```powershell
cd frontend
npm install
npm run dev
```

---

## 🔐 User Roles

The platform supports the following roles:

| Role         | Main Responsibilities                   |
| ------------ | --------------------------------------- |
| Admin        | System and staff management             |
| Doctor       | Consultation, prescriptions, schedules  |
| Nurse        | Patient and surgical support            |
| MLT          | Laboratory testing and results          |
| Radiologist  | Radiology and diagnostic reports        |
| Receptionist | Registration, appointments and payments |

---

## 🏥 Core Modules

> **Note:** Nuzoviya currently does not use any third-party email or SMS services. Integration with email and SMS services will be considered as a future enhancement.

* **Patient Management** — Registration and patient search using NIC.
* **Appointment Booking** — Doctor selection and appointment scheduling.
* **Doctor Schedule** — Manage available consultation slots.
* **Payment** — Hospital, doctor, laboratory, and radiology fees.
* **Consulting** — Payment-verified consultation workflow.
* **Prescription** — Digital prescriptions and clinical orders.
* **Laboratory** — MLT testing queue and result management.
* **Radiology** — X-Ray, CT, and ultrasound workflows.
* **Surgical Procedures** — Procedure management and nurse assignment.
* **Test History** — Access previous diagnostic results.
* **Admin Panel** — Manage staff and user accounts.  
  `http://127.0.0.1:5000/admin`
---

## 📁 Project Structure

```text
nuzoviya-v1.0.0-alpha/
│
├── LICENSE.txt
├── pyproject.toml
├── README.md
├── start_project.bat
│
├── backend/
│   ├── requirements.txt
│   ├── main.py
│   ├── models.py
│   ├── config.py
│   ├── admin.py
│   ├── form.py
│   ├── instance/
│   └── uploads/
│
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    │
    └── src/
        ├── main.jsx
        ├── app.jsx
        ├── login.jsx
        ├── splash.jsx
        ├── protectedroute.jsx
        ├── app.css
        ├── dark.css
        │
        ├── main_pages/
        │   ├── home.jsx
        │   ├── patient.jsx
        │   ├── booking.jsx
        │   ├── payment.jsx
        │   ├── consulting.jsx
        │   ├── dashboard.jsx
        │   ├── doctor_schedule.jsx
        │   ├── testing_patient.jsx
        │   └── test_history.jsx
        │
        └── assets/
```

---

## 🔑 Admin Panel

Staff and user accounts are managed through the Flask-Admin panel.

```text
http://127.0.0.1:5000/admin
```

There is intentionally **no public staff registration page**.

Administrators can create and manage:

* Doctors
* Nurses
* MLTs
* Radiologists
* Receptionists
* User login accounts

---

## 🐛 Issues & Support

Nuzoviya is currently an **Alpha project**, so bugs, unexpected behavior and incomplete features are possible.

If you find a problem:

1. Check the existing **GitHub Issues** first.
2. If the issue has not already been reported, create a new issue.
3. Include:

   * A clear description of the problem
   * Steps to reproduce it
   * Expected behavior
   * Actual behavior
   * Error messages or screenshots
   * Operating system and environment information

### 💡 Feature Requests

Feature suggestions and improvements are welcome.

Please open a GitHub Issue and use a clear description of the proposed feature and its purpose.



### 👤 Contributor (Special Thanks)

**Kudaliyana Waduge Sanithu Hasmal Kudaliyana** – [GitHub](https://github.com/Sanithu-2005) | [LinkedIn](https://www.linkedin.com/in/sanithukudaliyana)

[Contributions include](https://github.com/NuvoXit/nuzoviya-v1.0-alpha/activity):
* Forms, data-transfer objects and more frontends
* Responsive CSS and UI components
* Python testing
* Frontend and clinical workflow improvements
* Some backend works
* He's better at using GitHub than me 😊

---

## 📄 [License](LICENSE.txt)




