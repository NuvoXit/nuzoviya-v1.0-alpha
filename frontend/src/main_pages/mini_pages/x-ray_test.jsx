import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./x-ray_test.css";

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

function XrayTest() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [xrayResults, setXrayResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalResult, setModalResult] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientResponse, xrayResponse] = await Promise.all([
          fetch(`http://127.0.0.1:5000/patient/${id}`),
          fetch(`http://127.0.0.1:5000/xray_records/patient/${id}`),
        ]);

        if (patientResponse.ok) {
          const patientData = await patientResponse.json();
          setPatient(patientData);
        }

        if (xrayResponse.ok) {
          const xrayData = await xrayResponse.json();
          setXrayResults(xrayData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const getResultUrl = (resultPath) => {
    if (!resultPath) return null;
    return `http://127.0.0.1:5000/xray_reports/${resultPath}`;
  };

  const isImage = (filename) => {
    if (!filename) return false;
    const ext = filename.split(".").pop().toLowerCase();
    return ["png", "jpg", "jpeg", "gif", "webp", "bmp"].includes(ext);
  };

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
      <section className="xray-test-page">
        <div className="xray-test-loading">
          <div className="xray-test-spinner"></div>
          <p>Loading X-ray results...</p>
        </div>
      </section>
    );
  }

  if (!patient) {
    return (
      <section className="xray-test-page">
        <div className="xray-test-empty">
          <p>Patient not found.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="xray-test-page">
      <div className="xray-test-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>X-Ray Results</h1>
        <button className="back-btn" onClick={() => window.history.back()} style={{ margin: 0 }}>
          ← Back
        </button>
      </div>

      {/* Patient Info Card */}
      <div className="xray-test-patient-card">
        <div className="xray-test-patient-avatar">
          {patient.first_name?.charAt(0)}
          {patient.last_name?.charAt(0)}
        </div>
        <div className="xray-test-patient-info">
          <h2>
            {patient.first_name} {patient.last_name}
          </h2>
          <div className="xray-test-patient-meta">
            <span className="xray-test-badge">ID: {patient.patient_id}</span>
            <span className="xray-test-badge">
              Age: {calcAge(patient.dob)}
            </span>
            {patient.telephone && (
              <span className="xray-test-badge">Tel: {patient.telephone}</span>
            )}
          </div>
        </div>
      </div>

      {/* X-Ray Results List */}
      <div className="xray-test-results-container">
        {xrayResults.length === 0 ? (
          <div className="xray-test-empty">
            <p>No X-ray results available for this patient.</p>
          </div>
        ) : (
          xrayResults.map((result) => (
            <div key={result.xray_id} className="xray-test-result-card">
              <div className="xray-test-result-header">
                <div className="xray-test-result-title">
                  <span className="xray-test-result-icon">🩻</span>
                  <h3>{result.xray_type}</h3>
                </div>
                <span className="xray-test-result-date">
                  {result.xray_date
                    ? new Date(result.xray_date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </span>
              </div>

              <div className="xray-test-result-body">
                <div className="xray-test-result-detail">
                  <span className="xray-test-detail-label">X-Ray ID</span>
                  <span className="xray-test-detail-value">
                    #{result.xray_id}
                  </span>
                </div>
                <div className="xray-test-result-detail">
                  <span className="xray-test-detail-label">X-Ray Type</span>
                  <span className="xray-test-detail-value">
                    {result.xray_type}
                  </span>
                </div>
                <div className="xray-test-result-detail">
                  <span className="xray-test-detail-label">Date</span>
                  <span className="xray-test-detail-value">
                    {result.xray_date || "—"}
                  </span>
                </div>
              </div>

              {result.xray_result && (
                <div className="xray-test-result-actions">
                  <button
                    className="xray-test-view-btn"
                    onClick={() => openModal(result)}
                  >
                    📄 View Result
                  </button>
                  <a
                    href={getResultUrl(result.xray_result)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="xray-test-download-btn"
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
        <div className="xray-test-modal-overlay" onClick={closeModal}>
          <div
            className="xray-test-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="xray-test-modal-header">
              <h2>{modalResult.xray_type}</h2>
              <span className="xray-test-modal-date">
                {modalResult.xray_date
                  ? new Date(modalResult.xray_date).toLocaleDateString(
                      "en-GB",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }
                    )
                  : "—"}
              </span>
              <button className="xray-test-modal-close" onClick={closeModal}>
                ✕
              </button>
            </div>

            <div className="xray-test-modal-body">
              {isPdf(modalResult.xray_result) ? (
                <iframe
                  src={getResultUrl(modalResult.xray_result)}
                  title={`X-Ray Result - ${modalResult.xray_type}`}
                  className="xray-test-modal-pdf"
                />
              ) : isImage(modalResult.xray_result) ? (
                <img
                  src={getResultUrl(modalResult.xray_result)}
                  alt={`X-Ray Result - ${modalResult.xray_type}`}
                  className="xray-test-modal-image"
                />
              ) : (
                <div className="xray-test-modal-fallback">
                  <p>This file type cannot be previewed inline.</p>
                  <a
                    href={getResultUrl(modalResult.xray_result)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="xray-test-download-btn"
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

export default XrayTest;
