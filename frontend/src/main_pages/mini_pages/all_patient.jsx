import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./all_patient.css";

function calcAge(dob) {
    if (!dob) return "—";
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
}

function AllPatient() {
    const [patients, setPatients] = useState([]);
    const [loading,  setLoading]  = useState(true);

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

    useEffect(() => { fetchPatients(); }, []);



    // Delete function with confirmation and error handling
    const deletePatients = async (patient_id) => {
        if (!window.confirm("Delete this patient?")) return;
        try {
            const res = await fetch(`http://127.0.0.1:5000/patient/delete/${patient_id}`,{method: "DELETE"});
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
        <div className="all-patient-container" >
            <div className="all-patient-header-row">
                <Link to="/patient" className="all-patient-back-btn">← Back</Link>
            </div>
            <h2>All Patients</h2>

            {loading ? (<p>Loading...</p>) : patients.length === 0 ? (<p>No patients found</p>) : (
                <table className="patient_table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>NIC</th>
                            <th>Age</th>
                            <th>Telephone</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {patients.map((p) => (
                            <tr key={p.id}>
                                <td>{p.patient_id}</td>
                                <td>{p.first_name} {p.last_name}</td>
                                <td>{p.nic || "—"}</td>
                                <td>{calcAge(p.dob)}</td>
                                <td>{p.telephone}</td>
                                <td style={{ display: "flex", gap: "8px" }}>
                                    <button className="btn-edit" onClick={() => alert("Edit not implemented yet.")}>Edit</button>
                                    <button className="btn-delete" onClick={() => deletePatients(p.patient_id)}>Delete</button>
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
