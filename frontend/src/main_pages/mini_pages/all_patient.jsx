import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./all_patient.css";

const ALL_CHECKUPS = ["Blood Checkup", "Eye Checkup", "X-Ray Checkup", "Other"];

function calcAge(dob) {
    if (!dob) return "—";
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
}

function getNow() {
    return new Date().toLocaleString("en-US", {
        weekday: "short", year: "numeric", month: "short",
        day: "numeric", hour: "2-digit", minute: "2-digit",
    });
}

function AllPatient() {
    const [patients,       setPatients]       = useState([]);
    const [loading,        setLoading]        = useState(true);
    const [selected,       setSelected]       = useState(null);
    const [activeCheckups, setActiveCheckups] = useState([]);
    const navigate = useNavigate();

    const fetchPatients = () => {
        setLoading(true);
        fetch("http://127.0.0.1:5000/patient/all_patients")
            .then((res) => res.json())
            .then((data) => {
                const list = Array.isArray(data) ? data : [];
                const mapped = list.map((p) => ({
                    id:        p.NIC,
                    name:      `${p.firstName} ${p.lastName}`,
                    age:       calcAge(p.DOB),
                    telephone: p.telephone,
                    NIC:       p.NIC,
                }));
                setPatients(mapped);
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

    const handleSelectPatient = (p) => {
        setSelected(p);
        setActiveCheckups([]);
    };

    const toggleCheckup = (tag) => {
        if (!selected) return;
        setActiveCheckups((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    };

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
            if (selected?.NIC === nic) {
                setSelected(null);
                setActiveCheckups([]);
            }
            fetchPatients();
        } catch (error) {
            console.error("Error deleting patient:", error);
            alert("Could not delete patient.");
        }
    };

    const handleAction = (action) => {
        if (!selected) return;
        if (action === "Prescription")       navigate("/patient/all_patients/prescription");
        if (action === "Surgical Procedure") navigate("/cosult_patient_list/surgical_procedure");
        if (action === "Feedback")           navigate("/patient/all_patients/feedback", {
            state: { patient: { ...selected, checkups: activeCheckups } },
        });
    };

    return (
        <div className="all-patient-container">
            <div className="all-patient-header-row">
                <Link to="/patient" className="all-patient-back-btn">← Back</Link>
                <h2>All Patients</h2>
                <span className="all-patient-datetime">{getNow()}</span>
            </div>

            <div className="all-patient-layout">

                {/* ── Patient Table ── */}
                <div className="all-patient-table-wrap">
                    {loading ? (
                        <p>Loading...</p>
                    ) : patients.length === 0 ? (
                        <p>No patients found</p>
                    ) : (
                        <table className="patient_table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>NIC</th>
                                    <th>Age</th>
                                    <th>Telephone</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {patients.map((p, i) => (
                                    <tr
                                        key={p.NIC}
                                        className={selected?.NIC === p.NIC ? "all-patient-row--active" : ""}
                                        onClick={() => handleSelectPatient(p)}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <td>{String(i + 1).padStart(2, "0")}</td>
                                        <td>{p.name}</td>
                                        <td>{p.NIC}</td>
                                        <td>{p.age}</td>
                                        <td>{p.telephone}</td>
                                        <td onClick={(e) => e.stopPropagation()} style={{ display: "flex", gap: "8px" }}>
                                            <button className="btn-edit" onClick={() => alert("Edit not implemented yet.")}>Edit</button>
                                            <button className="btn-delete" onClick={() => deletePatient(p.NIC)}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* ── Consulting Panel ── */}
                <div className="all-patient-consulting-panel">
                    <div className="consulting-detail-card">
                        <div className="consulting-detail-info">
                            {selected ? (
                                <>
                                    <p className="consulting-detail-id-name">
                                        <strong>{selected.NIC}</strong>&nbsp;&nbsp;{selected.name}
                                    </p>
                                    <p className="consulting-detail-age">Age : {selected.age}</p>
                                </>
                            ) : (
                                <p className="consulting-detail-placeholder">Select a patient to view details</p>
                            )}
                        </div>

                        <div className="consulting-checkup-tags">
                            {ALL_CHECKUPS.map((tag) => (
                                <span
                                    key={tag}
                                    className={`consulting-tag${activeCheckups.includes(tag) ? " consulting-tag--active" : ""}${!selected ? " consulting-tag--disabled" : ""}`}
                                    onClick={() => toggleCheckup(tag)}
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="consulting-actions">
                        {["Prescription", "Feedback", "Surgical Procedure"].map((action) => (
                            <button
                                key={action}
                                className="consulting-action-btn"
                                disabled={!selected}
                                onClick={() => handleAction(action)}
                            >
                                {action}
                            </button>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}

export default AllPatient;
