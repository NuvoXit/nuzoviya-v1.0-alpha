import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./all_patient.css";

function AllPatient() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPatients = () => {
    setLoading(true);
    fetch("http://127.0.0.1:5000/patient/all_patients")
      .then((res) => res.json())
      .then((data) => {
        setPatients(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching patients:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const deletePatient = async (nic) => {
    if (!window.confirm("Delete this patient?")) return;
    try {
      const res = await fetch(`http://127.0.0.1:5000/patient/delete/${nic}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Could not delete patient.");
        return;
      }
      fetchPatients();
    } catch (error) {
      console.error("Error deleting patient:", error);
      alert("Could not delete patient.");
    }
  };

  return (
    <div className="all-patient-container" style={{ padding: "20px" }}>
      <Link to="/patient" className="all-patient-back-btn" style={{ display: "inline-block", marginBottom: "16px" }}>
        ← Back
      </Link>
      <h2>All Patients</h2>

      {loading ? (
        <p>Loading...</p>
      ) : patients.length === 0 ? (
        <p>No patients found</p>
      ) : (
        <table className="patient_table" border="1" cellPadding="10" style={{ width: "100%", marginTop: "12px" }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>NIC</th>
              <th>Telephone</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p.NIC}>
                <td>{p.firstName} {p.lastName}</td>
                <td>{p.NIC}</td>
                <td>{p.telephone}</td>
                <td>
                  <button onClick={() => alert("Edit not implemented yet.")}>Edit</button>
                  <button
                    onClick={() => deletePatient(p.NIC)} 
                    style={{ marginLeft: "10px", color: "red" }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AllPatient;
