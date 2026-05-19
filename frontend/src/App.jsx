import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import Home from "./main_pages/home.jsx";
import Patient from "./main_pages/patient.jsx";
import Booking from "./main_pages/booking.jsx";
import AddPatient from "./main_pages/mini_pages/add_patient.jsx";
import AllPatient from "./main_pages/mini_pages/all_patient.jsx";
import BookingPatient from "./main_pages/mini_pages/booking_patient.jsx";
import BookingHistory from "./main_pages/mini_pages/booking_history.jsx";

import Consulting from "./main_pages/consulting.jsx";
import PatientDashboard from "./main_pages/mini_pages/patient_dashboard.jsx";
import SurgicalProcedure from "./main_pages/mini_pages/surgical_procedure.jsx";
<<<<<<< HEAD
import Prescription from "./main_pages/mini_pages/prescription.jsx";
import Feedback from "./main_pages/mini_pages/feedback.jsx";

=======
import Consulting from "./main_pages/consulting.jsx";
>>>>>>> e4c245be8c162f2728500f8fb181d4c3ec5796a3
import Login from "./Login.jsx";
import "./App.css";

function App() {

    const [data, setData] = useState(null);

    useEffect(() => {
    fetch("http://127.0.0.1:5000")
      .then((response) => response.json())
      .then((result) => {setData(result);})
      .catch((error) => {console.error("Fetch error:", error);});
    }, []);

    return (
        <BrowserRouter>
            <header className="navigation">
                <Link to="/" className="mainheading">Hospital Managment System</Link>
                <nav>
                    <Link to="/login" className="loginbut">Login</Link>
                </nav>
            </header>
            <div className="navverticalbar">
                <div className="verticalbar">
                    <Link to="/home" className="app-links">Home</Link>
                    <Link to="/patient" className="app-links">Patient</Link>
                    <Link to="/booking" className="app-links">Booking</Link>
<<<<<<< HEAD
                    <Link to="/cosult_patient_list" className="app-links">Patient List</Link>
=======
                    <Link to="/patient/all_patients" className="app-links">Patient List</Link>
                    <Link to="/cosult_patient_list" className="app-links">Dashboard</Link>
>>>>>>> e4c245be8c162f2728500f8fb181d4c3ec5796a3
                </div>
                <main className="app-content">
                    <Routes>
                        <Route path="/home" element={<Home />} />

                        <Route path="/patient" element={<Patient />} />
                        <Route path="/patient/add_patient" element={<AddPatient />} />
                        <Route path="/patient/all_patients" element={<AllPatient />} />

                        <Route path="/booking" element={<Booking />} />
                        <Route path="/booking/booking_patient" element={<BookingPatient />} />
                        <Route path="/booking/booking_history" element={<BookingHistory />} />
<<<<<<< HEAD

                        {/*Patient List Button Routes*/}
                        <Route path="/cosult_patient_list" element={<Consulting />} />
                        <Route path="/cosult_patient/<int:cosult_patient_id>/dashboard" element={<PatientDashboard />} />
                        <Route path="/cosult_patient/<int:cosult_patient_id>/dashboard/prescription" element={<Prescription />} />
                        <Route path="/cosult_patient/<int:cosult_patient_id>/dashboard/surgical_procedure" element={<SurgicalProcedure />} />
                        <Route path="/cosult_patient/<int:cosult_patient_id>/dashboard/feedback" element={<Feedback />} />


=======
                        <Route path="/cosult_patient_list" element={<Consulting />} />
                        <Route path="/cosult_patient_list/:id/dashboard" element={<PatientDashboard />} />
                        <Route path="/cosult_patient_list/:id/dashboard/prescription" element={<Prescription />} />
                        <Route path="/cosult_patient_list/:id/dashboard/surgical_procedure" element={<SurgicalProcedure />} />
                        <Route path="/patient/all_patients/feedback" element={<Feedback />} />
>>>>>>> e4c245be8c162f2728500f8fb181d4c3ec5796a3
                        <Route path="/login" element={<Login />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}

export default App;
