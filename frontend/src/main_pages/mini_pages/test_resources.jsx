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

  // Radiologist form state — dynamic multi-item list
  const [xrayItems, setXrayItems] = useState([
    { id: 1, xrayType: '', xrayResult: null }
  ]);
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

        const normDigits = (p) => (p ? String(p).replace(/^(\+94|0094)\s*/, '0').replace(/\D/g, '') : '');
        const normName = (s) => (s || '').toString().toLowerCase().trim();

        const hasPayment = paymentsList.some((p) => {
          const phoneMatch = normDigits(p.telephone) && normDigits(patientData.telephone) && normDigits(p.telephone) === normDigits(patientData.telephone);
          const nameMatch =
            p.first_name &&
            patientData.first_name &&
            normName(p.first_name) === normName(patientData.first_name) &&
            normName(p.last_name) === normName(patientData.last_name);
          return phoneMatch || nameMatch;
        });

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

      const currentLab = JSON.parse(localStorage.getItem('completedDiagnosticPatients') || '[]');
      if (selected.patientId && !currentLab.includes(String(selected.patientId))) {
        currentLab.push(String(selected.patientId));
      }
      localStorage.setItem('completedDiagnosticPatients', JSON.stringify(currentLab));

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

  // Radiologist: Multi X-ray Handlers
  function handleAddXray() {
    setXrayItems((prev) => [
      ...prev,
      { id: Date.now(), xrayType: '', xrayResult: null },
    ]);
  }

  function handleRemoveXray(rowId) {
    if (xrayItems.length <= 1) return;
    setXrayItems((prev) => prev.filter((item) => item.id !== rowId));
  }

  function handleXrayItemChange(rowId, field, value) {
    setXrayItems((prev) =>
      prev.map((item) => {
        if (item.id === rowId) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  }

  // Radiologist: Submit X-ray records
  async function handleXraySubmit(e) {
    e.preventDefault();

    if (!xrayConfirmed) {
      alert('Please confirm the submission by checking the confirmation box.');
      return;
    }

    const invalid = xrayItems.some((item) => !item.xrayType.trim() || !item.xrayResult);
    if (invalid) {
      alert('Please provide both X-Ray Type and an uploaded file for every X-Ray row.');
      return;
    }

    const formData = new FormData();
    formData.append('patientId', selected.patientId);
    formData.append('patientFirstName', selected.firstName);
    formData.append('patientLastName', selected.lastName);

    xrayItems.forEach((item) => {
      formData.append('xrayTypes[]', item.xrayType.trim());
      formData.append('xrayResults[]', item.xrayResult);
    });

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

      const currentXray = JSON.parse(localStorage.getItem('completedDiagnosticPatients') || '[]');
      if (selected.patientId && !currentXray.includes(String(selected.patientId))) {
        currentXray.push(String(selected.patientId));
      }
      localStorage.setItem('completedDiagnosticPatients', JSON.stringify(currentXray));

      setXrayItems([{ id: 1, xrayType: '', xrayResult: null }]);
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
                    <input
                      type="text"
                      value={labForm.testName}
                      onChange={(e) =>
                        setLabForm({
                          ...labForm,
                          testName: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div>
                    <label>Test Result</label>
                    <input
                      type="file"
                      required
                      onChange={(e) =>
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
              Upload X-Ray Results
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
                  <div className="xray-multi-section">
                    <div className="xray-multi-header">
                      <div>
                        <label className="xray-multi-title">X-Ray Examination Details</label>
                        <p className="xray-multi-subtitle">Add multiple X-Ray types and report files for this patient</p>
                      </div>
                      <button
                        type="button"
                        className="add-xray-btn"
                        onClick={handleAddXray}
                      >
                        + Add X-Ray
                      </button>
                    </div>

                    <div className="xray-table-wrapper">
                      <table className="xray-dynamic-table">
                        <thead>
                          <tr>
                            <th style={{ width: '90px' }}>#</th>
                            <th>X-Ray Type Names</th>
                            <th>X-Ray Results</th>
                            <th style={{ width: '40px' }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {xrayItems.map((item, index) => (
                            <tr key={item.id} className="xray-table-row">
                              <td className="xray-row-index">
                                <span className="xray-index-badge">X-Ray {String(index + 1).padStart(2, '0')}</span>
                              </td>
                              <td className="xray-type-cell">
                                <input
                                  type="text"
                                  placeholder="e.g. Chest PA View, Spine Lateral"
                                  value={item.xrayType}
                                  onChange={(e) => handleXrayItemChange(item.id, 'xrayType', e.target.value)}
                                  required
                                />
                              </td>
                              <td className="xray-file-cell">
                                <input
                                  type="file"
                                  onChange={(e) => handleXrayItemChange(item.id, 'xrayResult', e.target.files[0])}
                                  required
                                />
                              </td>
                              <td className="xray-action-cell">
                                {xrayItems.length > 1 && (
                                  <button
                                    type="button"
                                    className="remove-xray-btn"
                                    title="Remove this X-Ray"
                                    onClick={() => handleRemoveXray(item.id)}
                                  >
                                    ✕
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="confirmation-check">
                    <label className="confirmation-label">
                      <input
                        type="checkbox"
                        checked={xrayConfirmed}
                        onChange={(e) => setXrayConfirmed(e.target.checked)}
                      />
                      <span>I confirm that all {xrayItems.length} X-ray detail(s) and uploaded file(s) are correct.</span>
                    </label>
                  </div>

                  <input type="submit" value={`Submit All X-Rays (${xrayItems.length})`} disabled={!xrayConfirmed} />
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
