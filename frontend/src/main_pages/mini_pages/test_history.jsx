import React, { useState, useEffect } from "react";
import "./test_history.css";

function Test_History() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem("role");

  useEffect(() => {
    let fetchUrl = "";
    if (role === "MLT") {
      fetchUrl = "http://127.0.0.1:5000/lab_records/all_lab_records";
    } else if (role === "Radiologist") {
      fetchUrl = "http://127.0.0.1:5000/xray_records/all_xray_records";
    } else {
      setLoading(false);
      return;
    }

    fetch(fetchUrl)
      .then((res) => res.json())
      .then((data) => {
        setRecords(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching records:", error);
        setLoading(false);
      });
  }, [role]);

  return (
    <div className="test-history-container">
      <h1>Test History</h1>
      <p>This is the history page.</p>

      {loading ? (
        <p className="loading-message">Loading...</p>
      ) : records.length === 0 ? (
        <p className="empty-message">No records found.</p>
      ) : (
        <table className="records_table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Date</th>
              <th>{role === "MLT" ? "Test Name" : "X-Ray Type"}</th>
              <th>Report File</th>
            </tr>
          </thead>

          <tbody>
            {records.map((r) => {
              const id = role === "MLT" ? r.test_id : r.xray_id;
              const date = role === "MLT" ? r.test_date : r.xray_date;
              const type = role === "MLT" ? r.test_name : r.xray_type;
              const resultFile = role === "MLT" ? r.result : r.xray_result;

              return (
                <tr key={id}>
                  <td>{id}</td>
                  <td>
                    {r.patient_first_name} {r.patient_last_name}
                  </td>
                  <td>{date}</td>
                  <td>{type}</td>
                  <td>
                    <a
                      href={`http://127.0.0.1:5000/${role === "MLT" ? "lab_reports" : "xray_reports"}/${resultFile}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="download-link"
                    >
                      {resultFile}
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Test_History;