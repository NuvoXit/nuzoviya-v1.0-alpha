import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './scheduled_surgical_procedure.css';

function ScheduledSurgicalProcedure() {
    const navigate = useNavigate();
    const [surgeries, setSurgeries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetch('http://127.0.0.1:5000/prescription/scheduled_surgeries')
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setSurgeries(data);
                } else {
                    setSurgeries([]);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error fetching scheduled surgeries:', err);
                setSurgeries([]);
                setLoading(false);
            });
    }, []);

    const filteredSurgeries = surgeries.filter((s) => {
        const query = searchTerm.toLowerCase().trim();
        if (!query) return true;
        const name = (s.patient_name || '').toLowerCase();
        const doc = (s.doctor_name || '').toLowerCase();
        const date = (s.surgery_date || '').toLowerCase();
        return name.includes(query) || doc.includes(query) || date.includes(query);
    });

    const formatSurgeryDate = (dateStr) => {
        if (!dateStr) return 'Date Pending';
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch {
            return dateStr;
        }
    };

    const formatSurgeryTime = (timeStr) => {
        if (!timeStr) return 'Time Pending';
        return timeStr;
    };

    return (
        <section className="scheduled-surgery-page">
            <div className="scheduled-surgery-header">
                <div>
                    <h1 className="scheduled-surgery-title">Scheduled Surgical Procedures</h1>
                    <p className="scheduled-surgery-subtitle">
                        List of all patients booked for surgical intervention with scheduled dates and times.
                    </p>
                </div>
                <div className="scheduled-surgery-meta">
                    <span className="scheduled-count-badge">
                        Total Bookings: {filteredSurgeries.length}
                    </span>
                </div>
            </div>

            <div className="scheduled-surgery-toolbar">
                <input
                    type="text"
                    className="scheduled-search-input"
                    placeholder="Search by patient name, doctor, or date..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="scheduled-loading-state">
                    <div className="scheduled-spinner" />
                    <p>Loading scheduled surgeries...</p>
                </div>
            ) : filteredSurgeries.length === 0 ? (
                <div className="scheduled-empty-state">
                    <h3>No Scheduled Surgeries Found</h3>
                    <p>When a doctor recommends and schedules surgery in a prescription, it will appear here.</p>
                </div>
            ) : (
                <div className="scheduled-surgeries-grid">
                    {filteredSurgeries.map((item) => (
                        <div
                            key={item.prescription_id}
                            className="surgery-card-box"
                            onClick={() => navigate(`/scheduled_surgery/${item.prescription_id}/big_view`, {
                                state: { surgery: item }
                            })}
                        >
                            <div className="surgery-card-top">
                                <span className="surgery-patient-avatar">
                                    {(item.patient_name || 'P').charAt(0).toUpperCase()}
                                </span>
                                <div className="surgery-patient-main">
                                    <h3 className="surgery-patient-name">{item.patient_name}</h3>
                                    <span className="surgery-doctor-sub">
                                        Dr. {item.doctor_name || 'Consulting Physician'}
                                    </span>
                                </div>
                                <span className={`surgery-auth-badge ${item.is_authorized ? 'authorized' : 'pending'}`}>
                                    {item.is_authorized ? 'Authorized' : 'Awaiting Auth'}
                                </span>
                            </div>

                            <div className="surgery-datetime-box">
                                <div className="datetime-item">
                                    <div className="datetime-text">
                                        <label>Surgery Date</label>
                                        <strong>{formatSurgeryDate(item.surgery_date)}</strong>
                                    </div>
                                </div>
                                <div className="datetime-divider" />
                                <div className="datetime-item">
                                    <div className="datetime-text">
                                        <label>Surgery Time</label>
                                        <strong>{formatSurgeryTime(item.surgery_time)}</strong>
                                    </div>
                                </div>
                            </div>

                            <div className="surgery-card-footer">
                                <span className="surgery-id-tag">ID: #{item.prescription_id}</span>
                                <button
                                    type="button"
                                    className="surgery-view-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/scheduled_surgery/${item.prescription_id}/big_view`, {
                                            state: { surgery: item }
                                        });
                                    }}
                                >
                                    View Full Details →
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}

export default ScheduledSurgicalProcedure;

