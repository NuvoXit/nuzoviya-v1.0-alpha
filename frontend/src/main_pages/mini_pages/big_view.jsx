import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './big_view.css';

function BigView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [surgery, setSurgery] = useState(location.state?.surgery || null);
    const [loading, setLoading] = useState(!surgery);

    useEffect(() => {
        if (!surgery && id) {
            fetch(`http://127.0.0.1:5000/prescription/${id}`)
                .then((res) => res.json())
                .then((data) => {
                    if (data && !data.error) {
                        setSurgery(data);
                    }
                    setLoading(false);
                })
                .catch((err) => {
                    console.error('Error fetching surgery details:', err);
                    setLoading(false);
                });
        }
    }, [id, surgery]);

    const formatSurgeryDate = (dateStr) => {
        if (!dateStr) return 'Date Pending';
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch {
            return dateStr;
        }
    };

    // Parse medicines safely
    let parsedMedicines = [];
    if (surgery?.medicines) {
        try {
            parsedMedicines = typeof surgery.medicines === 'string'
                ? JSON.parse(surgery.medicines)
                : surgery.medicines;
        } catch {
            parsedMedicines = [];
        }
    }

    // Parse assigned staff safely
    let parsedStaff = [];
    if (surgery?.assigned_staff) {
        try {
            parsedStaff = typeof surgery.assigned_staff === 'string'
                ? JSON.parse(surgery.assigned_staff)
                : surgery.assigned_staff;
        } catch {
            parsedStaff = [];
        }
    }

    return (
        <section className="big-view-section">
            <div className="big-view-header">
                <div>
                    <h1 className="big-view-title">Surgical Procedure Booking History</h1>
                    <p className="big-view-subtitle">
                        Comprehensive clinical report, surgical process instructions, and staff assignments.
                    </p>
                </div>
                <button
                    type="button"
                    className="big-view-back-btn"
                    onClick={() => navigate('/scheduled_surgery')}
                >
                    ← Back to Scheduled Surgeries
                </button>
            </div>

            {loading ? (
                <div className="big-view-loading">
                    <div className="big-view-spinner" />
                    <p>Loading surgical procedure details...</p>
                </div>
            ) : !surgery ? (
                <div className="big-view-empty">
                    <h3>Surgical Record Not Found</h3>
                    <p>The requested surgical procedure history could not be loaded.</p>
                    <button
                        type="button"
                        className="big-view-back-btn"
                        onClick={() => navigate('/scheduled_surgery')}
                    >
                        Return to List
                    </button>
                </div>
            ) : (
                <div className="big-view-grid">
                    {/* Patient & Booking Main Card */}
                    <div className="big-card big-card-primary">
                        <div className="big-card-top-row">
                            <div className="big-patient-profile">
                                <span className="big-avatar">
                                    {(surgery.patient_name || 'P').charAt(0).toUpperCase()}
                                </span>
                                <div>
                                    <h2 className="big-patient-name">{surgery.patient_name}</h2>
                                    <span className="big-patient-meta">
                                        {surgery.age ? `Age: ${surgery.age}` : 'Age: —'} &nbsp;|&nbsp;
                                        Prescription #{surgery.prescription_id}
                                    </span>
                                </div>
                            </div>
                            <span className={`big-status-badge ${surgery.is_authorized ? 'authorized' : 'pending'}`}>
                                {surgery.is_authorized ? 'Authorized' : 'Awaiting Authorization'}
                            </span>
                        </div>

                        <div className="big-details-summary">
                            <div className="summary-item highlight">
                                <div>
                                    <label>Scheduled Surgery Date</label>
                                    <strong>{formatSurgeryDate(surgery.surgery_date)}</strong>
                                </div>
                            </div>

                            <div className="summary-item highlight">
                                <div>
                                    <label>Scheduled Surgery Time</label>
                                    <strong>{surgery.surgery_time || 'Time Pending'}</strong>
                                </div>
                            </div>

                            <div className="summary-item">
                                <div>
                                    <label>Attending Surgeon / Doctor</label>
                                    <strong>{surgery.doctor_name || 'Dr. Consulting Physician'}</strong>
                                </div>
                            </div>

                            <div className="summary-item">
                                <div>
                                    <label>Booking / Issue Date</label>
                                    <strong>{surgery.prescription_date || '—'}</strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pre-Operative Preparation */}
                    <div className="big-card">
                        <div className="big-card-header">
                            <h3>Pre-Operative Preparation Details</h3>
                        </div>
                        <div className="big-card-body">
                            {surgery.surgery_preparation ? (
                                <p className="notes-text">{surgery.surgery_preparation}</p>
                            ) : (
                                <p className="notes-empty">No pre-operative preparation details specified.</p>
                            )}
                        </div>
                    </div>

                    {/* Surgical Process & Operative Technique */}
                    <div className="big-card">
                        <div className="big-card-header">
                            <h3>Surgical Process & Operative Technique</h3>
                        </div>
                        <div className="big-card-body">
                            {surgery.surgery_process ? (
                                <p className="notes-text">{surgery.surgery_process}</p>
                            ) : (
                                <p className="notes-empty">No operative techniques or surgical process notes recorded.</p>
                            )}
                        </div>
                    </div>

                    {/* Assigned Medical Staff */}
                    <div className="big-card">
                        <div className="big-card-header">
                            <h3>Assigned Medical Team & Staff</h3>
                        </div>
                        <div className="big-card-body">
                            {Array.isArray(parsedStaff) && parsedStaff.length > 0 ? (
                                <div className="staff-pills-list">
                                    {parsedStaff.map((st, i) => (
                                        <div className="staff-pill" key={st.id || i}>
                                            <span className="staff-dot" />
                                            <div>
                                                <strong>{st.name}</strong>
                                                <small>{st.role || 'Staff Nurse'}</small>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="notes-empty">No specific nursing team assigned.</p>
                            )}
                        </div>
                    </div>

                    {/* Clinical Problem & Solution */}
                    <div className="big-card">
                        <div className="big-card-header">
                            <h3>Diagnosis & Clinical Summary</h3>
                        </div>
                        <div className="big-card-body">
                            <div className="diagnosis-grid">
                                <div>
                                    <label className="field-sublabel">Chief Complaint / Problem</label>
                                    <p className="sublabel-val">{surgery.problem || '—'}</p>
                                </div>
                                <div>
                                    <label className="field-sublabel">Clinical Description</label>
                                    <p className="sublabel-val">{surgery.description || '—'}</p>
                                </div>
                                <div>
                                    <label className="field-sublabel">Prescription / Solution</label>
                                    <p className="sublabel-val">{surgery.solution || '—'}</p>
                                </div>
                                <div>
                                    <label className="field-sublabel">Additional Notes</label>
                                    <p className="sublabel-val">{surgery.notes || '—'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Prescribed Medications */}
                    {Array.isArray(parsedMedicines) && parsedMedicines.length > 0 && (
                        <div className="big-card">
                            <div className="big-card-header">
                                <h3>Prescribed Medications</h3>
                            </div>
                            <div className="big-card-body">
                                <div className="medicines-table-wrapper">
                                    <table className="big-medicines-table">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Medicine Name</th>
                                                <th>Dosage / Instructions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {parsedMedicines.map((m, idx) => (
                                                <tr key={m.id || idx}>
                                                    <td>{idx + 1}</td>
                                                    <td><strong>{m.name || '—'}</strong></td>
                                                    <td>{m.dosage || '—'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}

export default BigView;

