import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './test_resources.css';

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

function Test_Resources() {
  const { id } = useParams();
  const [form, setForm] = useState({
    testName: '',
    testResult: '',
  });

  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch(`http://127.0.0.1:5000/patient/${id}`).then((r) => r.json()),
      fetch('http://127.0.0.1:5000/payments/mlt').then((r) => r.json())
    ])
      .then(([patientData, paymentsData]) => {
        // Check if patient has paid for MLT
        const paymentsList = Array.isArray(paymentsData) ? paymentsData : [];
        const hasMLTPayment = paymentsList.some(p => p.patient_id === parseInt(id) || (patientData.telephone && p.telephone === patientData.telephone));
        
        if (patientData) {
          setSelected({
            patientId: patientData.patient_id,
            name: `${patientData.first_name} ${patientData.last_name}`,
            age: calcAge(patientData.dob),
            hasMLTPayment: hasMLTPayment
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load data:', err);
        setLoading(false);
      });
  }, [id]);

  return (
    <section className="lab_resources_form">
      <h2 className="lab_resources_form_title">Upload Test Result</h2>
      {loading ? (
        <p className="consulting-list-status">Loading...</p>
      ) : selected ? (
        <>
          <div className="consulting-list-header">
            <h3 className="consulting-list-title">Patient: {selected?.name || 'N/A'}</h3>
            <h3 className="consulting-list-title">Age: {selected?.age || 'N/A'}</h3>
          </div>
          <form method="post" action="http://127.0.0.1:5000/MLT_Records" encType="multipart/form-data">
            <fieldset></fieldset>
            <div className="lab_resources_form_fields">
              <input type="hidden" name="patientId" value={selected?.patientId || ''} />
              <label> Test Name: </label>
              <input type="text" name="testName" value={form.testName} onChange={(e) => setForm({ ...form, testName: e.target.value })} />
              <br></br><br></br>
              <label> Test Result: </label>
              <input type="file" name="testResult" onChange={(e) => setForm({ ...form, testResult: e.target.files[0] })} /><br></br><br></br>
              <input type="submit" value="Submit" />
            </div>
          </form>
        </>
      ) : (
        <p className="consulting-list-status">Patient not found.</p>
      )}
    </section>
  );
}

export default Test_Resources;
