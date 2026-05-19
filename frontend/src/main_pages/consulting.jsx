import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./consulting.css";

<<<<<<< HEAD
function Consulting() {
=======
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

function Consulting() {
    const navigate = useNavigate();
    const [bookings,       setBookings]       = useState([]);
    const [loading,        setLoading]        = useState(true);
    const [selected,       setSelected]       = useState(null);
    const [activeCheckups, setActiveCheckups] = useState([]);

    useEffect(() => {
        // Fetch both in parallel, then join on NIC
        Promise.all([
            fetch("http://127.0.0.1:5000/booking/all_bookings").then((r) => r.json()),
            fetch("http://127.0.0.1:5000/patient/all_patients").then((r) => r.json()),
        ])
            .then(([bookingsData, patientsData]) => {
                const patientMap = {};
                (Array.isArray(patientsData) ? patientsData : []).forEach((p) => {
                    patientMap[p.NIC] = p;
                });

                const enriched = (Array.isArray(bookingsData) ? bookingsData : []).map((b) => {
                    const patient = patientMap[b.patientNIC];
                    return {
                        bookingId: b.id,
                        patientId: b.patientNIC,
                        name:      `${b.firstName} ${b.lastName}`,
                        age:       patient ? calcAge(patient.DOB) : "—",
                    };
                });

                setBookings(enriched);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Failed to load data:", err);
                setLoading(false);
            });
    }, []);

    const handleSelect = (b) => {
        setSelected(b);
        setActiveCheckups([]);
    };

    const toggleCheckup = (tag) => {
        if (!selected) return;
        setActiveCheckups((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    };

    const handleAction = (action) => {
        if (!selected) return;
        const base = `/cosult_patient_list/${selected.patientId}/dashboard`;
        if (action === "Prescription")       navigate(`${base}/prescription`);
        if (action === "Surgical Procedure") navigate(`${base}/surgical_procedure`);
        if (action === "Feedback")           navigate("/patient/all_patients/feedback", {
            state: { patient: { ...selected, checkups: activeCheckups } },
        });
    };
>>>>>>> e4c245be8c162f2728500f8fb181d4c3ec5796a3

    return (
        <section className="consulting-section">

            <div className="consulting-list-card">
                <div className="consulting-list-header">
                    <div className="consulting-list-title">
                        Today Patients <span className="consulting-filter-icon">▽</span>
                    </div>
                    <span className="consulting-datetime">{getNow()}</span>
                </div>

                <div className="consulting-list-body">
                    {loading ? (
                        <p style={{ padding: "12px 16px", color: "#888" }}>Loading...</p>
                    ) : bookings.length === 0 ? (
                        <p style={{ padding: "12px 16px", color: "#888" }}>No bookings found</p>
                    ) : (
                        bookings.map((b, i) => (
                            <div
                                key={b.bookingId}
                                className={`consulting-list-row${selected?.bookingId === b.bookingId ? " consulting-list-row--active" : ""}`}
                                onClick={() => handleSelect(b)}
                            >
                                <span className="consulting-list-num">{String(i + 1).padStart(2, "0")}</span>
                                <span className="consulting-list-id">{b.patientId}</span>
                                <span className="consulting-list-name">{b.name}</span>
                                <span className="consulting-list-age">Age: {b.age}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="consulting-detail-wrap">
                <div className="consulting-detail-card">
                    <div className="consulting-detail-info">
                        {selected ? (
                            <>
                                <p className="consulting-detail-id-name">
                                    <strong>{selected.patientId}</strong>&nbsp;&nbsp;{selected.name}
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

        </section>
    );
}

<<<<<<< HEAD
export default Consulting;
=======
export default Consulting;
>>>>>>> e4c245be8c162f2728500f8fb181d4c3ec5796a3
