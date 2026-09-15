import React, { useState } from 'react';
import './laboratory_work_queue.css';

const INITIAL_QUEUE = [
  {
    id: 'LAB-9042',
    patientName: 'Kavindu Senanayake',
    patientId: 'PT-1048',
    testType: 'Cardiac Troponin I & CK-MB',
    department: 'Biochemistry (STAT)',
    priority: 'STAT',
    tube: 'Green (Lithium Heparin)',
    tubeColor: '#22c55e',
    accessionTime: '10:14 AM',
    targetTat: '45 mins',
    status: 'In-Analysis',
    tatElapsed: '28 mins',
    analyzer: 'Cobas e411 #01',
    flagged: true,
  },
  {
    id: 'LAB-9043',
    patientName: 'Anoma Jayasinghe',
    patientId: 'PT-1052',
    testType: 'Complete Blood Count (CBC) + ESR',
    department: 'Hematology',
    priority: 'STAT',
    tube: 'Lavender (K2 EDTA)',
    tubeColor: '#a855f7',
    accessionTime: '10:20 AM',
    targetTat: '45 mins',
    status: 'Centrifuging',
    tatElapsed: '18 mins',
    analyzer: 'Sysmex XN-550',
    flagged: false,
  },
  {
    id: 'LAB-9044',
    patientName: 'Mohamed Rameez',
    patientId: 'PT-1039',
    testType: 'Serum Potassium & Renal Panel',
    department: 'Biochemistry',
    priority: 'Urgent',
    tube: 'Gold (SST Gel)',
    tubeColor: '#eab308',
    accessionTime: '09:45 AM',
    targetTat: '120 mins',
    status: 'Validating',
    tatElapsed: '52 mins',
    analyzer: 'Beckman AU480',
    flagged: true,
  },
  {
    id: 'LAB-9045',
    patientName: 'Devika Wickramasinghe',
    patientId: 'PT-1061',
    testType: 'Prothrombin Time (PT/INR) & aPTT',
    department: 'Coagulation',
    priority: 'Urgent',
    tube: 'Light Blue (Citrate)',
    tubeColor: '#38bdf8',
    accessionTime: '09:50 AM',
    targetTat: '120 mins',
    status: 'In-Analysis',
    tatElapsed: '44 mins',
    analyzer: 'Stago Compact Max',
    flagged: false,
  },
  {
    id: 'LAB-9046',
    patientName: 'Sarath Bandara',
    patientId: 'PT-1027',
    testType: 'Lipid Profile & Liver Function (LFT)',
    department: 'Biochemistry',
    priority: 'Routine',
    tube: 'Gold (SST Gel)',
    tubeColor: '#eab308',
    accessionTime: '08:30 AM',
    targetTat: '360 mins',
    status: 'Received',
    tatElapsed: '125 mins',
    analyzer: 'Beckman AU480',
    flagged: false,
  },
  {
    id: 'LAB-9047',
    patientName: 'Chathurika Perera',
    patientId: 'PT-1088',
    testType: 'Blood Culture & Gram Stain',
    department: 'Microbiology',
    priority: 'STAT',
    tube: 'Blood Culture (SPS)',
    tubeColor: '#0f172a',
    accessionTime: '09:15 AM',
    targetTat: '24 hrs',
    status: 'In-Analysis',
    tatElapsed: '80 mins',
    analyzer: 'BACTEC FX40',
    flagged: true,
  },
  {
    id: 'LAB-9048',
    patientName: 'Nihal Fernando',
    patientId: 'PT-1014',
    testType: 'HbA1c & Fasting Blood Sugar',
    department: 'Hematology / Special',
    priority: 'Routine',
    tube: 'Lavender & Gray',
    tubeColor: '#a855f7',
    accessionTime: '08:45 AM',
    targetTat: '360 mins',
    status: 'Completed',
    tatElapsed: '110 mins',
    analyzer: 'Bio-Rad D-10',
    flagged: false,
  },
];

const STAGES = ['All', 'Received', 'Centrifuging', 'In-Analysis', 'Validating', 'Completed'];

function LaboratoryWorkQueue() {
  const [queue, setQueue] = useState(INITIAL_QUEUE);
  const [activeStage, setActiveStage] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [panicModalItem, setPanicModalItem] = useState(null);

  // Statistics
  const totalCount = queue.length;
  const statCount = queue.filter((q) => q.priority === 'STAT' && q.status !== 'Completed').length;
  const inAnalysisCount = queue.filter((q) => q.status === 'In-Analysis').length;
  const validatingCount = queue.filter((q) => q.status === 'Validating').length;
  const flaggedCount = queue.filter((q) => q.flagged).length;

  const handleStageChange = (id, newStage) => {
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStage } : item))
    );
  };

  const handleToggleFlag = (id) => {
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, flagged: !item.flagged } : item))
    );
  };

  const filteredQueue = queue.filter((item) => {
    const matchesStage = activeStage === 'All' || item.status === activeStage;
    const matchesPriority = priorityFilter === 'All' || item.priority === priorityFilter;
    const matchesSearch =
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.testType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.analyzer.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStage && matchesPriority && matchesSearch;
  });

  return (
    <div className="lab-queue-wrapper">
      {/* Header */}
      <div className="queue-header">
        <div>
          <h2>Laboratory Work Queue & Specimen Triage</h2>
          <p className="queue-subtitle">
            Real-time accession tracking, STAT triage dispatch, analyzer loading, and critical result escalation.
          </p>
        </div>

        <div className="queue-search-bar">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search LAB ID, Patient, Test, Analyzer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="queue-kpi-grid">
        <div className="kpi-card kpi-total">
          <span className="kpi-label">Active Specimens</span>
          <span className="kpi-value">{totalCount}</span>
          <span className="kpi-sub">Total in lab stream</span>
        </div>

        <div className="kpi-card kpi-stat">
          <span className="kpi-label">STAT Urgent Queue</span>
          <span className="kpi-value">{statCount}</span>
          <span className="kpi-sub">TAT target &lt; 45 mins</span>
        </div>

        <div className="kpi-card kpi-analysis">
          <span className="kpi-label">In-Analysis</span>
          <span className="kpi-value">{inAnalysisCount}</span>
          <span className="kpi-sub">Running on analyzers</span>
        </div>

        <div className="kpi-card kpi-validating">
          <span className="kpi-label">Awaiting Validation</span>
          <span className="kpi-value">{validatingCount}</span>
          <span className="kpi-sub">QC & Delta checks</span>
        </div>

        <div className="kpi-card kpi-flagged" onClick={() => setPriorityFilter(priorityFilter === 'Flagged' ? 'All' : 'Flagged')}>
          <span className="kpi-label">🚨 Critical Panic Flags</span>
          <span className="kpi-value">{flaggedCount}</span>
          <span className="kpi-sub">Mandatory call-out</span>
        </div>
      </div>

      {/* Triage & Stage Controls */}
      <div className="queue-controls-bar">
        {/* Stage Tabs */}
        <div className="stage-tabs">
          {STAGES.map((stg) => (
            <button
              key={stg}
              type="button"
              className={`stage-tab-btn ${activeStage === stg ? 'active' : ''}`}
              onClick={() => setActiveStage(stg)}
            >
              {stg}
            </button>
          ))}
        </div>

        {/* Priority Filter */}
        <div className="priority-filters">
          <span className="filter-label">Priority:</span>
          {['All', 'STAT', 'Urgent', 'Routine'].map((p) => (
            <button
              key={p}
              type="button"
              className={`priority-pill-btn ${priorityFilter === p ? 'active' : ''} pill-${p.toLowerCase()}`}
              onClick={() => setPriorityFilter(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Work Queue Table */}
      <div className="queue-table-container">
        <table className="queue-table">
          <thead>
            <tr>
              <th style={{ width: '11%' }}>Lab ID</th>
              <th style={{ width: '17%' }}>Patient Details</th>
              <th style={{ width: '22%' }}>Test Requested & Tube</th>
              <th style={{ width: '10%' }}>Priority</th>
              <th style={{ width: '14%' }}>Analyzer & Stage</th>
              <th style={{ width: '13%' }}>TAT Progress</th>
              <th style={{ width: '13%' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredQueue.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-queue-data">
                  No specimens found in this queue category.
                </td>
              </tr>
            ) : (
              filteredQueue.map((item) => (
                <tr key={item.id} className={item.flagged ? 'row-flagged' : ''}>
                  <td>
                    <div className="lab-id-cell">
                      <strong>{item.id}</strong>
                      <span className="accession-time">{item.accessionTime}</span>
                    </div>
                  </td>

                  <td>
                    <div className="patient-cell">
                      <strong className="patient-name">{item.patientName}</strong>
                      <span className="patient-id-badge">{item.patientId}</span>
                    </div>
                  </td>

                  <td>
                    <div className="test-cell">
                      <strong>{item.testType}</strong>
                      <div className="tube-indicator-row">
                        <span className="tube-dot" style={{ backgroundColor: item.tubeColor }} />
                        <span className="tube-name">{item.tube}</span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className={`priority-badge badge-${item.priority.toLowerCase()}`}>
                      {item.priority === 'STAT' && '⚡ '}
                      {item.priority}
                    </span>
                  </td>

                  <td>
                    <div className="analyzer-cell">
                      <span className="analyzer-name">{item.analyzer}</span>
                      <select
                        className={`stage-select stage-${item.status.toLowerCase().replace('-', '')}`}
                        value={item.status}
                        onChange={(e) => handleStageChange(item.id, e.target.value)}
                      >
                        <option value="Received">Received</option>
                        <option value="Centrifuging">Centrifuging</option>
                        <option value="In-Analysis">In-Analysis</option>
                        <option value="Validating">Validating</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </td>

                  <td>
                    <div className="tat-cell">
                      <div className="tat-text">
                        <span>{item.tatElapsed}</span> / <strong>{item.targetTat}</strong>
                      </div>
                      <div className="tat-progress-bar">
                        <div
                          className={`tat-fill ${item.priority === 'STAT' ? 'tat-stat' : ''}`}
                          style={{
                            width: item.status === 'Completed' ? '100%' : `${Math.min(100, (parseInt(item.tatElapsed) / parseInt(item.targetTat)) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </td>

                  <td>
                    <div className="queue-actions">
                      {item.flagged && (
                        <button
                          type="button"
                          className="panic-alert-btn"
                          title="View Critical Panic SOP Call-Out Checklist"
                          onClick={() => setPanicModalItem(item)}
                        >
                          🚨 Call Out
                        </button>
                      )}
                      <button
                        type="button"
                        className={`flag-btn ${item.flagged ? 'active' : ''}`}
                        title="Toggle Critical Flag"
                        onClick={() => handleToggleFlag(item.id)}
                      >
                        {item.flagged ? '🚩 Flagged' : '🏳️ Flag'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Critical Result Call-out Modal */}
      {panicModalItem && (
        <div className="panic-modal-backdrop" onClick={() => setPanicModalItem(null)}>
          <div className="panic-modal" onClick={(e) => e.stopPropagation()}>
            <div className="panic-modal-header">
              <div className="panic-icon">🚨</div>
              <div>
                <h3>Critical Result Notification Checklist</h3>
                <p>Mandatory immediate telephone notification protocol</p>
              </div>
              <button type="button" className="close-modal-btn" onClick={() => setPanicModalItem(null)}>✕</button>
            </div>

            <div className="panic-modal-body">
              <div className="panic-patient-card">
                <div>
                  <strong>{panicModalItem.patientName}</strong> ({panicModalItem.patientId})
                </div>
                <div>Lab ID: <code>{panicModalItem.id}</code></div>
                <div>Test: <strong>{panicModalItem.testType}</strong></div>
              </div>

              <div className="sop-checklist">
                <h4>Mandatory SOP Steps:</h4>
                <ol>
                  <li><strong>Call Ward / Attending Doctor:</strong> Initiate verbal call immediately within 15 minutes.</li>
                  <li><strong>State Critical Alert:</strong> "This is the Laboratory with a CRITICAL PANIC value for {panicModalItem.patientName}."</li>
                  <li><strong>Request Read-Back:</strong> The receiving clinician must repeat the patient name, hospital ID, test, and exact value.</li>
                  <li><strong>Log Call-Out:</strong> Note clinician name, designation, timestamp, and MLT staff initials into LIS.</li>
                </ol>
              </div>
            </div>

            <div className="panic-modal-footer">
              <button
                type="button"
                className="confirm-call-btn"
                onClick={() => {
                  alert(`Critical notification logged for ${panicModalItem.patientName}. Audit record created.`);
                  setPanicModalItem(null);
                }}
              >
                ✓ Complete & Log Verbal Call-Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LaboratoryWorkQueue;
