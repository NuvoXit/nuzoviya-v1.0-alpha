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

  // MODIFIED:
  // Changed from patients array to single patient object
  // because dashboard displays only one selected patient.
  const [patient, setPatient] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/patient/all_patients')
      .then((res) => res.json())

      .then((data) => {
        // MODIFIED:
        // Before: searched using NIC
        // Now: searches using patient_id because Consulting.jsx
        // sends patient_id in the URL.
        const found = Array.isArray(data) ? data.find((p) => String(p.patient_id) === String(id)) : null;

        // MODIFIED:
        // Store one patient instead of [patient]
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

        <h2 className="dashboard-title">Patient Dashboard</h2>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : !patient ? (
        <p>Patient not found.</p>
      ) : (
        <div className="dashboard-card">
          <div className="dashboard-info">
            <p className="dashboard-name">
              <strong>{patient.patient_id}</strong>
              &nbsp;
              {patient.first_name} {patient.last_name}
            </p>

            <p>Age: {calcAge(patient.dob)}</p>

            <p>DOB: {patient.dob}</p>

            <p>Address: {patient.address}</p>

            <p>Telephone: {patient.telephone}</p>

            <p>Email: {patient.email}</p>

            <p>NIC: {patient.nic}</p>
          </div>
        </div>
      )}

      <div className="dashboard-actions">
        <button className="dashboard-btn" onClick={() => navigate(`${base}/prescription`)}>
          Prescription
        </button>

        <button
          className="dashboard-btn"
          onClick={() =>
            navigate(`${base}/feedback`, {
              state: {
                // MODIFIED:
                // Sends real patient information
                // instead of using URL id only.
                patient: {
                  patientId: patient?.patient_id,

                  name: patient ? `${patient.first_name} ${patient.last_name}` : '',
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
    </section>
  );
}

export default PatientDashboard;
