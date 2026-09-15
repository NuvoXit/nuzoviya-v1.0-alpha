import { useState, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "./feedback.css";

function getNow() {
    return new Date().toLocaleString("en-US", {
        weekday: "short", year: "numeric", month: "short",
        day: "numeric", hour: "2-digit", minute: "2-digit",
    });
}

function Feedback() {
    const { id } = useParams();
    const location  = useLocation();
    const navigate  = useNavigate();
    const patient   = location.state?.patient ?? { id: id || "01", name: "Patient Name" };

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

    const handleSend = async () => {
        if (!subject.trim() || !description.trim()) {
            alert('Please enter both subject and description.');
            return;
        }
        setSent(true);

        const doctorName = localStorage.getItem("username") || "Dr. Consulting Physician";
        const pId = patient.patientId || patient.id || patient.patient_id;
        const activeBookingStr = sessionStorage.getItem('activeConsultingBooking');
        const activeBooking = activeBookingStr ? JSON.parse(activeBookingStr) : null;
        const bookingId = patient.bookingId || location.state?.bookingId || activeBooking?.bookingId;

        // Record this specific booking as completed so it is removed from active consulting queue
        // Repeat visits for the same patient will have a new booking_id and will cleanly appear once paid
        try {
            const completedBookings = JSON.parse(localStorage.getItem('completedFeedbackBookings') || '[]');
            if (bookingId && !completedBookings.includes(String(bookingId))) {
                completedBookings.push(String(bookingId));
                localStorage.setItem('completedFeedbackBookings', JSON.stringify(completedBookings));
            }
            sessionStorage.removeItem('activeConsultingBooking');
        } catch (err) {
            console.error('Failed to update completed feedback status:', err);
        }

        // Submit feedback to backend API
        try {
            const formData = new FormData();
            if (pId) formData.append('patientId', pId);
            if (bookingId) formData.append('bookingId', bookingId);
            formData.append('patientName', patient.name || 'Patient');
            formData.append('doctorName', doctorName);
            formData.append('subject', subject.trim());
            formData.append('description', description.trim());
            if (stampFile) {
                formData.append('stampImage', stampFile);
            }

            await fetch('http://127.0.0.1:5000/feedback/add_feedback', {
                method: 'POST',
                body: formData,
            });
        } catch (err) {
            console.error('Failed to submit feedback to backend:', err);
        }

        setTimeout(() => {
            setSent(false);
            setSubject("");
            setDescription("");
            setStampFile(null);
            setStampPreview(null);
            navigate("/consult_patient_list");
        }, 1200);
    };

    return (
        <section className="feedback-section">
            <div className="feedback-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="feedback-page-title" style={{ margin: 0 }}>Feedback</h1>
                    <p className="feedback-page-copy" style={{ margin: 0 }}>
                        Send a message for the selected patient and attach a stamp image if needed.
                    </p>
                </div>

                <button className="feedback-back-btn" onClick={() => (id ? navigate(`/consult_patient_list/${id}/dashboard`) : navigate('/consult_patient_list'))}>
                    ← Back
                </button>
            </div>

            <div className="feedback-card">
                <div className="feedback-card-header">
                    <span className="feedback-recipient">
                        Feedback to&nbsp;<strong>{patient.name}</strong>
                    </span>
                    <span className="feedback-datetime">{getNow()}</span>
                </div>

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
                        placeholder="Describe about it…"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={6}
                    />

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
