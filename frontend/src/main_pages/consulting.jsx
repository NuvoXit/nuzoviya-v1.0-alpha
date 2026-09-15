import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './consulting.css';

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

// Convert date string (YYYY-MM-DD) to day-of-week abbreviation
function getDayAbbr(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return dayNames[d.getDay()];
}

function DoctorWaveChart({ weeklyData }) {
  const maxVal = Math.max(...weeklyData.map((d) => d.count), 4);
  const chartHeight = 135;
  const chartWidth = 440;
  const paddingX = 35;
  const paddingY = 22;
  const usableWidth = chartWidth - paddingX * 2;
  const usableHeight = chartHeight - paddingY * 2;
  const step = usableWidth / (weeklyData.length - 1 || 1);

  const points = weeklyData.map((d, i) => ({
    x: paddingX + i * step,
    y: paddingY + usableHeight - (d.count / maxVal) * usableHeight,
    count: d.count,
    day: d.day,
  }));

  // Build smooth bezier curve
  let dPath = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cx = (p0.x + p1.x) / 2;
    dPath += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
  }

  const fillPath = `${dPath} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`;

  return (
    <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 28}`} className="svg-chart">
      <defs>
        <linearGradient id="doctorWaveGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0.0" />
        </linearGradient>
      </defs>

      {/* Base Grid Line */}
      <line x1={paddingX} y1={chartHeight} x2={chartWidth - paddingX} y2={chartHeight} stroke="#e2e8f0" strokeWidth="1" />

      {/* Area Gradient Fill */}
      <path d={fillPath} fill="url(#doctorWaveGrad)" />

      {/* Smooth Wave Line */}
      <path d={dPath} fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Points & Day Labels (clean static display, no hover flicker) */}
      {points.map((p, idx) => (
        <g key={idx}>
          <circle
            cx={p.x}
            cy={p.y}
            r={p.count > 0 ? 4 : 2.5}
            fill={p.count > 0 ? '#16a34a' : '#ffffff'}
            stroke="#16a34a"
            strokeWidth="2"
          />
          {p.count > 0 && (
            <text x={p.x} y={p.y - 8} textAnchor="middle" fontSize="11" fontWeight="700" fill="#16a34a">
              {p.count}
            </text>
          )}
          <text x={p.x} y={chartHeight + 18} textAnchor="middle" fontSize="11" fill="#64748b" fontWeight="600">
            {p.day}
          </text>
        </g>
      ))}
    </svg>
  );
}

function Consulting() {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');
  const role = localStorage.getItem('role');

  const [patients, setPatients] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [allDoctorBookings, setAllDoctorBookings] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch('http://127.0.0.1:5000/booking/all_bookings').then((r) => (r.ok ? r.json() : [])).catch(() => []),
      fetch('http://127.0.0.1:5000/patient/all_patients').then((r) => (r.ok ? r.json() : [])).catch(() => []),
      fetch('http://127.0.0.1:5000/prescription/all_prescriptions').then((r) => (r.ok ? r.json() : [])).catch(() => []),
      fetch('http://127.0.0.1:5000/payments').then((r) => (r.ok ? r.json() : [])).catch(() => []),
      fetch('http://127.0.0.1:5000/feedback/all_feedbacks').then((r) => (r.ok ? r.json() : [])).catch(() => []),
    ])
      .then(([bookingsData, patientsData, prescriptionsData, paymentsData, feedbacksData]) => {
        setPatients(Array.isArray(patientsData) ? patientsData : []);
        setPrescriptions(Array.isArray(prescriptionsData) ? prescriptionsData : []);

        const patientMap = {};
        (Array.isArray(patientsData) ? patientsData : []).forEach((p) => {
          if (p && p.telephone) {
            patientMap[p.telephone] = p;
          }
        });

        const normalize = (s) => (s || '').toString().replace(/\s+/g, ' ').trim().toLowerCase();
        const cleanDoc = (s) => normalize(s).replace(/^dr\.?\s*/i, '');
        const userClean = cleanDoc(username);
        const isGenericDoctor = ['doctor', 'dr', 'admin', 'physician'].includes(normalize(username));

        // 1. Filter bookings assigned to this specific doctor
        const doctorBookings = (Array.isArray(bookingsData) ? bookingsData : []).filter((b) => {
          if (role === 'Doctor' && username && !isGenericDoctor) {
            const docClean = cleanDoc(b.doctor_name);
            return docClean.includes(userClean) || userClean.includes(docClean) || docClean === userClean;
          }
          return true;
        });

        setAllDoctorBookings(doctorBookings);

        // Helper to normalize telephone numbers
        const normalizePhone = (num) => {
          if (!num) return '';
          let str = String(num).replace(/\D/g, '');
          if (str.startsWith('94')) str = '0' + str.slice(2);
          return str;
        };

        // 2. Payment verification: Booking must have completed payment to appear in consulting
        const paymentsList = Array.isArray(paymentsData) ? paymentsData : [];
        const isPaid = (b) => {
          if (b.status === 'Paid' || b.status === 'Completed') return true;
          return paymentsList.some((p) => {
            if (p.booking_id && Number(p.booking_id) === Number(b.booking_id)) return true;
            const phoneMatch = b.telephone && p.telephone && normalizePhone(p.telephone) === normalizePhone(b.telephone);
            const nameMatch =
              normalize(p.first_name) === normalize(b.first_name) &&
              normalize(p.last_name) === normalize(b.last_name);
            return (phoneMatch || nameMatch) && ((p.doctor_fee && p.doctor_fee > 0) || (p.total_amount && p.total_amount > 0));
          });
        };

        // 3. Feedback completion verification: Tied strictly to bookingId so re-booked patients can consult again
        const localCompletedBookings = JSON.parse(localStorage.getItem('completedFeedbackBookings') || '[]');
        const feedbackBookingIds = (Array.isArray(feedbacksData) ? feedbacksData : [])
          .map((f) => f.booking_id)
          .filter(Boolean);

        const isCompleted = (b) => {
          if (b.status === 'Completed') return true;
          if (localCompletedBookings.includes(String(b.booking_id))) return true;
          if (feedbackBookingIds.includes(b.booking_id)) return true;
          return false;
        };

        // Active Queue: Must be booked for this doctor, payment must be completed, and feedback not yet given
        const activePaidBookings = doctorBookings.filter((b) => isPaid(b) && !isCompleted(b));

        // Completed consults count for this doctor
        const completedDoctorBookings = doctorBookings.filter((b) => isCompleted(b));
        setCompletedCount(completedDoctorBookings.length);

        const enriched = activePaidBookings.map((b) => {
          let p = patientMap[b.telephone];
          if (!p) {
            const allPatients = Array.isArray(patientsData) ? patientsData : [];
            p = allPatients.find(
              (pt) =>
                normalize(pt.first_name) === normalize(b.first_name) &&
                normalize(pt.last_name) === normalize(b.last_name)
            );
          }

          return {
            bookingId: b.booking_id,
            patientId: p?.patient_id ?? b.patient_id ?? b.booking_id,
            patientTelephone: b.telephone,
            name: `${b.first_name} ${b.last_name}`,
            age: p ? calcAge(p.dob) : '—',
            bookingDate: b.appointmentDate || b.appointment_date || b.booking_date,
            bookingTime: b.appointmentTime || b.appointment_time || b.booking_time,
          };
        });

        setBookings(enriched);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load doctor consulting data:', err);
        setLoading(false);
      });
  }, [role, username]);

  // Aggregate real appointment workload across Monday through Sunday
  const weeklyThroughput = useMemo(() => {
    const daysOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const countsMap = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };

    allDoctorBookings.forEach((b) => {
      const dateStr = b.appointmentDate || b.appointment_date || b.booking_date;
      const day = getDayAbbr(dateStr);
      if (day && countsMap[day] !== undefined) {
        countsMap[day] += 1;
      }
    });

    return daysOrder.map((day) => ({ day, count: countsMap[day] }));
  }, [allDoctorBookings]);

  const handleSelect = (b) => {
    if (!b.patientId) {
      alert('Patient ID not found for this booking.');
      return;
    }
    setSelected(b);
    sessionStorage.setItem('activeConsultingBooking', JSON.stringify(b));
    navigate(`/consult_patient_list/${b.patientId}/dashboard`, {
      state: {
        patient: {
          patientId: b.patientId,
          name: b.name,
          telephone: b.patientTelephone,
          age: b.age,
          bookingId: b.bookingId,
        },
        booking: b,
        bookingId: b.bookingId,
      },
    });
  };

  const activeCount = bookings.length;
  const totalDoctorBookings = allDoctorBookings.length;
  const totalPrescriptions = prescriptions.length;

  return (
    <div className="testing-patient-split-container">
      {/* Left Column: Doctor Consulting Patient Queue */}
      <section className="consulting-section testing-left-list">
        <div className="consulting-list-card">
          <div className="consulting-list-header">
            <div className="consulting-list-title">
              Consulting Patients
              <span className="consulting-filter-icon">▽</span>
            </div>

            <div className="consulting-patient-count">
              No of Patients : {loading ? '...' : activeCount}
            </div>
          </div>

          <div className="consulting-list-body">
            {loading ? (
              <p style={{ padding: '12px 16px', color: '#888' }}>Loading bookings from database...</p>
            ) : bookings.length === 0 ? (
              <p style={{ padding: '12px 16px', color: '#888' }}>No pending consulting patients</p>
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

      {/* Right Column: Doctor Clinic Side Panel Matching Dashboard */}
      <aside className="testing-right-side-panel">
        {/* Top 2 Real Stat Boxes */}
        <div className="testing-side-stats-grid">
          <div className="testing-side-card stat-pending-card">
            <div className="side-card-icon green-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div className="side-card-info">
              <span className="side-card-label">Active Queue</span>
              <h3 className="side-card-value">{loading ? '...' : activeCount}</h3>
              <span className="side-card-badge badge-amber">
                {activeCount > 0 ? `${activeCount} In Waiting` : 'Queue Empty'}
              </span>
            </div>
          </div>

          <div className="testing-side-card stat-completed-card">
            <div className="side-card-icon blue-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="side-card-info">
              <span className="side-card-label">Completed Consults</span>
              <h3 className="side-card-value">{loading ? '...' : Math.max(0, completedCount)}</h3>
              <span className="side-card-badge badge-green">
                {completedCount > 0 ? `${completedCount} Finished` : '0 Finished'}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Large Wave Chart Card Matching Dashboard Hover Interaction */}
        <div className="testing-side-card testing-chart-large-card">
          <div className="chart-card-header">
            <div>
              <h4>Consultation Workload & Bookings</h4>
              <p>Weekly appointments aggregated live from database</p>
            </div>
            <span className="chart-period-pill">Live Appointments</span>
          </div>

          <div className="chart-wave-wrapper">
            <DoctorWaveChart weeklyData={weeklyThroughput} />
          </div>

          <div className="chart-footer-metrics">
            <div className="metric-col">
              <span className="metric-label">Total Bookings</span>
              <strong className="metric-val">{totalDoctorBookings}</strong>
            </div>
            <div className="metric-divider" />
            <div className="metric-col">
              <span className="metric-label">Prescriptions</span>
              <strong className="metric-val">{totalPrescriptions}</strong>
            </div>
            <div className="metric-divider" />
            <div className="metric-col">
              <span className="metric-label">Doctor</span>
              <strong className="metric-val">{username || 'Physician'}</strong>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default Consulting;