import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./booking_history.css";

function BookingHistory() {
    const [bookings, setBookings] = useState([]);
    const [filter, setFilter] = useState("active");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch("http://127.0.0.1:5000/booking/all_bookings").then((r) => (r.ok ? r.json() : [])).catch(() => []),
            fetch("http://127.0.0.1:5000/feedback/all_feedbacks").then((r) => (r.ok ? r.json() : [])).catch(() => []),
        ])
            .then(([bookingsData, feedbacksData]) => {
                const localCompleted = JSON.parse(localStorage.getItem('completedFeedbackBookings') || '[]');
                const feedbackBookingIds = (Array.isArray(feedbacksData) ? feedbacksData : []).map((f) => f.booking_id).filter(Boolean);

                const list = (Array.isArray(bookingsData) ? bookingsData : []).map((b) => {
                    const isDone = b.status === "Completed" || localCompleted.includes(String(b.booking_id)) || feedbackBookingIds.includes(b.booking_id);
                    return {
                        ...b,
                        isCompleted: isDone,
                        status: isDone ? "Completed" : (b.status || "Booked"),
                    };
                });
                setBookings(list);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching bookings:", error);
                setLoading(false);
            });
    }, []);

    const activeBookings = bookings.filter((b) => !b.isCompleted);
    const displayedBookings = filter === "active" ? activeBookings : bookings;

    return (
        <div className="booking-history-container" style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 style={{ margin: 0 }}>Booked List</h2>
                <Link to="/booking" className="booking-history-back-btn" style={{ display: "inline-block", margin: 0 }}>
                    ← Back
                </Link>
            </div>

            {/* Filter Toggle Tabs */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
                <button
                    type="button"
                    onClick={() => setFilter("active")}
                    style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        border: "1px solid",
                        borderColor: filter === "active" ? "#16a34a" : "#cbd5e1",
                        background: filter === "active" ? "#dcfce7" : "#ffffff",
                        color: filter === "active" ? "#166534" : "#475569",
                        fontWeight: "600",
                        cursor: "pointer",
                        fontSize: "13px",
                    }}
                >
                    Active Bookings ({activeBookings.length})
                </button>
                <button
                    type="button"
                    onClick={() => setFilter("all")}
                    style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        border: "1px solid",
                        borderColor: filter === "all" ? "#16a34a" : "#cbd5e1",
                        background: filter === "all" ? "#dcfce7" : "#ffffff",
                        color: filter === "all" ? "#166534" : "#475569",
                        fontWeight: "600",
                        cursor: "pointer",
                        fontSize: "13px",
                    }}
                >
                    All History ({bookings.length})
                </button>
            </div>

            {loading ? (<p>Loading...</p>) : displayedBookings.length === 0 ? (
                <p style={{ color: "#64748b", padding: "16px 0" }}>{filter === "active" ? "No active bookings pending consultation" : "No bookings found"}</p>
            ) : (
                <div className="booking-history-table-wrap">
                    <table className="booking_history_table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Patient Name</th>
                                <th>NIC</th>
                                <th>Telephone</th>
                                <th>Doctor</th>
                                <th>Date & Time</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedBookings.map((b) => (
                                <tr key={b.booking_id}>
                                    <td>#{b.booking_id}</td>
                                    <td><strong>{b.first_name} {b.last_name}</strong></td>
                                    <td>{b.nic || "—"}</td>
                                    <td>{b.telephone}</td>
                                    <td>{b.doctor_name}</td>
                                    <td>{b.appointmentDate} {b.appointmentTime}</td>
                                    <td>
                                        <span
                                            style={{
                                                padding: "4px 10px",
                                                borderRadius: "12px",
                                                fontSize: "12px",
                                                fontWeight: "600",
                                                background: b.isCompleted ? "#f1f5f9" : b.status === "Paid" ? "#dcfce7" : "#fef3c7",
                                                color: b.isCompleted ? "#64748b" : b.status === "Paid" ? "#166534" : "#92400e",
                                                display: "inline-block",
                                            }}
                                        >
                                            {b.isCompleted ? "Completed" : b.status === "Paid" ? "Paid / Ready" : "Pending Payment"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default BookingHistory;
