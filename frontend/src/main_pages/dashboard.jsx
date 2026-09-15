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

/* ── Restrained SVG line chart — minimal chrome & elegant area gradient ── */
function AreaLineChart({ data, xKey, yKey, color, yLabelPrefix = '', gradientId = 'areaGrad' }) {
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
  const fillD = `${pathD} L ${points[points.length - 1].x} ${padding + chartHeight} L ${points[0].x} ${padding + chartHeight} Z`;

  return (
    <svg viewBox={`-5 0 ${chartWidth + 10} ${chartHeight + 50}`} className="svg-chart">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>

      {/* Baseline grid */}
      {[0, 0.5, 1].map((ratio) => (
        <g key={ratio}>
          <line
            x1={padding}
            y1={padding + chartHeight * (1 - ratio)}
            x2={chartWidth - rightPadding}
            y2={padding + chartHeight * (1 - ratio)}
            stroke="#e7e9e5"
            strokeWidth="1.5"
          />
          <text x={padding - 10} y={padding + chartHeight * (1 - ratio) + 4} textAnchor="end" fontSize="11" fill="#767c72" fontWeight="500">
            {yLabelPrefix}
            {Math.round(maxVal * ratio).toLocaleString()}
          </text>
        </g>
      ))}

      {/* Area Gradient Fill */}
      <path d={fillD} fill={`url(#${gradientId})`} />

      {/* Line */}
      <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="chart-line-path" />

      {/* Points + labels */}
      {points.map((p, index) => (
        <g key={index} className="chart-point-group">
          <circle cx={p.x} cy={p.y} r={p.value > 0 ? 4 : 3} fill="#ffffff" stroke={color} strokeWidth="2" className="chart-point" />
          {p.value > 0 && (
            <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="10" fontWeight="700" fill={color} className="chart-point-label visible">
              {yLabelPrefix}
              {p.value.toLocaleString()}
            </text>
          )}
          <text x={p.x} y={padding + chartHeight + 22} textAnchor="middle" fontSize="11" fill="#767c72" fontWeight="500">
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

function Dashboard() {
  const [patients, setPatients] = useState([]);
  const [payments, setPayments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Fetch Patients, Payments, and Bookings concurrently
  useEffect(() => {
    Promise.all([
      fetch('http://127.0.0.1:5000/patient/all_patients').then((res) => (res.ok ? res.json() : [])).catch(() => []),
      fetch('http://127.0.0.1:5000/payments').then((res) => (res.ok ? res.json() : [])).catch(() => []),
      fetch('http://127.0.0.1:5000/booking/all_bookings').then((res) => (res.ok ? res.json() : [])).catch(() => []),
    ])
      .then(([patientsData, paymentsData, bookingsData]) => {
        if (Array.isArray(patientsData)) setPatients(patientsData);
        if (Array.isArray(paymentsData)) setPayments(paymentsData);
        if (Array.isArray(bookingsData)) setBookings(bookingsData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch dashboard data:', err);
        setLoading(false);
      });
  }, []);

  // Helper: extract year from date string (handles 'YYYY-MM-DD', ISO, etc.)
  const getYearFromDate = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return isNaN(d.getFullYear()) ? null : d.getFullYear().toString();
  };

  // Helper: extract 0-indexed month (0 = Jan, 11 = Dec)
  const getMonthFromDate = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return isNaN(d.getMonth()) ? null : d.getMonth();
  };

  // Collect available years from all data sources
  const availableYears = Array.from(
    new Set([
      ...bookings.map((b) => getYearFromDate(b.appointmentDate || b.appointment_date)),
      ...payments.map((p) => getYearFromDate(p.payment_date || p.paymentDate)),
      ...patients.map((p) => getYearFromDate(p.registered_date || p.created_at || p.date)),
      new Date().getFullYear().toString(),
    ].filter(Boolean))
  ).sort((a, b) => b - a);

  // Filter data by selected year
  const filteredBookings = bookings.filter((b) => getYearFromDate(b.appointmentDate || b.appointment_date) === selectedYear);
  const filteredPayments = payments.filter((p) => getYearFromDate(p.payment_date || p.paymentDate) === selectedYear);
  const filteredPatients = patients.filter((p) => {
    const d = p.registered_date || p.created_at || p.date;
    return d ? getYearFromDate(d) === selectedYear : false;
  });

  // 1. Chart Data: Patients vs Month (combining actual visits, bookings & payments)
  const patientsPerMonthData = months.map((month, index) => {
    const monthBookings = filteredBookings.filter((b) => getMonthFromDate(b.appointmentDate || b.appointment_date) === index);
    const monthPayments = filteredPayments.filter((p) => getMonthFromDate(p.payment_date || p.paymentDate) === index);

    // Count unique patients seen by phone or full name
    const patientKeys = new Set([
      ...monthBookings.map((b) => (b.telephone || `${b.first_name || ''} ${b.last_name || ''}`).trim()),
      ...monthPayments.map((p) => (p.telephone || `${p.first_name || ''} ${p.last_name || ''}`).trim()),
    ].filter(Boolean));

    const registeredThisMonth = filteredPatients.filter((p) => getMonthFromDate(p.registered_date || p.created_at || p.date) === index).length;

    const count = Math.max(patientKeys.size, registeredThisMonth);
    return { month, count };
  });

  // 2. Chart Data: Revenue vs Month
  const revenuePerMonthData = months.map((month, index) => {
    const monthPayments = filteredPayments.filter((p) => getMonthFromDate(p.payment_date || p.paymentDate) === index);
    const revenue = monthPayments.reduce((sum, p) => sum + (Number(p.total_amount) || 0), 0);
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
          <h2 className="dashboard-main-title">Analytics Dashboard</h2>
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
                <AreaLineChart data={patientsPerMonthData} xKey="month" yKey="count" color="#22c55e" gradientId="patientGrad" />
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-card-header">
                <h3 className="chart-title">Revenue per month</h3>
                <span className="chart-badge">{selectedYear}</span>
              </div>
              <div className="chart-wrapper">
                <AreaLineChart data={revenuePerMonthData} xKey="month" yKey="revenue" color="#16a34a" yLabelPrefix="Rs." gradientId="revenueGrad" />
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default Dashboard;
