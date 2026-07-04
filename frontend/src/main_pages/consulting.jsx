import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './consulting.css';

const ALL_CHECKUPS = ['Blood Checkup', 'Eye Checkup', 'X-Ray Checkup', 'Other'];

// Helper function to calculate age from date of birth
function calcAge(dob) {
  if (!dob) return '—';
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function getNow() {
  return new Date().toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function Consulting() {
  const navigate = useNavigate();

  const username = localStorage.getItem('username');
  const role = localStorage.getItem('role');

  const [patients, setPatients] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState(null);

  const [activeCheckups, setActiveCheckups] = useState([]);

  useEffect(() => {
    Promise.all([fetch('http://127.0.0.1:5000/booking/all_bookings').then((r) => r.json()), fetch('http://127.0.0.1:5000/patient/all_patients').then((r) => r.json())])
      .then(([bookingsData, patientsData]) => {
        setPatients(Array.isArray(patientsData) ? patientsData : []);

        const patientMap = {};

        // Map patients by telephone
        (Array.isArray(patientsData) ? patientsData : []).forEach((p) => {
          if (p && p.telephone) {
            patientMap[p.telephone] = p;
          }
        });

        const normalize = (s) => (s || '').toString().replace(/\s+/g, ' ').trim().toLowerCase();

        const filteredBookings = (Array.isArray(bookingsData) ? bookingsData : []).filter((b) => {
          if (role === 'Doctor' && username) {
            return normalize(b.doctor_name) === normalize(username);
          }

          return true;
        });

        const enriched = filteredBookings.map((b) => {
          const p = patientMap[b.telephone];

          return {
            bookingId: b.booking_id,

            // changed: patient id from Patients table (p)
            patientId: p?.patient_id,

            patientTelephone: b.telephone,

            name: `${b.first_name} ${b.last_name}`,

            age: p ? calcAge(p.dob) : '—',
          };
        });

        setBookings(enriched);

        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load data:', err);

        setLoading(false);
      });
  }, [role, username]);

  const handleSelect = (b) => {
    setSelected(b);

    setActiveCheckups([]);

    navigate(`/consult_patient_list/${b.patientId}/dashboard`);
  };

  const toggleCheckup = (tag) => {
    if (!selected) return;

    setActiveCheckups((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleAction = (action) => {
    if (!selected) return;

    const base = `/consult_patient_list/${selected.patientId}/dashboard`;

    if (action === 'Prescription') {
      navigate(`${base}/prescription`);
    }

    if (action === 'Surgical Procedure') {
      navigate(`${base}/surgical_procedure`);
    }

    if (action === 'Feedback') {
      navigate(`${base}/feedback`, {
        state: {
          patient: {
            ...selected,
            checkups: activeCheckups,
          },
        },
      });
    }
  };

  return (
    <section className="consulting-section">
      <div className="consulting-list-card">
        <div className="consulting-list-header">
          <div className="consulting-list-title">
            Today Patients
            <span className="consulting-filter-icon">▽</span>
          </div>

          <span className="consulting-datetime">{getNow()}</span>
        </div>

        <div className="consulting-list-body">
          {loading ? (
            <p style={{ padding: '12px 16px', color: '#888' }}>Loading...</p>
          ) : bookings.length === 0 ? (
            <p style={{ padding: '12px 16px', color: '#888' }}>No bookings found</p>
          ) : (
            bookings.map((b, i) => (
              <div
                key={b.bookingId}
                className={`consulting-list-row ${selected?.bookingId === b.bookingId ? 'consulting-list-row--active' : ''}`}
                onClick={() => handleSelect(b)}
                style={{ cursor: 'pointer' }}
              >
                <span className="consulting-list-num">{String(i + 1).padStart(2, '0')}</span>

                <span className="consulting-list-id">{b.patientTelephone}</span>

                <span className="consulting-list-name">{b.name}</span>

                <span className="consulting-list-age">Age: {b.age}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

export default Consulting;
