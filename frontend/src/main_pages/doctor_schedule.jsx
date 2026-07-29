import React, { useState, useEffect } from 'react';
import './doctor_Schedule.css';

function DoctorSchedule() {
  const [form, setForm] = useState({
    doctorId: '',
    doctorFullName: '',
    availableDate: '',
    availableInitialTime: '',
    availableFinalTime: '',
  });

  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [existingSchedules, setExistingSchedules] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'doctorFullName') {
      handleDoctorSearch(value);
    }
  };

  const handleClear = () => {
    setForm({
      doctorId: '',
      doctorFullName: '',
      availableDate: '',
      availableInitialTime: '',
      availableFinalTime: '',
    });

    setDoctors([]);
  };

  // Fetches ALL existing schedules on page mount
  // This avoids needing to search for a specific doctor to see schedules
  const fetchAllSchedules = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/doctor_schedule/all_schedules`);
      if (res.ok) {
        const data = await res.json();
        setExistingSchedules(data);
      }
    } catch (err) {
      console.error('Error fetching schedules:', err);
    }
  };

  useEffect(() => {
    fetchAllSchedules();
  }, []);

  const handleDoctorSearch = async (query) => {
    if (!query) {
      setDoctors([]);
      return;
    }

    try {
      // FIXED: Was incorrectly fetching from /doctor_schedule/search_doctors
      // Changed to the correct endpoint /booking/search_doctors to fix 404 error
      const response = await fetch(`http://127.0.0.1:5000/booking/search_doctors?query=${encodeURIComponent(query)}`);

      if (!response.ok) {
        setDoctors([]);
        return;
      }

      const data = await response.json();

      setDoctors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Doctor search error:', error);
      setDoctors([]);
    }
  };

  const selectDoctor = (doctor) => {
    const fullName = doctor.name || `${doctor.first_name || ''} ${doctor.last_name || ''}`.trim();

    setForm((prev) => ({
      ...prev,
      doctorId: doctor.id,
      doctorFullName: fullName,
    }));

    setDoctors([]);
  };

  const handleCreate = async () => {
    const { doctorId, doctorFullName, availableDate, availableInitialTime, availableFinalTime } = form;

    if (!doctorId || !doctorFullName || !availableDate || !availableInitialTime || !availableFinalTime) {
      alert('Please fill all required fields');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:5000/doctor_schedule/add_schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed');
      }

      alert('Doctor schedule added successfully');

      // Re-fetch all schedules to update the list
      fetchAllSchedules();
      setForm((prev) => ({
        ...prev,
        availableDate: '',
        availableInitialTime: '',
        availableFinalTime: '',
      }));
    } catch (error) {
      console.error(error);
      alert('Failed to add schedule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="booking-patient-form-row doctor-field">
        <label>
          Doctor Name <span className="required">*</span>
        </label>

        <input name="doctorFullName" value={form.doctorFullName} onChange={handleChange} autoComplete="off" placeholder="Type doctor name..." />

        {doctors.length > 0 && (
          <ul className="doctor-suggestions">
            {doctors.map((doctor) => (
              <li key={doctor.id} onClick={() => selectDoctor(doctor)}>
                {doctor.name || `${doctor.first_name || ''} ${doctor.last_name || ''}`}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="booking-patient-form-row">
        <label>
          Available Date <span className="required">*</span>
        </label>

        <input type="date" name="availableDate" value={form.availableDate} onChange={handleChange} />
      </div>

      <div className="booking-patient-form-row">
        <label>
          Initial Time <span className="required">*</span>
        </label>

        <input type="time" name="availableInitialTime" value={form.availableInitialTime} onChange={handleChange} />
      </div>

      <div className="booking-patient-form-row">
        <label>
          Final Time <span className="required">*</span>
        </label>

        <input type="time" name="availableFinalTime" value={form.availableFinalTime} onChange={handleChange} />
      </div>

      <div className="booking-patient-form-actions">
        <button className="btn" onClick={handleCreate} disabled={loading}>
          {loading ? 'Saving...' : 'Add Schedule'}
        </button>

        <button className="btn" onClick={handleClear} disabled={loading}>
          Clear Form
        </button>
      </div>

      {/* 
        Refactored this section into a styled HTML table instead of just divs.
        It uses the premium glassmorphism styles from doctor_schedule.css
        and matches the elegant aesthetics of the consulting page.
      */}
      {existingSchedules.length > 0 && (
        <div className="existing-schedules">
          <h4>Existing Schedules</h4>
          <div className="schedule-table-wrapper">
            <table className="schedule-table">
              <thead>
                <tr>
                  <th>Doctor ID</th>
                  <th>Doctor Name</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Time Range</th>
                </tr>
              </thead>
              <tbody>
                {existingSchedules.map((sched) => (
                  <tr key={sched.schedule_id}>
                    <td className="schedule-list-id"><span>ID</span> {sched.doctor_id}</td>
                    <td className="schedule-list-name">{sched.doctor_full_name}</td>
                    <td className="schedule-list-date">{sched.available_date}</td>
                    <td className="schedule-list-time">
                      <span className="time-badge">{sched.available_initial_time} - {sched.available_final_time}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

export default DoctorSchedule;
