import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './booking_patient.css';

function BookingPatient() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
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
  
  // Stores generated 30-minute time slots based on the doctor's availability
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);

  // Utility to generate discrete time slots between an initial and final time
  const generateTimeSlots = (start, end) => {
    const slots = [];
    let current = new Date(`2000-01-01T${start}`);
    const final = new Date(`2000-01-01T${end}`);
    
    while (current <= final) {
      slots.push(current.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
      current.setMinutes(current.getMinutes() + 30);
    }
    return slots;
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
        setDoctorSchedules(schedules);
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

    // Accurately format the selected date to match backend 'YYYY-MM-DD'
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset*60*1000));
    const formattedDate = localDate.toISOString().split('T')[0];

    // If the selected date exists in the schedule, generate available time slots
    const sched = doctorSchedules.find(s => s.available_date === formattedDate);
    if (sched) {
      const slots = generateTimeSlots(sched.available_initial_time, sched.available_final_time);
      setAvailableTimeSlots(slots);
      setForm((prev) => ({ ...prev, appointmentDate: formattedDate, appointmentTime: '' }));
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
    }
  };

  const handleClear = () => {
    setForm({
      firstName: '',
      lastName: '',
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
    const { firstName, lastName, telephone, doctorId, appointmentDate, appointmentTime } = form;

    if (!firstName || !lastName || !telephone || !doctorId || !appointmentDate || !appointmentTime) {
      alert('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        firstName,
        lastName,
        telephone,
        doctorId,
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
        <div className="booking-patient-form-row">
          <label>First Name <span className="required">*</span></label>
          <input name="firstName" value={form.firstName} onChange={handleChange} />
        </div>
        <div className="booking-patient-form-row">
          <label>Last Name <span className="required">*</span></label>
          <input name="lastName" value={form.lastName} onChange={handleChange} />
        </div>
        <div className="booking-patient-form-row">
          <label>Telephone <span className="required">*</span></label>
          <input name="telephone" value={form.telephone} onChange={handleChange} />
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
            selected={form.appointmentDate ? new Date(form.appointmentDate + 'T12:00:00') : null}
            onChange={handleDateChange}
            includeDates={doctorSchedules.map(s => new Date(s.available_date + 'T12:00:00'))}
            dateFormat="yyyy-MM-dd"
            placeholderText={!form.doctorId ? "Select a doctor first" : "Select scheduled date"}
            disabled={!form.doctorId}
            className="datepicker-input"
            calendarClassName="custom-calendar"
            dayClassName={(date) => {
              const localDate = date.toISOString().split('T')[0];
              if (doctorSchedules.some(s => s.available_date === localDate)) {
                return 'highlighted-date'; // Adds the green glow and styling to available dates
              }
              return undefined;
            }}
          />
        </div>
        
        <div className="booking-patient-form-row">
          <label>Appointment Time <span className="required">*</span></label>
          {/* Replaced native <input type="time"> with a select dropdown to enforce choosing a valid slot */}
          <select
            name="appointmentTime"
            value={form.appointmentTime}
            onChange={handleChange}
            disabled={!form.appointmentDate || availableTimeSlots.length === 0}
          >
            <option value="">{availableTimeSlots.length === 0 ? "Select a valid date first" : "Select time slot"}</option>
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