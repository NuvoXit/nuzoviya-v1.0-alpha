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
  const role = localStorage.getItem('role');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  // MLT form state
  const [labForm, setLabForm] = useState({
    testName: '',
    testResult: null,
  });
  const [labConfirmed, setLabConfirmed] = useState(false);

  // Radiologist form state
  const [xrayForm, setXrayForm] = useState({
    xrayType: '',
    xrayResult: null,
  });
  const [xrayConfirmed, setXrayConfirmed] = useState(false);

  useEffect(() => {
    // Determine which payment endpoint and records endpoint to check based on role
    let paymentUrl = '';
    let recordsUrl = '';
    if (role === 'MLT') {
      paymentUrl = 'http://127.0.0.1:5000/payments/mlt';
      recordsUrl = `http://127.0.0.1:5000/lab_records/patient/${id}`;
    } else if (role === 'Radiologist') {
      paymentUrl = 'http://127.0.0.1:5000/payments/radiologist';
      recordsUrl = `http://127.0.0.1:5000/xray_records/patient/${id}`;
    }

    Promise.all([
      fetch(`http://127.0.0.1:5000/patient/${id}`).then((r) => r.json()),
      paymentUrl ? fetch(paymentUrl).then((r) => r.json()) : Promise.resolve([]),
      recordsUrl ? fetch(recordsUrl).then((r) => r.json()) : Promise.resolve([]),
    ])
      .then(([patientData, paymentsData, existingRecords]) => {
        const paymentsList = Array.isArray(paymentsData) ? paymentsData : [];
        const recordsList = Array.isArray(existingRecords) ? existingRecords : [];

        const hasPayment = paymentsList.some((p) => patientData.telephone && p.telephone === patientData.telephone);

        // Check if a record has already been submitted for this patient
        if (recordsList.length > 0) {
          setAlreadySubmitted(true);
        }

        if (patientData) {
          setSelected({
            patientId: patientData.patient_id,
            name: `${patientData.first_name} ${patientData.last_name}`,
            firstName: patientData.first_name,
            lastName: patientData.last_name,
            age: calcAge(patientData.dob),
            hasPayment,
          });
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id, role]);

  // MLT: Submit lab record
  async function handleLabSubmit(e) {
    e.preventDefault();

    if (!labConfirmed) {
      alert('Please confirm the submission by checking the confirmation box.');
      return;
    }

    if (!labForm.testName || !labForm.testResult) {
      alert('Please fill in all required fields.');
      return;
    }

    const formData = new FormData();
    formData.append('patientId', selected.patientId);
    formData.append('patientFirstName', selected.firstName);
    formData.append('patientLastName', selected.lastName);
    formData.append('testName', labForm.testName);
    formData.append('testResult', labForm.testResult);

    try {
      setLoading(true);

      const response = await fetch('http://127.0.0.1:5000/lab_records/add_lab_record', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      alert(data.message);
      setAlreadySubmitted(true);

      setLabForm({
        testName: '',
        testResult: null,
      });
      setLabConfirmed(false);

      e.target.reset();
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Radiologist: Submit X-ray record
  async function handleXraySubmit(e) {
    e.preventDefault();

    if (!xrayConfirmed) {
      alert('Please confirm the submission by checking the confirmation box.');
      return;
    }

    if (!xrayForm.xrayType || !xrayForm.xrayResult) {
      alert('Please fill in all required fields.');
      return;
    }

    const formData = new FormData();
    formData.append('patientId', selected.patientId);
    formData.append('patientFirstName', selected.firstName);
    formData.append('patientLastName', selected.lastName);
    formData.append('xrayType', xrayForm.xrayType);
    formData.append('xrayResult', xrayForm.xrayResult);

    try {
      setLoading(true);

      const response = await fetch('http://127.0.0.1:5000/xray_records/add_xray_record', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      alert(data.message);
      setAlreadySubmitted(true);

      setXrayForm({
        xrayType: '',
        xrayResult: null,
      });
      setXrayConfirmed(false);

      e.target.reset();
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {role === 'MLT' && (
        <section className="lab_resources_form">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 className="lab_resources_form_title" style={{ margin: 0 }}>
              Upload Lab Test Result
            </h2>
            <button className="back-btn" onClick={() => window.history.back()} style={{ margin: 0 }}>
              ← Back
            </button>
          </div>

          {loading ? (
            <p className="consulting-list-status">Loading...</p>
          ) : selected ? (
            <>
              <div className="consulting-list-header">
                <h3>Patient: {selected.name}</h3>
                <h3>Age: {selected.age}</h3>
              </div>

              {alreadySubmitted ? (
                <div className="already-submitted-notice">
                  <span className="already-submitted-icon">✅</span>
                  <h3>Lab Test Already Submitted</h3>
                  <p>A lab test result has already been uploaded for this patient. Only one submission per payment is allowed.</p>
                </div>
              ) : (
                <form onSubmit={handleLabSubmit} encType="multipart/form-data" className="lab_resources_form_fields">
                  <div>
                    <label>Test Name</label>
                    <input type="text" value={labForm.testName} onChange={(e) =>
                        setLabForm({
                          ...labForm,
                          testName: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label>Test Result</label>
                    <input type="file" onChange={(e) =>
                        setLabForm({
                          ...labForm,
                          testResult: e.target.files[0],
                        })
                      }
                    />
                  </div>

                  <div className="confirmation-check">
                    <label className="confirmation-label">
                      <input
                        type="checkbox"
                        checked={labConfirmed}
                        onChange={(e) => setLabConfirmed(e.target.checked)}
                      />
                      <span>I confirm that the test details and uploaded file are correct.</span>
                    </label>
                  </div>

                  <input type="submit" value="Submit" disabled={!labConfirmed} />
                </form>
              )}
            </>
          ) : (
            <p className="consulting-list-status">Patient not found.</p>
          )}
        </section>
      )}

      {role === 'Radiologist' && (
        <section className="lab_resources_form">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 className="lab_resources_form_title" style={{ margin: 0 }}>
              Upload X-Ray Result
            </h2>
            <button className="back-btn" onClick={() => window.history.back()} style={{ margin: 0 }}>
              ← Back
            </button>
          </div>

          {loading ? (
            <p className="consulting-list-status">Loading...</p>
          ) : selected ? (
            <>
              <div className="consulting-list-header">
                <h3>Patient: {selected.name}</h3>
                <h3>Age: {selected.age}</h3>
              </div>

              {alreadySubmitted ? (
                <div className="already-submitted-notice">
                  <span className="already-submitted-icon">✅</span>
                  <h3>X-Ray Already Submitted</h3>
                  <p>An X-ray result has already been uploaded for this patient. Only one submission per payment is allowed.</p>
                </div>
              ) : (
                <form onSubmit={handleXraySubmit} encType="multipart/form-data" className="lab_resources_form_fields">
                  <div>
                    <label>X-Ray Type</label>
                    <input type="text" value={xrayForm.xrayType} onChange={(e) =>
                        setXrayForm({
                          ...xrayForm,
                          xrayType: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label>X-Ray Result</label>
                    <input type="file" onChange={(e) =>
                        setXrayForm({
                          ...xrayForm,
                          xrayResult: e.target.files[0],
                        })
                      }
                    />
                  </div>

                  <div className="confirmation-check">
                    <label className="confirmation-label">
                      <input
                        type="checkbox"
                        checked={xrayConfirmed}
                        onChange={(e) => setXrayConfirmed(e.target.checked)}
                      />
                      <span>I confirm that the X-ray details and uploaded file are correct.</span>
                    </label>
                  </div>

                  <input type="submit" value="Submit" disabled={!xrayConfirmed} />
                </form>
              )}
            </>
          ) : (
            <p className="consulting-list-status">Patient not found.</p>
          )}
        </section>
      )}
    </>
  );
}

export default Test_Resources;
