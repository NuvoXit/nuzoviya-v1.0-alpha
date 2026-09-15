import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './booking_patient.css';

function BookingPatient() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    nic: '',
    telephone: '',
    doctorName: '',
    doctorFullName: '',
    doctorId: null,
    appointmentDate: '',
    appointmentTime: '',
  });

  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [doctorSchedules, setDoctorSchedules] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [patientSuggestions, setPatientSuggestions] = useState([]);
  
  // Utility to format local Date object to YYYY-MM-DD string without timezone drift
  const formatToLocalDateString = (d) => {
    if (!d) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Utility to parse YYYY-MM-DD string into safe local noon Date object
  const parseLocalDate = (dateStr) => {
    if (!dateStr) return null;
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d, 12, 0, 0);
  };

  const selectPatient = (patient) => {
    setForm((prev) => ({
      ...prev,
      firstName: patient.first_name || '',
      lastName: patient.last_name || '',
      nic: patient.nic || '',
      telephone: patient.telephone || '',
    }));
    setPatientSuggestions([]);
  };

  const handlePatientSearch = async (query) => {
    if (!query || query.trim().length === 0) {
      setPatientSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:5000/patient/search_patients?query=${encodeURIComponent(query.trim())}`);
      if (!response.ok) {
        setPatientSuggestions([]);
        return;
      }
      const list = await response.json();
      setPatientSuggestions(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Error searching patients:', error);
      setPatientSuggestions([]);
    }
  };

  const selectDoctor = async (doctor) => {
    const fullName = doctor.name || `${doctor.first_name || ''} ${doctor.last_name || ''}`.trim();

    setForm((prev) => ({
      ...prev,
      doctorName: fullName,
      doctorFullName: fullName,
      doctorId: doctor.id,
      appointmentDate: '',
      appointmentTime: '',
    }));

    setDoctors([]);
    setAvailableTimeSlots([]);

    try {
      const res = await fetch(`http://127.0.0.1:5000/doctor_schedule/${doctor.id}`);
      if (res.ok) {
        const schedules = await res.json();
        const now = new Date();
        const todayStr = formatToLocalDateString(now);
        const currentHours = String(now.getHours()).padStart(2, '0');
        const currentMinutes = String(now.getMinutes()).padStart(2, '0');
        const currentTimeStr = `${currentHours}:${currentMinutes}`;

        const activeSchedules = (Array.isArray(schedules) ? schedules : []).filter((s) => {
          if (!s || !s.available_date) return false;
          if (s.available_date < todayStr) return false;
          if (s.available_date === todayStr) {
            const endTime = s.available_final_time || s.available_initial_time;
            if (endTime && endTime.slice(0, 5) <= currentTimeStr) return false;
          }
          return true;
        });

        setDoctorSchedules(activeSchedules);
      } else {
        setDoctorSchedules([]);
      }
    } catch (err) {
      console.error(err);
      setDoctorSchedules([]);
    }
  };

  const handleDateChange = (date) => {
    if (!date) {
      setForm((prev) => ({ ...prev, appointmentDate: '', appointmentTime: '' }));
      setAvailableTimeSlots([]);
      return;
    }

    const formattedDate = formatToLocalDateString(date);
    const sched = doctorSchedules.find((s) => s.available_date === formattedDate);

    if (sched && sched.available_initial_time) {
      const rawTime = sched.available_initial_time;
      const initialTime = rawTime.length > 5 ? rawTime.substring(0, 5) : rawTime;
      setAvailableTimeSlots([initialTime]);
      setForm((prev) => ({
        ...prev,
        appointmentDate: formattedDate,
        appointmentTime: initialTime,
      }));
    } else {
      setAvailableTimeSlots([]);
      setForm((prev) => ({ ...prev, appointmentDate: formattedDate, appointmentTime: '' }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === 'doctorName') {
      handleDoctorSearch(value);
    } else if (['firstName', 'lastName', 'telephone', 'nic'].includes(name)) {
      handlePatientSearch(value);
    }
  };

  const handleClear = () => {
    setForm({
      firstName: '',
      lastName: '',
      nic: '',
      telephone: '',
      doctorName: '',
      doctorFullName: '',
      doctorId: null,
      appointmentDate: '',
      appointmentTime: '',
    });
    setDoctors([]);
    setDoctorSchedules([]);
    setAvailableTimeSlots([]);
    setPatientSuggestions([]);
  };

  const handleDoctorSearch = async (query) => {
    if (!query || query.length === 0) {
      setDoctors([]);
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:5000/booking/search_doctors?query=${encodeURIComponent(query)}`);
      if (!response.ok) {
        setDoctors([]);
        return;
      }
      const doctorsList = await response.json();
      setDoctors(Array.isArray(doctorsList) ? doctorsList : []);
    } catch (error) {
      console.error('Error searching doctors:', error);
      setDoctors([]);
    }
  };

  async function handleCreate() {
    const { firstName, lastName, nic, telephone, doctorId, appointmentDate, appointmentTime } = form;

    if (!firstName || !lastName || !nic || !telephone || !doctorId || !appointmentDate || !appointmentTime) {
      alert('Please fill in all required fields including NIC.');
      return;
    }

    const lowerPhone = (telephone || '').toLowerCase();
    if (/wa\.me|whatsapp|http|\.com|\.me|www\./.test(lowerPhone)) {
      alert('Invalid telephone: WhatsApp links or web URLs are not allowed. Please enter a standard phone number.');
      return;
    }

    let cleanTel = telephone.trim();
    if (cleanTel.startsWith('+94')) cleanTel = '0' + cleanTel.slice(3).trim();
    else if (cleanTel.startsWith('0094')) cleanTel = '0' + cleanTel.slice(4).trim();

    if (!/^\+?[\d\s\-()]+$/.test(cleanTel)) {
      alert('Invalid telephone: Letters or special symbols are not allowed. Please enter a valid phone number.');
      return;
    }

    const digits = cleanTel.replace(/\D/g, '');
    if (digits.length < 7 || digits.length > 15) {
      alert('Invalid telephone number: Must contain between 7 and 15 digits.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        firstName,
        lastName,
        nic: nic.trim(),
        telephone: cleanTel,
        doctorId,
        doctorName: form.doctorName || form.doctorFullName,
        appointmentDate,
        appointmentTime
      };
      const response = await fetch('http://127.0.0.1:5000/booking/add_booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booking');
      }

      alert(data.message || 'Booking created successfully!');
      handleClear();
      navigate('/booking');
    } catch (error) {
      console.error('Booking error:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="booking-patient-main-content">
      <div className="booking-patient-page-header">
        <h3>New Booking</h3>
        <Link to="/booking" className="back-btn">
          ← Back
        </Link>
      </div>

      <div className="booking-patient-form">
        <div className="booking-patient-form-row patient-search-field" style={{ position: 'relative' }}>
          <label>First Name <span className="required">*</span></label>
          <input
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            autoComplete="off"
            placeholder="Search patient or enter first name..."
          />
          {patientSuggestions && patientSuggestions.length > 0 && (
            <ul className="patient-suggestions">
              {patientSuggestions.map((p) => (
                <li key={p.patient_id || p.nic} onClick={() => selectPatient(p)}>
                  <strong>{p.first_name} {p.last_name}</strong>
                  <span className="suggestion-meta">NIC: {p.nic || '—'} | Tel: {p.telephone}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="booking-patient-form-row">
          <label>Last Name <span className="required">*</span></label>
          <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Enter last name..." />
        </div>
        <div className="booking-patient-form-row">
          <label>NIC <span className="required">*</span></label>
          <input name="nic" value={form.nic} onChange={handleChange} placeholder="Enter National Identity Card number..." />
        </div>
        <div className="booking-patient-form-row">
          <label>Telephone <span className="required">*</span></label>
          <input name="telephone" value={form.telephone} onChange={handleChange} placeholder="Enter telephone number..." />
        </div>

        <div className="booking-patient-form-row doctor-field">
          <label>Doctor Name <span className="required">*</span></label>
          <input name="doctorName" value={form.doctorName} onChange={handleChange} autoComplete="off" placeholder="Type doctor name..." />

          {doctors && doctors.length > 0 && (
            <ul className="doctor-suggestions">
              {doctors.map((d) => (
                <li key={d.id} onClick={() => selectDoctor(d)}>
                  {d.name || `${d.first_name || ''} ${d.last_name || ''}`.trim()}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="booking-patient-form-row">
          <label>Appointment Date <span className="required">*</span></label>
          {/* Replaced native <input type="date"> with react-datepicker to enable highlighting specific allowed dates */}
          <DatePicker
            selected={form.appointmentDate ? parseLocalDate(form.appointmentDate) : null}
            onChange={handleDateChange}
            includeDates={doctorSchedules.map((s) => parseLocalDate(s.available_date)).filter(Boolean)}
            dateFormat="yyyy-MM-dd"
            placeholderText={!form.doctorId ? "Select a doctor first" : "Select scheduled date"}
            disabled={!form.doctorId}
            className="datepicker-input"
            calendarClassName="custom-calendar"
            dayClassName={(date) => {
              const dateStr = formatToLocalDateString(date);
              if (doctorSchedules.some((s) => s.available_date === dateStr)) {
                return 'highlighted-date'; // Highlights only available scheduled doctor dates
              }
              return undefined;
            }}
          />
        </div>
        
        <div className="booking-patient-form-row">
          <label>Appointment Time <span className="required">*</span></label>
          <select
            name="appointmentTime"
            value={form.appointmentTime}
            onChange={handleChange}
            disabled={!form.appointmentDate || availableTimeSlots.length === 0}
          >
            <option value="">{availableTimeSlots.length === 0 ? "Select a valid date first" : "Select initial time"}</option>
            {availableTimeSlots.map((slot) => (
              <option key={slot} value={slot}>{slot}</option>
            ))}
          </select>
        </div>

        <div className="booking-patient-form-actions">
          <button className="btn" onClick={handleCreate} disabled={loading}>
            {loading ? 'Saving...' : 'Book'}
          </button>
          <button className="btn" onClick={handleClear} disabled={loading}>
            Clear Form
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookingPatient;