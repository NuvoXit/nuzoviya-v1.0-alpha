import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './patient_dashboard.css';

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

function PatientDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/patient/all_patients')
      .then((res) => res.json())
      .then((data) => {
        const found = Array.isArray(data) ? data.find((p) => String(p.patient_id) === String(id)) : null;
        setPatient(found || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load patient:', err);
        setLoading(false);
      });
  }, [id]);

  const base = `/consult_patient_list/${id}/dashboard`;

  return (
    <section className="dashboard-section">
      <div className="dashboard-header">
        <button className="dashboard-back-btn" onClick={() => navigate('/consult_patient_list')}>
          ← Back
        </button>

        <div>
          <h2 className="dashboard-title">Patient Dashboard</h2>
          <p className="dashboard-subtitle">Overview and actions for the selected patient</p>
        </div>
      </div>

      {loading ? (
        <p className="dashboard-status">Loading...</p>
      ) : !patient ? (
        <p className="dashboard-status">Patient not found.</p>
      ) : (
        <article className="dashboard-card">
          <div className="dashboard-info">
            <div className="dashboard-info-heading">
              <p className="dashboard-name">
                <strong>{patient.first_name} {patient.last_name}</strong>
              </p>
              <span className="dashboard-badge">ID {patient.patient_id}</span>
            </div>
            <br></br>
            <dl className="dashboard-details">
              <div className="dashboard-detail-row">
                <dt>Age</dt>
                <dd>{calcAge(patient.dob)}</dd>
              </div>
              <div className="dashboard-detail-row">
                <dt>Date of birth</dt>
                <dd>{patient.dob || '—'}</dd>
              </div>
              <div className="dashboard-detail-row">
                <dt>Address</dt>
                <dd>{patient.address || '—'}</dd>
              </div>
              <div className="dashboard-detail-row">
                <dt>Telephone</dt>
                <dd>{patient.telephone || '—'}</dd>
              </div>
              <div className="dashboard-detail-row">
                <dt>Email</dt>
                <dd>{patient.email || '—'}</dd>
              </div>
              <div className="dashboard-detail-row">
                <dt>NIC</dt>
                <dd>{patient.nic || '—'}</dd>
              </div>
            </dl>
          </div>

          <div className="dashboard-actions">
            <button className="dashboard-btn" onClick={() => navigate(`${base}/prescription`)}>
              Prescription
            </button>
            <button
              className="dashboard-btn"
              onClick={() =>
                navigate(`${base}/feedback`, {
                  state: {
                    patient: {
                      patientId: patient.patient_id,
                      name: `${patient.first_name} ${patient.last_name}`,
                    },
                  },
                })
              }
            >
              Feedback
            </button>
            <button className="dashboard-btn" onClick={() => navigate(`${base}/surgical_procedure`)}>
              Surgical Procedure
            </button>
          </div>
        </article>
      )}
    </section>
  );
}

export default PatientDashboard;
