import { useState, useEffect } from 'react';
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
import ScheduledSurgicalProcedure from './main_pages/scheduled_surgical_procedure.jsx';
import BigView from './main_pages/mini_pages/big_view.jsx';


import Testing_Patient from './main_pages/testing_patient.jsx';
import Test_Resources from './main_pages/mini_pages/test_resources.jsx';
import LabTest from './main_pages/mini_pages/lab_test.jsx';
import XrayTest from './main_pages/mini_pages/x-ray_test.jsx';
import Test_History from './main_pages/test_history.jsx';
import AdditionalResearch from './main_pages/additional_research.jsx';
import SampleCollection from './main_pages/sample_collection.jsx';
import CriticalResults from './main_pages/critical_results.jsx';
import LaboratoryResults from './main_pages/laboratory_results.jsx';
import XrayAdditionalTest from './main_pages/x-ray_additional_test.jsx';

import Email from './additional/email.jsx';
import Messages from './additional/messages.jsx';
import AIAssistant from './additional/ai_assistant.jsx';
import Report from './main_pages/report.jsx';
import nuzoviyaLogo from './main_pages/assets/nuzoviya.png';

import './app.css';
import './dark.css';

function App({ user: userProp, onLogout: onLogoutProp }) {
  const [localUser, setLocalUser] = useState({
    username: localStorage.getItem('username'),
    role: localStorage.getItem('role'),
  });
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const user = userProp ?? localUser;
  const location = useLocation();
  const pathname = location.pathname;

  // Helper to check if a sidebar link is active
  const isActive = (path) => pathname === path || pathname.startsWith(path + '/');

  // Dynamically update browser tab name for every page
  useEffect(() => {
    const tabNames = {
      '/home': 'Nuzoviya | Home',
      '/patient': 'Nuzoviya | Patient',
      '/patient/add_patient': 'Nuzoviya | Add Patient',
      '/patient/all_patients': 'Nuzoviya | All Patients',
      '/booking': 'Nuzoviya | Booking',
      '/booking/booking_patient': 'Nuzoviya | New Booking',
      '/booking/booking_history': 'Nuzoviya | Booking History',
      '/payment': 'Nuzoviya | Payment',
      '/dashboard': 'Nuzoviya | Dashboard',
      '/doctor_schedule': 'Nuzoviya | Doctor Schedule',
      '/report': 'Nuzoviya | Reports',
      '/consult_patient_list': 'Nuzoviya | Consulting Patient List',
      '/scheduled_surgery': 'Nuzoviya | Scheduled Surgery',
      '/diagnostic_services_patient_list': 'Nuzoviya | Testing Patients',
      '/laboratory_results': 'Nuzoviya | Laboratory Results',
      '/test_reports_history': 'Nuzoviya | Test Reports History',
      '/critical_results': 'Nuzoviya | Critical Results',
      '/sample_collection': 'Nuzoviya | Sample Collection',
      '/xray_additional_test': 'Nuzoviya | X-Ray Additional Test',
      '/additional_research': 'Nuzoviya | Additional Research',
      '/email': 'Nuzoviya | Email',
      '/messages': 'Nuzoviya | Messages',
      '/ai_assistant': 'Nuzoviya | AI Assistant',
      '/login': 'Nuzoviya | Login',
    };

    let title = tabNames[pathname];
    if (!title) {
      if (pathname.includes('/prescription')) title = 'Nuzoviya | Prescription';
      else if (pathname.includes('/surgical_procedure')) title = 'Nuzoviya | Surgical Procedure';
      else if (pathname.includes('/feedback')) title = 'Nuzoviya | Feedback';
      else if (pathname.includes('/lab_test')) title = 'Nuzoviya | Lab Test';
      else if (pathname.includes('/xray_test')) title = 'Nuzoviya | X-Ray Test';
      else if (pathname.includes('/dashboard')) title = 'Nuzoviya | Patient Dashboard';
      else if (pathname.includes('/test_files')) title = 'Nuzoviya | Test Resources';
      else if (pathname.includes('/big_view')) title = 'Nuzoviya | Surgery Details';
      else title = 'Nuzoviya';
    }

    document.title = title;
  }, [pathname]);

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
          <img src={nuzoviyaLogo} alt="Nuzoviya Medical" className="brand-logo" />
        </Link>
        <nav>
          <div className="DateTime">
            {currentDateTime.toLocaleDateString()} | {currentDateTime.toLocaleTimeString()}
          </div>
            
          <div className="user-info">
            {user.username ? `Welcome, ${user.username} [${user.role}]` : 'Not logged in'}
          </div>
        </nav>
      </header>




      
      <div className="navverticalbar">
        <div className="verticalbar">
          <div className="verticalbar-menu">
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
                <Link to="/report" className={`app-links${isActive('/report') ? ' app-links--active' : ''}`}>
                  Reports
                </Link>
              </>
            )}

            {user.role === 'Doctor' && (
              <>
                <Link to="/consult_patient_list" className={`app-links${isActive('/consult_patient_list') ? ' app-links--active' : ''}`}>
                  Patient List
                </Link>
                <Link to="/scheduled_surgery" className={`app-links${isActive('/scheduled_surgery') ? ' app-links--active' : ''}`}>
                  Scheduled Surgery
                </Link>
              </>
            )}

            {['MLT', 'Radiologist'].includes(user.role) && (
              <>
                <Link to="/diagnostic_services_patient_list" className={`app-links${isActive('/diagnostic_services_patient_list') ? ' app-links--active' : ''}`}>
                  Diagnostic Services Patient List
                </Link>

                <Link to="/laboratory_results" className={`app-links${isActive('/laboratory_results') ? ' app-links--active' : ''}`}>
                  Laboratory Results
                </Link>

                <Link to="/test_reports_history" className={`app-links${isActive('/test_reports_history') ? ' app-links--active' : ''}`}>
                  Test Reports History
                </Link>

                

                {user.role === 'MLT' && (
                  <>
                    <Link to="/sample_collection" className={`app-links${isActive('/sample_collection') ? ' app-links--active' : ''}`}>
                      Sample Collection
                    </Link>
                  </>
                )}

                {user.role === 'Radiologist' && (
                  <>
                    <Link to="/xray_additional_test" className={`app-links${isActive('/xray_additional_test') ? ' app-links--active' : ''}`}>
                      X-ray Additional Test
                    </Link>
                  </>
                )}


                <Link to="/critical_results" className={`app-links${isActive('/critical_results') ? ' app-links--active' : ''}`}>
                      Critical Results
                </Link>

                <Link to="/additional_research" className={`app-links${isActive('/additional_research') ? ' app-links--active' : ''}`}>
                      Additional Research
                </Link>
              </>
            )}
          </div>

          {/* Bottom Section: Quick Communication Tools */}
          <div className="verticalbar-bottom">
            <div className="sidebar-comm-section" title="Hospital Communications">
              {/* <span className="sidebar-comm-title">Communications</span> */}
              <div className="sidebar-comm-buttons">
                <Link to="/email" className={`sidebar-comm-btn${isActive('/email') ? ' sidebar-comm-btn--active' : ''}`}>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <span>Email</span>
                </Link>

                <Link to="/messages" className={`sidebar-comm-btn${isActive('/messages') ? ' sidebar-comm-btn--active' : ''}`}>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <span>Messages</span>
                </Link>

                <Link to="/ai_assistant" className={`sidebar-comm-btn${isActive('/ai_assistant') ? ' sidebar-comm-btn--active' : ''}`}>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
                  </svg>
                  <span>AI Assistant</span>
                </Link>
              </div>
            </div>

            {/* Bottom Segmented Bar: [ (⏻) | Word / Center | (🌙/☀️) Theme ] */}
            <div className="sidebar-bottom-bar">
              <Link to="/login" className="bottom-bar-item bottom-bar-logout" onClick={handleLogout} title="Log Out / Shut Down Session">
                <svg className="shutdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                  <line x1="12" y1="2" x2="12" y2="12" />
                </svg>
              </Link>

              <div className="bottom-bar-item bottom-bar-center">
                <span>Session</span>
              </div>

              <button
                type="button"
                className="bottom-bar-item bottom-bar-theme"
                onClick={toggleTheme}
                title={`Switch to ${theme === 'light' ? 'Dark' : 'White'} Mode`}
              >
                {theme === 'light' ? (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
        
        <main className="app-content">
          <Routes>
            <Route path="/home" element={<Home />} />

            <Route path="/email" element={<Email />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/ai_assistant" element={<AIAssistant />} />
            <Route path="/report" element={<Report />} />

            <Route path="/patient" element={requireRole('Receptionist', <Patient />)} />
            <Route path="/patient/add_patient" element={requireRole('Receptionist', <AddPatient />)} />
            <Route path="/patient/all_patients" element={requireRole('Receptionist', <AllPatient />)} />

            <Route path="/booking" element={requireRole('Receptionist', <Booking />)} />
            <Route path="/booking/booking_patient" element={requireRole('Receptionist', <BookingPatient />)} />
            <Route path="/booking/booking_history" element={requireRole('Receptionist', <BookingHistory />)} />

            <Route path="/payment" element={requireRole('Receptionist', <Payment />)} />

            <Route path="/dashboard" element={requireRole('Receptionist', <Dashboard />)} />
            <Route path="/doctor_schedule" element={requireRole('Receptionist', <DoctorSchedule />)} />

            {/*Doctor Patient List & Scheduled Surgery Routes*/}
            <Route path="/consult_patient_list" element={requireRole('Doctor', <Consulting />)} />
            <Route path="/consult_patient_list/:id/dashboard" element={requireRole('Doctor', <PatientDashboard />)} />
            <Route path="/consult_patient_list/:id/dashboard/prescription" element={requireRole('Doctor', <Prescription />)} />
            <Route path="/consult_patient_list/:id/dashboard/surgical_procedure" element={requireRole('Doctor', <SurgicalProcedure />)} />
            <Route path="/consult_patient_list/:id/dashboard/feedback" element={requireRole('Doctor', <Feedback />)} />
            <Route path="/consult_patient_list/:id/dashboard/lab_test" element={requireRole('Doctor', <LabTest />)} />
            <Route path="/consult_patient_list/:id/dashboard/xray_test" element={requireRole('Doctor', <XrayTest />)} />

            <Route path="/scheduled_surgery" element={requireRole('Doctor', <ScheduledSurgicalProcedure />)} />
            <Route path="/scheduled_surgery/:id/big_view" element={requireRole('Doctor', <BigView />)} />

            <Route path="/diagnostic_services_patient_list" element={requireRole(['MLT', 'Radiologist'], <Testing_Patient />)} />
            <Route path="/diagnostic_services_patient_list/:id/test_files" element={requireRole(['MLT', 'Radiologist'], <Test_Resources />)} />
            <Route path="/diagnostic_services_patient_list/:id/xray_test" element={requireRole(['Radiologist', 'Doctor'], <XrayTest />)} />
            <Route path="/laboratory_results" element={requireRole(['MLT', 'Radiologist'], <LaboratoryResults />)} />
            <Route path="/test_reports_history" element={requireRole(['MLT', 'Radiologist'], <Test_History />)} />
            <Route path="/critical_results" element={requireRole(['MLT', 'Radiologist'], <CriticalResults />)} />
            <Route path="/sample_collection" element={requireRole('MLT', <SampleCollection />)} />
            <Route path="/xray_additional_test" element={requireRole('Radiologist', <XrayAdditionalTest />)} />
            <Route path="/additional_research" element={requireRole(['MLT', 'Radiologist'], <AdditionalResearch />)} />


            <Route path="/" element={<Navigate to="/home" replace />} />
          </Routes>
        </main>
      </div>

      {/* Full-width bottom footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <span>Nuzoviya Medical Platform © {new Date().getFullYear()}</span>
          <span className="footer-divider">•</span>
          <span>24/7 Patient Care</span>
          <span className="footer-divider">•</span>
          <span>Secure Clinical Records</span>
          <span className="footer-divider">•</span>
          <span>Hospital Information System</span>
        </div>
      </footer>
    </>
  );
}

export default App;
