import React, { useState, useEffect } from 'react';
import './dashboard.css';

/* ── SVG Icons (inline to avoid dependencies) ── */
const Icons = {
  patients: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  revenue: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  registered: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="18" x2="12" y2="12" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  ),
  bookings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
};

/* ── Restrained SVG line chart — no glow, no gradient fill, minimal chrome ── */
function AreaLineChart({ data, xKey, yKey, color, yLabelPrefix = '', gradientId }) {
  if (!data || data.length === 0) return <div className="recent-empty">No data available</div>;

  const maxVal = Math.max(...data.map((d) => d[yKey]), 1);
  const chartHeight = 190;
  const chartWidth = 620;
  const padding = 62;
  const rightPadding = 20;
  const pointSpacing = (chartWidth - padding - rightPadding) / (data.length - 1 || 1);

  const points = data.map((d, i) => ({
    x: padding + i * pointSpacing,
    y: padding + chartHeight - (d[yKey] / maxVal) * chartHeight,
    value: d[yKey],
    label: d[xKey],
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <svg viewBox={`-5 0 ${chartWidth + 10} ${chartHeight + 50}`} className="svg-chart">
      {/* Baseline grid — three quiet reference lines, no dashes */}
      {[0, 0.5, 1].map((ratio) => (
        <g key={ratio}>
          <line
            x1={padding}
            y1={padding + chartHeight * (1 - ratio)}
            x2={chartWidth - rightPadding}
            y2={padding + chartHeight * (1 - ratio)}
            stroke="#e7e9e5"
            strokeWidth="1"
          />
          <text x={padding - 10} y={padding + chartHeight * (1 - ratio) + 4} textAnchor="end" fontSize="11" fill="#8b8f88" fontWeight="500">
            {yLabelPrefix}
            {Math.round(maxVal * ratio).toLocaleString()}
          </text>
        </g>
      ))}

      {/* Line */}
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="chart-line-path" />

      {/* Points + labels */}
      {points.map((p, index) => (
        <g key={index} className="chart-point-group">
          <circle cx={p.x} cy={p.y} r="3" fill="#ffffff" stroke={color} strokeWidth="2" className="chart-point" />
          <text x={p.x} y={p.y - 12} textAnchor="middle" fontSize="10" fontWeight="600" fill="#3d4038" opacity="0" className="chart-point-label">
            {yLabelPrefix}
            {p.value.toLocaleString()}
          </text>
          <text x={p.x} y={padding + chartHeight + 22} textAnchor="middle" fontSize="11" fill="#8b8f88" fontWeight="500">
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

function Dashboard() {
  const [patients, setPatients] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsRes, bookingsRes, paymentsRes] = await Promise.all([
          fetch('http://127.0.0.1:5000/patient/all_patients'),
          fetch('http://127.0.0.1:5000/booking/all_bookings'),
          fetch('http://127.0.0.1:5000/payments'),
        ]);

        const patientsData = await patientsRes.json();
        const bookingsData = await bookingsRes.json();
        const paymentsData = await paymentsRes.json();

        setPatients(Array.isArray(patientsData) ? patientsData : []);
        setBookings(Array.isArray(bookingsData) ? bookingsData : []);
        setPayments(Array.isArray(paymentsData) ? paymentsData : []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper to get month index from date string (YYYY-MM-DD)
  const getMonthFromDate = (dateStr) => {
    if (!dateStr) return -1;
    const parts = dateStr.split('-');
    if (parts.length >= 2) return parseInt(parts[1], 10) - 1; // 0-based
    return -1;
  };

  const getYearFromDate = (dateStr) => {
    if (!dateStr) return '';
    return dateStr.split('-')[0];
  };

  // Filter by year
  const filteredBookings = bookings.filter((b) => getYearFromDate(b.appointmentDate) === selectedYear);
  const filteredPayments = payments.filter((p) => getYearFromDate(p.payment_date) === selectedYear);

  // Available years for filter (based on payments and bookings)
  const availableYears = Array.from(
    new Set([...bookings.map((b) => getYearFromDate(b.appointmentDate)).filter(Boolean), ...payments.map((p) => getYearFromDate(p.payment_date)).filter(Boolean), new Date().getFullYear().toString()])
  ).sort((a, b) => b.localeCompare(a)); // Descending

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // 1. Chart Data: Patients (Bookings) vs Month
  const patientsPerMonthData = months.map((month, index) => {
    const count = filteredBookings.filter((b) => getMonthFromDate(b.appointmentDate) === index).length;
    return { month, count };
  });

  // 2. Chart Data: Revenue vs Month
  const revenuePerMonthData = months.map((month, index) => {
    const monthPayments = filteredPayments.filter((p) => getMonthFromDate(p.payment_date) === index);
    const revenue = monthPayments.reduce((sum, p) => sum + (p.total_amount || 0), 0);
    return { month, revenue };
  });

  // Stats
  const totalPatientsThisYear = patientsPerMonthData.reduce((sum, d) => sum + d.count, 0);
  const totalRevenueThisYear = revenuePerMonthData.reduce((sum, d) => sum + d.revenue, 0);

  // Calculate average revenue per patient
  const avgRevenuePerPatient = totalPatientsThisYear > 0 ? Math.round(totalRevenueThisYear / totalPatientsThisYear) : 0;

  return (
    <section className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header-flex">
        <div className="dashboard-header-left">
          <h2 className="dashboard-main-title">Overview</h2>
          <p className="dashboard-subtitle">How the practice is tracking, patient volume and revenue by month</p>
        </div>
        <div className="dashboard-filter">
          <label htmlFor="year-select">Year</label>
          <select id="year-select" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="year-select">
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </header>

      {loading ? (
        <div className="dashboard-loading">
          <div className="dashboard-loading-spinner"></div>
          <span>Loading overview…</span>
        </div>
      ) : (
        <>
          {/* ── Stats ── */}
          <div className="dashboard-stats-grid">
            <div className="stat-card">
              <div className="stat-card-icon">{Icons.patients}</div>
              <div className="stat-card-body">
                <h3 className="stat-card-title">Patients seen, {selectedYear}</h3>
                <p className="stat-card-value">{totalPatientsThisYear.toLocaleString()}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-icon">{Icons.revenue}</div>
              <div className="stat-card-body">
                <h3 className="stat-card-title">Revenue, {selectedYear}</h3>
                <p className="stat-card-value">Rs. {totalRevenueThisYear.toLocaleString()}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-icon">{Icons.registered}</div>
              <div className="stat-card-body">
                <h3 className="stat-card-title">Registered patients</h3>
                <p className="stat-card-value">{patients.length.toLocaleString()}</p>
                <p className="stat-card-note">All-time</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-card-icon">{Icons.bookings}</div>
              <div className="stat-card-body">
                <h3 className="stat-card-title">Avg. revenue per patient</h3>
                <p className="stat-card-value">Rs. {avgRevenuePerPatient.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* ── Charts ── */}
          <div className="dashboard-charts-grid">
            <div className="chart-card">
              <div className="chart-card-header">
                <h3 className="chart-title">Patients per month</h3>
                <span className="chart-badge">{selectedYear}</span>
              </div>
              <div className="chart-wrapper">
                <AreaLineChart data={patientsPerMonthData} xKey="month" yKey="count" color="#2f6f4f" gradientId="patientGrad" />
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-card-header">
                <h3 className="chart-title">Revenue per month</h3>
                <span className="chart-badge">{selectedYear}</span>
              </div>
              <div className="chart-wrapper">
                <AreaLineChart data={revenuePerMonthData} xKey="month" yKey="revenue" color="#3a6ea5" yLabelPrefix="Rs." gradientId="revenueGrad" />
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default Dashboard;
