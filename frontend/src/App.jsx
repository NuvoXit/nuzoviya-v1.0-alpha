import { useState } from "react";
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import Home from "./main_pages/home.jsx";
import Patient from "./main_pages/patient.jsx";
import Booking from "./main_pages/booking.jsx";
import AddPatient from "./main_pages/mini_pages/add_patient.jsx";
import AllPatient from "./main_pages/mini_pages/all_patient.jsx";
import BookingPatient from "./main_pages/mini_pages/booking_patient.jsx";
import BookingHistory from "./main_pages/mini_pages/booking_history.jsx";
import Prescription from "./main_pages/mini_pages/prescription.jsx";
import PatientDashboard from "./main_pages/mini_pages/patient_dashboard.jsx";
import SurgicalProcedure from "./main_pages/mini_pages/surgical_procedure.jsx";
import Login from "./Login.jsx";
import "./App.css";

function App() {
    // const navigate = useNavigate();
    //
    // const handleLogout = () => {
    //     localStorage.removeItem("user");
    //
    //     navigate("/login");
    // };

    return (
        <BrowserRouter>
            <header className="navigation">
                <Link to="/" className="mainheading">Hospital Managment System</Link>
                <nav>
                    {/*<button onClick={handleLogout} className="logoutbut">*/}
                    {/*    Logout*/}
                    {/*</button>*/}
                    <Link to="/login" className="loginbut">Login</Link>
                </nav>
            </header>

            <div className="navverticalbar">
                <div className="verticalbar">
                    <Link to="/home" className="app-links">Home</Link>
                    <Link to="/patient" className="app-links">Patient</Link>
                    <Link to="/booking" className="app-links">Booking</Link>
                    <Link to="/cosult_patient_list" className="app-links">Patient List</Link>
                    <Link to="/dashboard" className="app-links">Dashboard</Link>
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
                        <Route path="/cosult_patient_list/</id>.dasboard/prescription" element={<Prescription />} />
                        <Route path="/cosult_patient_list/</id>.dasboard" element={<PatientDashboard />} />
                        <Route path="/cosult_patient_list/</id>.dasboard/surgical_procedure" element={<SurgicalProcedure />} />
                        <Route path="/login" element={<Login />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}

export default App;
