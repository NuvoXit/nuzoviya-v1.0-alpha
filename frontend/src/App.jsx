import React, { useState } from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import Home from './main_pages/home.jsx';
import Patient from './main_pages/patient.jsx';
import Booking from './main_pages/booking.jsx';
import Payment from './main_pages/payment.jsx';
import AddPatient from './main_pages/mini_pages/add_patient.jsx';
import AllPatient from './main_pages/mini_pages/all_patient.jsx';
import BookingPatient from './main_pages/mini_pages/booking_patient.jsx';
import BookingHistory from './main_pages/mini_pages/booking_history.jsx';
import Dashboard from './main_pages/dashboard.jsx';
import DoctorSchedule from './main_pages/doctor_schedule.jsx';

import Consulting from './main_pages/consulting.jsx';
import PatientDashboard from './main_pages/mini_pages/patient_dashboard.jsx';
import SurgicalProcedure from './main_pages/mini_pages/surgical_procedure.jsx';

import Prescription from './main_pages/mini_pages/prescription.jsx';
import Feedback from './main_pages/mini_pages/feedback.jsx';


import Testing_Patient from './main_pages/Testing_Patient.jsx';
import Test_Resources from './main_pages/mini_pages/test_resources.jsx';
import LabTest from './main_pages/mini_pages/lab_test.jsx';
import XrayTest from './main_pages/mini_pages/x-ray_test.jsx';
import Test_History from './main_pages/mini_pages/test_history.jsx';

import Logo from './main_pages/assets/Ndraw.svg';

import './App.css';

function App({ user: userProp, onLogout: onLogoutProp }) {
  const [localUser, setLocalUser] = useState({
    username: localStorage.getItem('username'),
    role: localStorage.getItem('role'),
  });

  const user = userProp ?? localUser;
  const location = useLocation();
  const pathname = location.pathname;

  // Helper to check if a sidebar link is active
  const isActive = (path) => pathname === path || pathname.startsWith(path + '/');

  const handleLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    setLocalUser({ username: null, role: null });
    if (onLogoutProp) onLogoutProp();
  };

  const requireRole = (role, element) => {
    if (!user.username) {
      return <Navigate to="/login" replace />;
    }
    // Support checking multiple roles
    const roles = Array.isArray(role) ? role : [role];
    if (!roles.includes(user.role)) {
      return <Navigate to="/home" replace />;
    }
    return element;
  };

  return (
    <>
      {/* Header and navigation bar */}
      <header className="navigation">
        <Link to="/" className="mainheading">
          
          <img src={Logo} alt="Logo" className="logo" />
        </Link>
        <nav>
          <div className="DateTime">
            {new Date().toLocaleDateString()} | {new Date().toLocaleTimeString()}
          </div>
            
          <div className="user-info">
            {user.username ? `Welcome, ${user.username} [${user.role}]` : 'Not logged in'}
          </div>
          <Link to="/login" className="app-links" onClick={handleLogout}>
            Logout
          </Link>
        </nav>
      </header>




      
      <div className="navverticalbar">
        <div className="verticalbar">

          <Link to="/home" className={`app-links${isActive('/home') ? ' app-links--active' : ''}`}>
            Home
          </Link>

          {user.role === 'Receptionist' && (
            <>
              <Link to="/patient" className={`app-links${isActive('/patient') ? ' app-links--active' : ''}`}>
                Patient
              </Link>
              <Link to="/booking" className={`app-links${isActive('/booking') ? ' app-links--active' : ''}`}>
                Booking
              </Link>
              <Link to="/payment" className={`app-links${isActive('/payment') ? ' app-links--active' : ''}`}>
                Payment
              </Link>
              <Link to="/dashboard" className={`app-links${isActive('/dashboard') ? ' app-links--active' : ''}`}>
                Dashboard
              </Link>
              <Link to="/doctor_schedule" className={`app-links${isActive('/doctor_schedule') ? ' app-links--active' : ''}`}>
                Doctor Schedule
              </Link>
            </>
          )}

          {user.role === 'Doctor' && (
            <Link to="/consult_patient_list" className={`app-links${isActive('/consult_patient_list') ? ' app-links--active' : ''}`}>
              Patient List
            </Link>
          )}

          {['MLT', 'Radiologist'].includes(user.role) && (
            <>
              <Link to="/diagnostic_services_patient_list" className={`app-links${isActive('/diagnostic_services_patient_list') ? ' app-links--active' : ''}`}>
                Diagnostic Services Patient List
              </Link>

              <Link to="/test_reports_history" className={`app-links${isActive('/test_reports_history') ? ' app-links--active' : ''}`}>
                Test Reports History
              </Link>
            </>
          )}

        </div>
        <main className="app-content">
          <Routes>
            <Route path="/home" element={<Home />} />

            <Route path="/patient" element={requireRole('Receptionist', <Patient />)} />
            <Route path="/patient/add_patient" element={requireRole('Receptionist', <AddPatient />)} />
            <Route path="/patient/all_patients" element={requireRole('Receptionist', <AllPatient />)} />

            <Route path="/booking" element={requireRole('Receptionist', <Booking />)} />
            <Route path="/booking/booking_patient" element={requireRole('Receptionist', <BookingPatient />)} />
            <Route path="/booking/booking_history" element={requireRole('Receptionist', <BookingHistory />)} />

            <Route path="/payment" element={requireRole('Receptionist', <Payment />)} />

            <Route path="/dashboard" element={requireRole('Receptionist', <Dashboard />)} />
            <Route path="/doctor_schedule" element={requireRole('Receptionist', <DoctorSchedule />)} />

            {/*Patient List Button Routes*/}
            <Route path="/consult_patient_list" element={requireRole('Doctor', <Consulting />)} />
            <Route path="/consult_patient_list/:id/dashboard" element={requireRole('Doctor', <PatientDashboard />)} />
            <Route path="/consult_patient_list/:id/dashboard/prescription" element={requireRole('Doctor', <Prescription />)} />
            <Route path="/consult_patient_list/:id/dashboard/surgical_procedure" element={requireRole('Doctor', <SurgicalProcedure />)} />
            <Route path="/consult_patient_list/:id/dashboard/feedback" element={requireRole('Doctor', <Feedback />)} />
            <Route path="/consult_patient_list/:id/dashboard/lab_test" element={requireRole('Doctor', <LabTest />)} />

            <Route path="/diagnostic_services_patient_list" element={requireRole(['MLT', 'Radiologist'], <Testing_Patient />)} />
            <Route path="/diagnostic_services_patient_list/:id/test_files" element={requireRole(['MLT', 'Radiologist'], <Test_Resources />)} />
            <Route path="/diagnostic_services_patient_list/:id/xray_test" element={requireRole(['Radiologist', 'Doctor'], <XrayTest />)} />
            <Route path="/test_reports_history" element={requireRole(['MLT', 'Radiologist'], <Test_History />)} />


            <Route path="/" element={<Navigate to="/home" replace />} />
          </Routes>
        </main>
      </div>
    </>
  );
}

export default App;
