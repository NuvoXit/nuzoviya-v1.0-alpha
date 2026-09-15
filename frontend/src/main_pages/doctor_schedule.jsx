import React, { useState, useEffect } from 'react';
import './mini_pages/booking_patient.css';
import './doctor_schedule.css';

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
  const [viewFilter, setViewFilter] = useState('active');

  // Helper to determine if a schedule's date and time have passed current real time
  const isSchedulePassed = (sched) => {
    if (!sched || !sched.available_date) return false;
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const todayStr = `${y}-${m}-${d}`;

    if (sched.available_date < todayStr) return true;
    if (sched.available_date === todayStr) {
      const endTime = sched.available_final_time || sched.available_initial_time;
      if (endTime) {
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        const currentTimeStr = `${hh}:${mm}`;
        if (endTime.slice(0, 5) <= currentTimeStr) return true;
      }
    }
    return false;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'doctorFullName' && { doctorId: '' }),
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

  // Fetches ALL schedules from database (including historical ones safely saved in backend model database)
  const fetchAllSchedules = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/doctor_schedule/all_schedules?include_past=true`);
      if (res.ok) {
        const data = await res.json();
        setExistingSchedules(Array.isArray(data) ? data : []);
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

    if (!doctorFullName || !availableDate || !availableInitialTime || !availableFinalTime) {
      alert('Please fill all required fields');
      return;
    }

    if (availableInitialTime >= availableFinalTime) {
      alert('Initial time must be earlier than final time');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:5000/doctor_schedule/add_schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctorId: doctorId || undefined,
          doctorFullName,
          availableDate,
          availableInitialTime,
          availableFinalTime,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add schedule');
      }

      alert('Doctor schedule added successfully');

      fetchAllSchedules();
      setForm((prev) => ({
        ...prev,
        availableDate: '',
        availableInitialTime: '',
        availableFinalTime: '',
      }));
    } catch (error) {
      console.error(error);
      alert(error.message || 'Failed to add schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) {
      return;
    }

    try {
      const res = await fetch(`http://127.0.0.1:5000/doctor_schedule/delete/${scheduleId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'Schedule deleted successfully');
        fetchAllSchedules();
      } else {
        alert(data.error || 'Failed to delete schedule');
      }
    } catch (err) {
      console.error('Error deleting schedule:', err);
      alert('Failed to delete schedule');
    }
  };

  const activeSchedules = existingSchedules.filter((s) => !isSchedulePassed(s));
  const displayedSchedules = viewFilter === 'active' ? activeSchedules : existingSchedules;

  return (
    <div className="booking-patient-main-content">
      <div className="booking-patient-page-header">
        <h3>Doctor Schedule</h3>
      </div>

      <div className="booking-patient-form">
        <div className="booking-patient-form-row doctor-field">
          <label>
            Doctor Name <span className="required">*</span>
          </label>

          <input
            name="doctorFullName"
            value={form.doctorFullName}
            onChange={handleChange}
            autoComplete="off"
            placeholder="Type doctor name..."
          />

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

        {existingSchedules.length > 0 && (
          <div className="existing-schedules">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <h4 style={{ margin: 0 }}>Existing Schedules</h4>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setViewFilter('active')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: viewFilter === 'active' ? '#16a34a' : '#cbd5e1',
                    background: viewFilter === 'active' ? '#dcfce7' : '#ffffff',
                    color: viewFilter === 'active' ? '#166534' : '#475569',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  Active Schedules ({activeSchedules.length})
                </button>
                <button
                  type="button"
                  onClick={() => setViewFilter('all')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: viewFilter === 'all' ? '#16a34a' : '#cbd5e1',
                    background: viewFilter === 'all' ? '#dcfce7' : '#ffffff',
                    color: viewFilter === 'all' ? '#166534' : '#475569',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  All (Saved in DB: {existingSchedules.length})
                </button>
              </div>
            </div>

            {displayedSchedules.length === 0 ? (
              <p style={{ padding: '16px', color: '#64748b', textAlign: 'center', fontStyle: 'italic' }}>
                {viewFilter === 'active' ? 'No active schedules available. Past schedules are saved in the database.' : 'No schedules found.'}
              </p>
            ) : (
              <div className="schedule-table-wrapper">
                <table className="schedule-table">
                  <thead>
                    <tr>
                      <th>Doctor ID</th>
                      <th>Doctor Name</th>
                      <th>Date</th>
                      <th>Time Range</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedSchedules.map((sched) => {
                      const passed = isSchedulePassed(sched);
                      return (
                        <tr key={sched.schedule_id}>
                          <td className="schedule-list-id"><span>ID</span> {sched.doctor_id}</td>
                          <td className="schedule-list-name">{sched.doctor_full_name}</td>
                          <td className="schedule-list-date">{sched.available_date}</td>
                          <td className="schedule-list-time">
                            <span className="time-badge">{sched.available_initial_time} - {sched.available_final_time}</span>
                          </td>
                          <td>
                            <span
                              style={{
                                padding: '3px 8px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: '600',
                                background: passed ? '#f1f5f9' : '#dcfce7',
                                color: passed ? '#64748b' : '#166534',
                              }}
                            >
                              {passed ? 'Passed (Saved in DB)' : 'Active'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              type="button"
                              className="schedule-delete-btn"
                              onClick={() => handleDeleteSchedule(sched.schedule_id)}
                              title="Delete Schedule"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DoctorSchedule;
