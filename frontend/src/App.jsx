import React, { useState } from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
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

import Prescription from "./main_pages/mini_pages/prescription.jsx";
import Feedback from "./main_pages/mini_pages/feedback.jsx";





import "./App.css";

function App({ user: userProp, onLogout: onLogoutProp }) {

    const [localUser, setLocalUser] = useState({
        username: localStorage.getItem("username"),
        role: localStorage.getItem("role"),
    });

    const user = userProp ?? localUser;

    const handleLogout = () => {
        localStorage.removeItem("username");
        localStorage.removeItem("role");
        setLocalUser({ username: null, role: null });
        if (onLogoutProp) onLogoutProp();
    };

    const requireRole = (role, element) => {
        if (!user.username) {
            return <Navigate to="/login" replace />;
        }
        if (user.role !== role) {
            return <Navigate to="/home" replace />;
        }
        return element;
    };

    return (
        <>
            <header className="navigation">
               <Link to="/" className="mainheading">Hospital Management System</Link>
                <nav>
                        {user.username ? `Welcome, ${user.username} (${user.role})` : "Not logged in"}
                        <Link to="/login" className="app-links" onClick={handleLogout}>Logout</Link>
                </nav>
            </header>
            <div className="navverticalbar">
                <div className="verticalbar">
                    <Link to="/home" className="app-links">Home</Link>
                    {user.role === "Receptionist" && (
                        <>
                            <Link to="/patient" className="app-links">Patient</Link>
                            <Link to="/booking" className="app-links">Booking</Link>
                        </>
                    )}
                    {user.role === "Doctor" && (
                        <Link to="/consult_patient_list" className="app-links">Patient List</Link>
                    )}
                    
                </div>
                <main className="app-content">
                    <Routes>
                        <Route path="/home" element={<Home />} />

                        <Route path="/patient" element={requireRole("Receptionist", <Patient />)} />
                        <Route path="/patient/add_patient" element={requireRole("Receptionist", <AddPatient />)} />
                        <Route path="/patient/all_patients" element={requireRole("Receptionist", <AllPatient />)} />

                        <Route path="/booking" element={requireRole("Receptionist", <Booking />)} />
                        <Route path="/booking/booking_patient" element={requireRole("Receptionist", <BookingPatient />)} />
                        <Route path="/booking/booking_history" element={requireRole("Receptionist", <BookingHistory />)} />


                        {/*Patient List Button Routes*/}
                        <Route path="/consult_patient_list" element={requireRole("Doctor", <Consulting />)} />
                        <Route path="/consult_patient_list/:id/dashboard" element={requireRole("Doctor", <PatientDashboard />)} />
                        <Route path="/consult_patient_list/:id/dashboard/prescription" element={requireRole("Doctor", <Prescription />)} />
                        <Route path="/consult_patient_list/:id/dashboard/surgical_procedure" element={requireRole("Doctor", <SurgicalProcedure />)} />
                        <Route path="/consult_patient_list/:id/dashboard/feedback" element={requireRole("Doctor", <Feedback />)} />

                        
                        

                        <Route path="/" element={<Navigate to="/home" replace />} />
                    </Routes>
                </main>
            </div>
        </>
    );
}

export default App;
