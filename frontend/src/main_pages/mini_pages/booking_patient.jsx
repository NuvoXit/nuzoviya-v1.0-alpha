import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './booking_patient.css';

function BookingPatient() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    telephone: '',
    doctorName: '',
    doctorId: null,
    appointmentDate: '',
    appointmentTime: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Trigger search only for doctor name field
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
      doctorId: null,
      appointmentDate: '',
      appointmentTime: '',
    });
    setDoctors([]);
  };

  // Search Doctors as user types
  const handleDoctorSearch = async (query) => {
    // Clear suggestions if input is empty
    if (!query || query.length === 0) {
      setDoctors([]);
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:5000/booking/search_doctors?query=${encodeURIComponent(query)}`);
      if (!response.ok) {
        console.error('Search response error:', response.status);
        setDoctors([]);
        return;
      }
      const doctors = await response.json();
      console.log('Doctors found:', doctors);
      setDoctors(Array.isArray(doctors) ? doctors : []);
    } catch (error) {
      console.error('Error searching doctors:', error);
      setDoctors([]);
    }
  };

  // Was only logging to console — now actually calls the backend
  async function handleCreate() {
    const { firstName, lastName, telephone, doctorName, appointmentDate, appointmentTime } = form;

    if (!firstName || !lastName || !telephone || !doctorName || !appointmentDate || !appointmentTime) {
      alert('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
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
        <Link to="/booking" className="back-btn">
          ←
        </Link>
        <h3>New Booking</h3>
      </div>

      <div className="booking-patient-form">
        <div className="booking-patient-form-row">
          <label>
            First Name <span className="required">*</span>
          </label>
          <input name="firstName" value={form.firstName} onChange={handleChange} />
        </div>
        <div className="booking-patient-form-row">
          <label>
            Last Name <span className="required">*</span>
          </label>
          <input name="lastName" value={form.lastName} onChange={handleChange} />
        </div>
        <div className="booking-patient-form-row">
          <label>
            Telephone <span className="required">*</span>
          </label>
          <input name="telephone" value={form.telephone} onChange={handleChange} />
        </div>

        {/* Doctor search with suggestions */}
        <div className="booking-patient-form-row doctor-field">
          <label>
            Doctor Name <span className="required">*</span>
          </label>

          <input name="doctorName" value={form.doctorName} onChange={handleChange} autoComplete="off" placeholder="Type doctor name..." />

          {doctors && doctors.length > 0 && (
            <ul className="doctor-suggestions">
              {doctors.map((d) => {const fullName = d.name || `${d.first_name || ''} ${d.last_name || ''}`.trim();
                return (
                  <li key={d.id}
                    onClick={() => {
                      setForm((prev) => ({
                        ...prev,
                        doctorName: fullName,
                        doctorId: d.id,
                      }));
                      setDoctors([]);
                    }}
                  >
                    {fullName}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="booking-patient-form-row">
          <label>
            Appointment Date <span className="required">*</span>
          </label>
          <input type="date" name="appointmentDate" value={form.appointmentDate} onChange={handleChange} />
        </div>
        
        <div className="booking-patient-form-row">
          <label>
            Appointment Time <span className="required">*</span>
          </label>
          <input type="time" name="appointmentTime" value={form.appointmentTime} onChange={handleChange} />
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
