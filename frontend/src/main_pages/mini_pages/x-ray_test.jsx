import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./x-ray_test.css";

function extractXrayItems(record) {
  let types = [];
  let files = [];

  try {
    if (typeof record.xray_type === "string" && (record.xray_type.startsWith("[") || record.xray_type.startsWith("{"))) {
      types = JSON.parse(record.xray_type);
    } else if (record.xray_type) {
      types = [record.xray_type];
    }
  } catch {
    types = [record.xray_type];
  }

  try {
    if (typeof record.xray_result === "string" && (record.xray_result.startsWith("[") || record.xray_result.startsWith("{"))) {
      files = JSON.parse(record.xray_result);
    } else if (record.xray_result) {
      files = [record.xray_result];
    }
  } catch {
    files = [record.xray_result];
  }

  if (!Array.isArray(types)) types = [String(types || "")];
  if (!Array.isArray(files)) files = [String(files || "")];

  const maxLen = Math.max(types.length, files.length, 1);
  const items = [];
  for (let i = 0; i < maxLen; i++) {
    items.push({
      type: types[i] || types[0] || `X-Ray ${i + 1}`,
      file: files[i] || files[0] || null,
      index: i + 1,
    });
  }
  return items;
}

function XrayTest() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [xrayResults, setXrayResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalData, setModalData] = useState(null);

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
          setXrayResults(Array.isArray(xrayData) ? xrayData : []);
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

  const openModal = (type, file, date) => {
    setModalData({ type, file, date });
  };

  const closeModal = () => {
    setModalData(null);
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
      <div className="xray-test-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1 style={{ margin: 0 }}>X-Ray Results</h1>
        <button className="back-btn" onClick={() => window.history.back()} style={{ margin: 0 }}>
          ← Back
        </button>
      </div>

      {/* Patient Information Card */}
      <div className="xray-test-patient-card">
        <div className="xray-test-patient-avatar">
          {patient.first_name?.[0]}
          {patient.last_name?.[0]}
        </div>
        <div className="xray-test-patient-info">
          <h2>
            {patient.first_name} {patient.last_name}
          </h2>
          <div className="xray-test-patient-meta">
            <span className="xray-test-badge">ID: {patient.patient_id}</span>
            <span className="xray-test-badge">NIC: {patient.nic || "—"}</span>
            <span className="xray-test-badge">Tel: {patient.telephone}</span>
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
          xrayResults.map((result) => {
            const items = extractXrayItems(result);

            return (
              <div key={result.xray_id} className="xray-test-result-card">
                <div className="xray-test-result-header">
                  <div className="xray-test-result-title">
                    <span className="xray-test-result-icon">🩻</span>
                    <h3>X-Ray Examination Record #{result.xray_id}</h3>
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

                <div className="xray-examination-table-wrapper">
                  <table className="xray-examination-table">
                    <thead>
                      <tr>
                        <th style={{ width: "80px" }}>#</th>
                        <th>X-Ray Type Names</th>
                        <th>X-Ray Results</th>
                        <th style={{ width: "200px", textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, idx) => (
                        <tr key={idx}>
                          <td>
                            <span className="xray-item-tag">X-Ray {String(idx + 1).padStart(2, "0")}</span>
                          </td>
                          <td className="xray-type-name-cell">
                            <strong>{item.type}</strong>
                          </td>
                          <td className="xray-file-name-cell">
                            <span className="xray-file-badge">📄 {item.file || "No file"}</span>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            {item.file && (
                              <div className="xray-actions-inline">
                                <button
                                  type="button"
                                  className="xray-test-view-btn-sm"
                                  onClick={() => openModal(item.type, item.file, result.xray_date)}
                                >
                                  👁 View
                                </button>
                                <a
                                  href={getResultUrl(item.file)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="xray-test-download-btn-sm"
                                >
                                  ⬇ Download
                                </a>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Result Modal Overlay */}
      {modalData && (
        <div className="xray-test-modal-overlay" onClick={closeModal}>
          <div className="xray-test-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="xray-test-modal-header">
              <h2>{modalData.type}</h2>
              <span className="xray-test-modal-date">
                {modalData.date
                  ? new Date(modalData.date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "—"}
              </span>
              <button className="xray-test-modal-close" onClick={closeModal}>
                ✕
              </button>
            </div>

            <div className="xray-test-modal-body">
              {isPdf(modalData.file) ? (
                <iframe
                  src={getResultUrl(modalData.file)}
                  title={`X-Ray Result - ${modalData.type}`}
                  className="xray-test-modal-pdf"
                />
              ) : isImage(modalData.file) ? (
                <img
                  src={getResultUrl(modalData.file)}
                  alt={`X-Ray Result - ${modalData.type}`}
                  className="xray-test-modal-image"
                />
              ) : (
                <div className="xray-test-modal-fallback">
                  <p>This file type cannot be previewed inline.</p>
                  <a
                    href={getResultUrl(modalData.file)}
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
