import { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./feedback.css";

function getNow() {
    return new Date().toLocaleString("en-US", {
        weekday: "short", year: "numeric", month: "short",
        day: "numeric", hour: "2-digit", minute: "2-digit",
    });
}

function Feedback() {
    const location  = useLocation();
    const navigate  = useNavigate();
    const patient   = location.state?.patient ?? { id: "01", name: "Patient Name" };

    const [subject,     setSubject]     = useState("");
    const [description, setDescription] = useState("");
    const [stampFile,   setStampFile]   = useState(null);
    const [stampPreview,setStampPreview]= useState(null);
    const [sent,        setSent]        = useState(false);

    const fileRef = useRef();

    const handleStamp = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setStampFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => setStampPreview(ev.target.result);
        reader.readAsDataURL(file);
    };

    const handleSend = () => {
        if (!subject.trim() || !description.trim()) return;
        setSent(true);
        setTimeout(() => {
            setSent(false);
            setSubject("");
            setDescription("");
            setStampFile(null);
            setStampPreview(null);
            navigate("/cosult_patient_list");
        }, 1800);
    };

    return (
        <section className="feedback-section">
            <h1 className="feedback-page-title">Feedback</h1>

            <div className="feedback-card">
                {/* ── Header ── */}
                <div className="feedback-card-header">
                    <span className="feedback-recipient">
                        Feedback to&nbsp;<strong>{patient.name}</strong>
                    </span>
                    <span className="feedback-datetime">{getNow()}</span>
                </div>

                {/* ── Body ── */}
                <div className="feedback-card-body">
                    <input
                        className="feedback-input feedback-subject"
                        type="text"
                        placeholder="Subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                    />

                    <textarea
                        className="feedback-input feedback-description"
                        placeholder="Describe about it……………………………"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={5}
                    />

                    {/* ── Footer row: stamp + send ── */}
                    <div className="feedback-footer">
                        <button
                            className={`feedback-stamp-btn${stampPreview ? " feedback-stamp-btn--filled" : ""}`}
                            onClick={() => fileRef.current.click()}
                            title="Attach stamp image"
                        >
                            {stampPreview
                                ? <img src={stampPreview} alt="stamp" className="feedback-stamp-preview" />
                                : <span># Stamp Image</span>
                            }
                        </button>
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={handleStamp}
                        />

                        <button
                            className={`feedback-send-btn${sent ? " feedback-send-btn--sent" : ""}`}
                            onClick={handleSend}
                            disabled={sent}
                        >
                            {sent ? "Sent ✓" : "Send"}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Feedback;
