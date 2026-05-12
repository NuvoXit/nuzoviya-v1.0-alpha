import { useState } from "react";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import Home from "./main_pages/home.jsx";
import Patient from "./main_pages/patient.jsx";
import Booking from "./main_pages/booking.jsx";
import AddPatient from "./main_pages/mini_pages/add_patient.jsx";
import AllPatient from "./main_pages/mini_pages/all_patient.jsx";
import BookingPatient from "./main_pages/mini_pages/booking_patient.jsx";
import BookingHistory from "./main_pages/mini_pages/booking_history.jsx";
import Login from "./Login.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import "./App.css";

function App() {
    const [role, setRole] = useState(localStorage.getItem('role'));  // fixed: useState so sidebar reacts to changes

    const handleLogout = () => {
        localStorage.removeItem('role');
        localStorage.removeItem('username');
        setRole(null);  // triggers re-render immediately
        window.location.href = '/login';
    };

    return (
        <BrowserRouter>
            <header className="navigation">
                <h2>Nuvu</h2>
                <nav>
                    {role ? (
                        <span style={{ cursor: 'pointer' }} onClick={handleLogout}>
                            Logout
                        </span>
                    ) : (
                        <Link to="/login">Login</Link>
                    )}
                </nav>
            </header>

            <div className="navverticalbar">
                <div className="verticalbar">
                    <Link to="/home">Home</Link>

                    {(role === 'user' || role === 'admin') && (
                        <>
                            <Link to="/patient">Patient</Link>
                            <Link to="/booking">Booking</Link>
                        </>
                    )}

                    {/* admin only sidebar link */}
                    {role === 'admin' && (
                        <Link to="/booking_history">Booking History</Link>
                    )}
                </div>

                <main className="content">
                    <Routes>
                        <Route path="/login" element={
                          <Login onLogin={(r) => setRole(r)} />
                        } />
                        <Route path="/" element={<Navigate to="/login" replace />} />
                        <Route path="/unauthorized" element={<h2 style={{padding:'2rem'}}>Access Denied.</h2>} />

                        <Route path="/home" element={
                            <ProtectedRoute allowedRoles={['admin', 'user', 'guest']}>
                                <Home />
                            </ProtectedRoute>
                        } />
                        <Route path="/patient" element={
                            <ProtectedRoute allowedRoles={['admin', 'user']}>
                                <Patient />
                            </ProtectedRoute>
                        } />
                        <Route path="/patient/add_patient" element={
                            <ProtectedRoute allowedRoles={['admin', 'user']}>
                                <AddPatient />
                            </ProtectedRoute>
                        } />
                        <Route path="/patient/all_patients" element={
                            <ProtectedRoute allowedRoles={['admin', 'user']}>
                                <AllPatient />
                            </ProtectedRoute>
                        } />
                        <Route path="/booking" element={
                            <ProtectedRoute allowedRoles={['admin', 'user']}>
                                <Booking />
                            </ProtectedRoute>
                        } />
                        <Route path="/booking/booking_patient" element={
                            <ProtectedRoute allowedRoles={['admin', 'user']}>
                                <BookingPatient />
                            </ProtectedRoute>
                        } />
                        <Route path="/booking_history" element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <BookingHistory />
                            </ProtectedRoute>
                        } />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}

export default App;
