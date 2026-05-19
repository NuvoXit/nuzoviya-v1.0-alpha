import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./patient_dashboard.css";

function calcAge(dob) {
    if (!dob) return "—";
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
}

function PatientDashboard() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("http://127.0.0.1:5000/patient/all_patients")
            .then((r) => r.json())
            .then((data) => {
                const found = (Array.isArray(data) ? data : []).find((p) => p.NIC === id);
                setPatient(found ?? null);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [id]);

    const base = `/cosult_patient_list/${id}/dashboard`;

    return (
        <section className="dashboard-section">
            <div className="dashboard-header">
                <button className="dashboard-back-btn" onClick={() => navigate("/cosult_patient_list")}>
                    ← Back
                </button>
                <h2 className="dashboard-title">Patient Dashboard</h2>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : !patient ? (
                <p>Patient not found.</p>
            ) : (
                <div className="dashboard-card">
                    <div className="dashboard-info">
                        <p className="dashboard-name"><strong>{patient.NIC}</strong> &nbsp; {patient.first_name} {patient.last_name}</p>
                        <p>Age: {calcAge(patient.DOB)}</p>
                        <p>DOB: {patient.DOB}</p>
                        <p>Address: {patient.address}</p>
                        <p>Telephone: {patient.telephone}</p>
                        <p>Email: {patient.email}</p>
                    </div>
                </div>
            )}

            <div className="dashboard-actions">
                <button className="dashboard-btn" onClick={() => navigate(`${base}/prescription`)}>Prescription</button>
                <button className="dashboard-btn" onClick={() => navigate("/patient/all_patients/feedback", { state: { patient: { patientId: id, name: patient ? `${patient.first_name} ${patient.last_name}` : id } } })}>Feedback</button>
                <button className="dashboard-btn" onClick={() => navigate(`${base}/surgical_procedure`)}>Surgical Procedure</button>
            </div>
        </section>
    );
}

export default PatientDashboard;
