import { useState, useEffect } from 'react';
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

function getNow() {
  return new Date().toLocaleString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function Testing_Patient() {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    // Determine which payment endpoint to fetch based on role
    let paymentUrl = '';
    if (role === 'MLT') {
      paymentUrl = 'http://127.0.0.1:5000/payments/mlt';
    } else if (role === 'Radiologist') {
      paymentUrl = 'http://127.0.0.1:5000/payments/radiologist';
    } else {
      setLoading(false);
      return;
    }

    Promise.all([
      fetch(paymentUrl).then((r) => r.json()),
      fetch('http://127.0.0.1:5000/patient/all_patients').then((r) => r.json()),
    ])
      .then(([paymentsData, patientsData]) => {
        const patientsList = Array.isArray(patientsData) ? patientsData : [];
        const paymentsList = Array.isArray(paymentsData) ? paymentsData : [];

        // Create patient map using telephone
        const patientMap = {};
        patientsList.forEach((patient) => {
          if (patient?.telephone) {
            patientMap[patient.telephone] = patient;
          }
        });

        // Merge payment + patient data
        const enriched = paymentsList.map((payment) => {
          const patient = patientMap[payment.telephone];

          return {
            paymentId: payment.payment_id,
            patientId: patient?.patient_id ?? '',
            patientTelephone: payment.telephone,
            name: patient ? `${patient.first_name} ${patient.last_name}` : `${payment.first_name || ''} ${payment.last_name || ''}`,
            age: patient ? calcAge(patient.dob) : '—',
          };
        });

        setPayments(enriched);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load data:', err);
        setLoading(false);
      });
  }, [role]);

  const handleSelect = (pa) => {
    setSelected(pa);
    if (pa.patientId) {
      navigate(`/diagnostic_services_patient_list/${pa.patientId}/test_files`);
    }
  };

  return (
    <section className="consulting-section">
      <div className="consulting-list-card">
        <div className="consulting-list-header">
          <div className="consulting-list-title">
            Today Patients
            <span className="consulting-filter-icon">▽</span>
          </div>

          <span className="consulting-datetime">{getNow()}</span>
        </div>

        <div className="consulting-list-body">
          {loading ? (
            <p style={{ padding: '12px 16px', color: '#888' }}>Loading...</p>
          ) : payments.length === 0 ? (
            <p style={{ padding: '12px 16px', color: '#888' }}>No patients on list</p>
          ) : (
            <>
              <div className="consulting-list-row consulting-list-row--header">
                <span className="consulting-list-num">#</span>
                <span className="consulting-list-id">Phone</span>
                <span className="consulting-list-name">Patient Name</span>
                <span className="consulting-list-age">Age</span>
              </div>
              {payments.map((pa, i) => (
                <div
                  key={pa.paymentId}
                  className={`consulting-list-row ${selected?.paymentId === pa.paymentId ? 'consulting-list-row--active' : ''}`}
                  onClick={() => handleSelect(pa)}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="consulting-list-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="consulting-list-id">{pa.patientTelephone}</span>
                  <span className="consulting-list-name">{pa.name}</span>
                  <span className="consulting-list-age">{pa.age}</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default Testing_Patient;
