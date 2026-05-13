import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./booking_patient.css";

function BookingPatient() {
    const [form, setForm] = useState({
        patientNIC: "",
        firstName: "",
        lastName: "",
        telephone: "",
        doctorName: "",
        appointmentDate: "",
        appointmentTime: "",
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleClear = () => {
        setForm({
            patientNIC: "",
            firstName: "",
            lastName: "",
            telephone: "",
            doctorName: "",
            appointmentDate: "",
            appointmentTime: "",
        });
    };

    // Was only logging to console — now actually calls the backend
    async function handleCreate() {
        const { patientNIC, firstName, lastName, telephone, doctorName, appointmentDate, appointmentTime } = form;

        if (!patientNIC || !firstName || !lastName || !telephone || !doctorName || !appointmentDate || !appointmentTime) {
            alert("Please fill in all required fields.");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...form,
                patientID: form.patientNIC // map NIC to ID for backend
            };
            const response = await fetch("http://127.0.0.1:5000/booking/add_booking", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to create booking");
            }

            alert(data.message || "Booking created successfully!");
            handleClear();
            navigate("/booking");
        } catch (error) {
            console.error("Booking error:", error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="booking-patient-main-content">
            <div className="booking-patient-page-header">
                <h3>New Booking</h3>
                <Link to="/booking" className="back-btn">←</Link>
            </div>

            <div className="booking-patient-form">
                <div className="booking-patient-form-row">
                    <label>Patient NIC <span className="required">*</span></label>
                    <input name="patientNIC" value={form.patientNIC} onChange={handleChange} placeholder="e.g. 123456789V" />
                </div>
                <div className="booking-patient-form-row">
                    <label>First Name <span className="required">*</span></label>
                    <input name="firstName" value={form.firstName} onChange={handleChange} />
                </div>
                <div className="booking-patient-form-row">
                    <label>Last Name <span className="required">*</span></label>
                    <input name="lastName" value={form.lastName} onChange={handleChange} />
                </div>
                <div className="booking-patient-form-row">
                    <label>Telephone <span className="required">*</span></label>
                    <input name="telephone" value={form.telephone} onChange={handleChange} />
                </div>
                <div className="booking-patient-form-row">
                    <label>Doctor Name <span className="required">*</span></label>
                    <input name="doctorName" value={form.doctorName} onChange={handleChange} />
                </div>
                <div className="booking-patient-form-row">
                    <label>Appointment Date <span className="required">*</span></label>
                    <input type="date" name="appointmentDate" value={form.appointmentDate} onChange={handleChange} />
                </div>
                <div className="booking-patient-form-row">
                    <label>Appointment Time <span className="required">*</span></label>
                    <input type="time" name="appointmentTime" value={form.appointmentTime} onChange={handleChange} />
                </div>

                <div className="booking-patient-form-actions">
                    <button className="btn" onClick={handleCreate} disabled={loading}>
                        {loading ? "Saving..." : "Book"}
                    </button>
                    <button className="btn" onClick={handleClear} disabled={loading}>
                        Clear Form
                    </button>
                </div>
            </div>
        </div>
    );
}

export default BookingPatient;
