import React, { useState, useEffect } from 'react';
import './dashboard.css';

/* ── SVG Icons (inline to avoid dependencies) ── */
const Icons = {
  chart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
    </svg>
  ),
  patients: (color) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  revenue: (color) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  registered: (color) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="18" x2="12" y2="12" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  ),
  bookings: (color) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <path d="M8 14h.01" />
      <path d="M12 14h.01" />
      <path d="M16 14h.01" />
      <path d="M8 18h.01" />
      <path d="M12 18h.01" />
    </svg>
  ),
  clock: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  payment: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  ),
  trendUp: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  trendDown: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
    </svg>
  ),
};

/* ── Enhanced SVG Area Chart ── */
function AreaLineChart({ data, xKey, yKey, color, yLabelPrefix = '', gradientId }) {
  if (!data || data.length === 0) return <div className="recent-empty">No data available</div>;

  const maxVal = Math.max(...data.map((d) => d[yKey]), 1);
  const chartHeight = 200;
  const chartWidth = 620;
  const padding = 70;
  const rightPadding = 25;
  const pointSpacing = (chartWidth - padding - rightPadding) / (data.length - 1 || 1);

  // Generate points
  const points = data.map((d, i) => ({
    x: padding + i * pointSpacing,
    y: padding + chartHeight - (d[yKey] / maxVal) * chartHeight,
    value: d[yKey],
    label: d[xKey],
  }));

  // Line path
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  // Area path (closed polygon for gradient fill)
  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding + chartHeight} L ${points[0].x} ${padding + chartHeight} Z`;

  return (
    <svg viewBox={`-5 0 ${chartWidth + 10} ${chartHeight + 55}`} className="svg-chart">
      <defs>
        {/* Gradient fill for area */}
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
        {/* Glow filter for line */}
        <filter id={`glow-${gradientId}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
        <g key={ratio}>
          <line
            x1={padding}
            y1={padding + chartHeight * (1 - ratio)}
            x2={chartWidth - rightPadding}
            y2={padding + chartHeight * (1 - ratio)}
            stroke="#e2e8f0"
            strokeDasharray={ratio === 0 ? '0' : '3 6'}
            strokeWidth={ratio === 0 ? '1.5' : '1'}
            opacity={ratio === 0 ? '0.8' : '0.5'}
          />
          <text x={padding - 10} y={padding + chartHeight * (1 - ratio) + 4} textAnchor="end" fontSize="11" fill="#94a3b8" fontWeight="500">
            {yLabelPrefix}
            {Math.round(maxVal * ratio).toLocaleString()}
          </text>
        </g>
      ))}

      {/* Area Fill */}
      <path d={areaD} fill={`url(#${gradientId})`} className="chart-area-fill" />

      {/* Line Path */}
      <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="chart-line-path" filter={`url(#glow-${gradientId})`} />

      {/* Data Points */}
      {points.map((p, index) => (
        <g key={index} className="chart-point-group">
          {/* Tooltip background pill */}
          <rect x={p.x - 28} y={p.y - 30} width="56" height="20" rx="6" fill="#1e293b" opacity="0" className="chart-tooltip-bg" />
          {/* Point */}
          <circle cx={p.x} cy={p.y} r="5" fill="#ffffff" stroke={color} strokeWidth="2.5" className="chart-point" />
          {/* Tooltip text */}
          <text x={p.x} y={p.y - 16} textAnchor="middle" fontSize="10" fontWeight="700" fill="#ffffff" opacity="0" className="chart-point-label">
            {yLabelPrefix}
            {p.value.toLocaleString()}
          </text>
          {/* X-axis label */}
          <text x={p.x} y={padding + chartHeight + 22} textAnchor="middle" fontSize="11" fill="#94a3b8" fontWeight="500">
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
  const totalBookingsThisYear = filteredBookings.length;

  // Calculate average revenue per patient
  const avgRevenuePerPatient = totalPatientsThisYear > 0 ? Math.round(totalRevenueThisYear / totalPatientsThisYear) : 0;

  // Recent bookings (last 5)
  const recentBookings = [...filteredBookings].sort((a, b) => (b.appointmentDate || '').localeCompare(a.appointmentDate || '')).slice(0, 5);

  // Recent payments (last 5)
  const recentPayments = [...filteredPayments].sort((a, b) => (b.payment_date || '').localeCompare(a.payment_date || '')).slice(0, 5);

  const avatarColors = ['green', 'blue', 'amber', 'purple'];
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <section className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header-flex">
        <div className="dashboard-header-left">
          <h2 className="dashboard-main-title">
            <span className="dashboard-title-icon">{Icons.chart}</span>
            Analytics Dashboard
          </h2>
          <p className="dashboard-subtitle">Real-time overview of hospital performance & patient metrics</p>
        </div>
        <div className="dashboard-filter">
          <label htmlFor="year-select">Year:</label>
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
          <span>Loading analytics data...</span>
        </div>
      ) : (
        <>
          {/* ── Stats Cards ── */}
          <div className="dashboard-stats-grid border-shimmer">
            <div className="stat-card stat-card--green">
              <div className="stat-card-icon">{Icons.patients('#16a34a')}</div>
              <div className="stat-card-body">
                <h3 className="stat-card-title">Patients This Year</h3>
                <p className="stat-card-value">{totalPatientsThisYear.toLocaleString()}</p>
                <div className="stat-card-change stat-card-change--neutral">
                  {Icons.trendUp} {selectedYear}
                </div>
              </div>
            </div>

            <div className="stat-card stat-card--blue">
              <div className="stat-card-icon">{Icons.revenue('#2563eb')}</div>
              <div className="stat-card-body">
                <h3 className="stat-card-title">Total Revenue</h3>
                <p className="stat-card-value">Rs. {totalRevenueThisYear.toLocaleString()}</p>
                <div className="stat-card-change stat-card-change--neutral">
                  {Icons.trendUp} {selectedYear}
                </div>
              </div>
            </div>

            <div className="stat-card stat-card--amber">
              <div className="stat-card-icon">{Icons.registered('#d97706')}</div>
              <div className="stat-card-body">
                <h3 className="stat-card-title">Registered Patients</h3>
                <p className="stat-card-value">{patients.length.toLocaleString()}</p>
                <div className="stat-card-change stat-card-change--up">{Icons.trendUp} All-time</div>
              </div>
            </div>

            <div className="stat-card stat-card--purple">
              <div className="stat-card-icon">{Icons.bookings('#7c3aed')}</div>
              <div className="stat-card-body">
                <h3 className="stat-card-title">Avg. Revenue / Patient</h3>
                <p className="stat-card-value">Rs. {avgRevenuePerPatient.toLocaleString()}</p>
                <div className="stat-card-change stat-card-change--neutral">
                  {Icons.trendUp} {selectedYear}
                </div>
              </div>
            </div>
          </div>

          {/* ── Charts ── */}
          <div className="dashboard-charts-grid">
            <div className="chart-card">
              <div className="chart-card-header">
                <h3 className="chart-title">
                  <span className="chart-title-dot chart-title-dot--green"></span>
                  Patients per Month
                </h3>
                <span className="chart-badge">{selectedYear}</span>
              </div>
              <div className="chart-wrapper">
                <AreaLineChart data={patientsPerMonthData} xKey="month" yKey="count" color="#22c55e" gradientId="patientGrad" />
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-card-header">
                <h3 className="chart-title">
                  <span className="chart-title-dot chart-title-dot--blue"></span>
                  Revenue per Month
                </h3>
                <span className="chart-badge">{selectedYear}</span>
              </div>
              <div className="chart-wrapper">
                <AreaLineChart data={revenuePerMonthData} xKey="month" yKey="revenue" color="#3b82f6" yLabelPrefix="Rs." gradientId="revenueGrad" />
              </div>
            </div>
          </div>


        </>
      )}
    </section>
  );
}

export default Dashboard;
