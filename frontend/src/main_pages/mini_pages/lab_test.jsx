import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./lab_test.css";

function calcAge(dob) {
  if (!dob) return "—";
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function LabTest() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [labResults, setLabResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalResult, setModalResult] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientResponse, labResponse] = await Promise.all([
          fetch(`http://127.0.0.1:5000/patient/${id}`),
          fetch(`http://127.0.0.1:5000/lab_records/patient/${id}`),
        ]);

        if (patientResponse.ok) {
          const patientData = await patientResponse.json();
          setPatient(patientData);
        }

        if (labResponse.ok) {
          const labData = await labResponse.json();
          setLabResults(labData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Build the correct URL for lab report files
  const getResultUrl = (resultPath) => {
    if (!resultPath) return null;
    // The result field may be just a filename or "lab_reports/filename"
    return `http://127.0.0.1:5000/lab_reports/${resultPath}`;
  };

  // Determine if the result file is an image
  const isImage = (filename) => {
    if (!filename) return false;
    const ext = filename.split(".").pop().toLowerCase();
    return ["png", "jpg", "jpeg", "gif", "webp", "bmp"].includes(ext);
  };

  // Determine if the result file is a PDF
  const isPdf = (filename) => {
    if (!filename) return false;
    return filename.split(".").pop().toLowerCase() === "pdf";
  };

  const openModal = (result) => {
    setModalResult(result);
  };

  const closeModal = () => {
    setModalResult(null);
  };

  if (loading) {
    return (
      <section className="lab-test-page">
        <div className="lab-test-loading">
          <div className="lab-test-spinner"></div>
          <p>Loading lab results...</p>
        </div>
      </section>
    );
  }

  if (!patient) {
    return (
      <section className="lab-test-page">
        <div className="lab-test-empty">
          <p>Patient not found.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="lab-test-page">
      <div className="lab-test-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>Lab Test Results</h1>
        <button className="back-btn" onClick={() => window.history.back()} style={{ margin: 0 }}>
          ← Back
        </button>
      </div>

      {/* Patient Info Card */}
      <div className="lab-test-patient-card">
        <div className="lab-test-patient-avatar">
          {patient.first_name?.charAt(0)}
          {patient.last_name?.charAt(0)}
        </div>
        <div className="lab-test-patient-info">
          <h2>
            {patient.first_name} {patient.last_name}
          </h2>
          <div className="lab-test-patient-meta">
            <span className="lab-test-badge">ID: {patient.patient_id}</span>
            <span className="lab-test-badge">
              Age: {calcAge(patient.dob)}
            </span>
            {patient.telephone && (
              <span className="lab-test-badge">Tel: {patient.telephone}</span>
            )}
          </div>
        </div>
      </div>

      {/* Lab Results List */}
      <div className="lab-test-results-container">
        {labResults.length === 0 ? (
          <div className="lab-test-empty">
            <p>No lab results available for this patient.</p>
          </div>
        ) : (
          labResults.map((result) => (
            <div key={result.test_id} className="lab-test-result-card">
              <div className="lab-test-result-header">
                <div className="lab-test-result-title">
                  <span className="lab-test-result-icon">🧪</span>
                  <h3>{result.test_name}</h3>
                </div>
                <span className="lab-test-result-date">
                  {result.test_date
                    ? new Date(result.test_date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </span>
              </div>

              <div className="lab-test-result-body">
                <div className="lab-test-result-detail">
                  <span className="lab-test-detail-label">Test ID</span>
                  <span className="lab-test-detail-value">
                    #{result.test_id}
                  </span>
                </div>
                <div className="lab-test-result-detail">
                  <span className="lab-test-detail-label">Test Name</span>
                  <span className="lab-test-detail-value">
                    {result.test_name}
                  </span>
                </div>
                <div className="lab-test-result-detail">
                  <span className="lab-test-detail-label">Test Date</span>
                  <span className="lab-test-detail-value">
                    {result.test_date || "—"}
                  </span>
                </div>
              </div>

              {result.result && (
                <div className="lab-test-result-actions">
                  <button
                    className="lab-test-view-btn"
                    onClick={() => openModal(result)}
                  >
                    📄 View Result
                  </button>
                  <a
                    href={getResultUrl(result.result)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lab-test-download-btn"
                  >
                    ⬇ Download
                  </a>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Result Modal Overlay */}
      {modalResult && (
        <div className="lab-test-modal-overlay" onClick={closeModal}>
          <div
            className="lab-test-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="lab-test-modal-header">
              <h2>{modalResult.test_name}</h2>
              <span className="lab-test-modal-date">
                {modalResult.test_date
                  ? new Date(modalResult.test_date).toLocaleDateString(
                      "en-GB",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }
                    )
                  : "—"}
              </span>
              <button className="lab-test-modal-close" onClick={closeModal}>
                ✕
              </button>
            </div>

            <div className="lab-test-modal-body">
              {isPdf(modalResult.result) ? (
                <iframe
                  src={getResultUrl(modalResult.result)}
                  title={`Lab Result - ${modalResult.test_name}`}
                  className="lab-test-modal-pdf"
                />
              ) : isImage(modalResult.result) ? (
                <img
                  src={getResultUrl(modalResult.result)}
                  alt={`Lab Result - ${modalResult.test_name}`}
                  className="lab-test-modal-image"
                />
              ) : (
                <div className="lab-test-modal-fallback">
                  <p>This file type cannot be previewed inline.</p>
                  <a
                    href={getResultUrl(modalResult.result)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lab-test-download-btn"
                  >
                    ⬇ Download File
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default LabTest;