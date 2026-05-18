import { useParams, useNavigate } from "react-router-dom";

function SurgicalProcedure() {
    const { id } = useParams();
    const navigate = useNavigate();

    return (
        <section style={{ padding: "20px" }}>
            <button
                onClick={() => navigate(`/cosult_patient_list/${id}/dashboard`)}
                style={{ padding: "8px 14px", background: "#555", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer", marginBottom: "20px" }}
            >
                ← Back
            </button>
            <h2>Surgical Procedure</h2>
            <p style={{ color: "#888" }}>Patient ID: <strong>{id}</strong></p>
            <p style={{ color: "#aaa", marginTop: "40px" }}>Surgical procedure details coming soon.</p>
        </section>
    );
}

export default SurgicalProcedure;
