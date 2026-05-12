import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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

  const deletePatient = async (id) => {
    if (!window.confirm("Delete this patient?")) return;
    try {
      const res = await fetch(`http://127.0.0.1:5000/patient/delete/${id}`, {
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
    <div style={{ padding: "20px" }}>
      <Link to="/patient" style={{ display: "inline-block", marginBottom: "16px" }}>
        ← Back
      </Link>
      <h2>All Patients</h2>

      {loading ? (
        <p>Loading...</p>
      ) : patients.length === 0 ? (
        <p>No patients found</p>
      ) : (
        <table border="1" cellPadding="10" style={{ width: "100%", marginTop: "12px" }}>
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
              <tr key={p.id}>
                <td>{p.first_name} {p.last_name}</td>  {/* fixed: was firstName lastName */}
                <td>{p.NIC}</td>
                <td>{p.Tel_no}</td>                     {/* fixed: was telephone */}
                <td>
                  <button onClick={() => alert("Edit not implemented yet.")}>Edit</button>
                  <button
                    onClick={() => deletePatient(p.id)} 
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
