import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './testing_patient.css';

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

function DiagnosticWaveChart({ weeklyData }) {
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
        <linearGradient id="diagWaveGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0.0" />
        </linearGradient>
      </defs>

      {/* Base Grid Line */}
      <line x1={paddingX} y1={chartHeight} x2={chartWidth - paddingX} y2={chartHeight} stroke="#e2e8f0" strokeWidth="1" />

      {/* Area Gradient Fill */}
      <path d={fillPath} fill="url(#diagWaveGrad)" />

      {/* Smooth Wave Line */}
      <path d={dPath} fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Points & Interactive Hover Labels Matching Dashboard */}
      {points.map((p, idx) => (
        <g key={idx} className="chart-point-group">
          <circle cx={p.x} cy={p.y} r="3.5" fill="#ffffff" stroke="#16a34a" strokeWidth="2" className="chart-point" />
          <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="11" fontWeight="700" fill="#16a34a" className="chart-point-label">
            {p.count}
          </text>
          <text x={p.x} y={chartHeight + 18} textAnchor="middle" fontSize="11" fill="#64748b" fontWeight="500">
            {p.day}
          </text>
        </g>
      ))}
    </svg>
  );
}

function Testing_Patient() {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  const [payments, setPayments] = useState([]);
  const [completedRecords, setCompletedRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let paymentUrl = '';
    let recordsUrl = '';

    if (role === 'MLT') {
      paymentUrl = 'http://127.0.0.1:5000/payments/mlt';
      recordsUrl = 'http://127.0.0.1:5000/lab_records/all_lab_records';
    } else if (role === 'Radiologist') {
      paymentUrl = 'http://127.0.0.1:5000/payments/radiologist';
      recordsUrl = 'http://127.0.0.1:5000/xray_records/all_xray_records';
    } else {
      setLoading(false);
      return;
    }

    Promise.all([
      fetch(paymentUrl).then((r) => (r.ok ? r.json() : [])).catch(() => []),
      fetch('http://127.0.0.1:5000/patient/all_patients').then((r) => (r.ok ? r.json() : [])).catch(() => []),
      fetch(recordsUrl).then((r) => (r.ok ? r.json() : [])).catch(() => []),
    ])
      .then(([paymentsData, patientsData, recordsData]) => {
        const patientsList = Array.isArray(patientsData) ? patientsData : [];
        const paymentsList = Array.isArray(paymentsData) ? paymentsData : [];
        const recordsList = Array.isArray(recordsData) ? recordsData : [];

        setCompletedRecords(recordsList);

        const normalizePhone = (p) => {
          if (!p) return '';
          let s = String(p).trim();
          if (s.startsWith('+94')) s = '0' + s.slice(3).trim();
          else if (s.startsWith('0094')) s = '0' + s.slice(4).trim();
          return s.replace(/\D/g, '');
        };

        const normalizeName = (s) => (s || '').toString().toLowerCase().trim();

        const patientMap = {};
        patientsList.forEach((patient) => {
          if (patient?.telephone) {
            patientMap[normalizePhone(patient.telephone)] = patient;
          }
        });

        const enriched = paymentsList.map((payment) => {
          let patient = patientMap[normalizePhone(payment.telephone)];
          if (!patient) {
            patient = patientsList.find(
              (pt) =>
                normalizeName(pt.first_name) === normalizeName(payment.first_name) &&
                normalizeName(pt.last_name) === normalizeName(payment.last_name)
            );
          }

          return {
            paymentId: payment.payment_id,
            patientId: patient?.patient_id || payment.payment_id,
            patientTelephone: payment.telephone,
            name: patient ? `${patient.first_name} ${patient.last_name}` : `${payment.first_name || ''} ${payment.last_name || ''}`,
            age: patient ? calcAge(patient.dob) : '—',
            paymentDate: payment.payment_date,
          };
        });

        const completedDiagnostic = JSON.parse(localStorage.getItem('completedDiagnosticPatients') || '[]');
        const submittedPatientIds = new Set([
          ...recordsList.map((r) => String(r.patient_id)),
          ...completedDiagnostic.map((id) => String(id)),
        ]);
        const submittedNames = new Set(
          recordsList.map((r) => `${(r.patient_first_name || '').toLowerCase()} ${(r.patient_last_name || '').toLowerCase()}`.trim())
        );

        const activePayments = enriched.filter((p) => {
          const isSubmittedById = p.patientId && submittedPatientIds.has(String(p.patientId));
          const isSubmittedByName = p.name && submittedNames.has(p.name.toLowerCase().trim());
          const isSubmittedByPhone = p.patientTelephone && completedDiagnostic.includes(String(p.patientTelephone));
          return !isSubmittedById && !isSubmittedByName && !isSubmittedByPhone;
        });

        setPayments(activePayments);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load diagnostic data:', err);
        setLoading(false);
      });
  }, [role]);

  // Aggregate real weekly throughput from live database records
  const weeklyThroughput = useMemo(() => {
    const daysOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const countsMap = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };

    payments.forEach((p) => {
      const day = getDayAbbr(p.paymentDate);
      if (day && countsMap[day] !== undefined) {
        countsMap[day] += 1;
      }
    });

    completedRecords.forEach((rec) => {
      const dateField = rec.test_date || rec.xray_date;
      const day = getDayAbbr(dateField);
      if (day && countsMap[day] !== undefined) {
        countsMap[day] += 1;
      }
    });

    return daysOrder.map((day) => ({ day, count: countsMap[day] }));
  }, [payments, completedRecords]);

  const handleSelect = (pa) => {
    setSelected(pa);
    const targetId = pa.patientId || pa.paymentId;
    if (targetId) {
      navigate(`/diagnostic_services_patient_list/${targetId}/test_files`);
    }
  };

  const pendingCount = payments.length;
  const completedCount = completedRecords.length;

  return (
    <div className="testing-patient-split-container">
      {/* Left Column: Testing Patients Queue */}
      <section className="consulting-section testing-left-list">
        <div className="consulting-list-card">
          <div className="consulting-list-header">
            <div className="consulting-list-title">
              Testing Patients
              <span className="consulting-filter-icon">▽</span>
            </div>

            <div className="consulting-patient-count">
              No of Patients : {loading ? '...' : pendingCount}
            </div>
          </div>

          <div className="consulting-list-body">
            {loading ? (
              <p style={{ padding: '14px 20px', color: '#888' }}>Loading diagnostic queue...</p>
            ) : payments.length === 0 ? (
              <p style={{ padding: '14px 20px', color: '#888' }}>No pending patients on list</p>
            ) : (
              payments.map((pa, i) => (
                <div
                  key={pa.paymentId}
                  className={`consulting-list-row ${selected?.paymentId === pa.paymentId ? 'consulting-list-row--active' : ''}`}
                  onClick={() => handleSelect(pa)}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="consulting-list-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="consulting-list-id">{pa.patientTelephone}</span>
                  <span className="consulting-list-name">{pa.name}</span>
                  <span className="consulting-list-age">Age: {pa.age}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Right Column: Diagnostic Dashboard Card Only */}
      <aside className="testing-right-side-panel">
        <div className="testing-side-card testing-chart-large-card">
          <div className="chart-card-header">
            <div>
              <h4>Diagnostic Workload & Throughput</h4>
              <p>Weekly activity aggregated live from database</p>
            </div>
          </div>

          <div className="chart-wave-wrapper">
            <DiagnosticWaveChart weeklyData={weeklyThroughput} />
          </div>

          <div className="chart-footer-metrics">
            <div className="metric-col">
              <span className="metric-label">Pending Tests</span>
              <strong className="metric-val">{pendingCount}</strong>
            </div>
            <div className="metric-divider" />
            <div className="metric-col">
              <span className="metric-label">Completed</span>
              <strong className="metric-val">{completedCount}</strong>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default Testing_Patient;
