import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./booking_history.css";

function BookingHistory() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("http://127.0.0.1:5000/booking/all_bookings")
            .then((res) => res.json())
            .then((data) => {
                setBookings(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching bookings:", error);
                setLoading(false);
            });
    }, []);

    return (
        <div className="booking-history-container" style={{ padding: "20px" }}>
            <Link to="/booking" className="booking-history-back-btn" style={{ display: "inline-block", marginBottom: "16px" }}>
                ← Back
            </Link>
            <h2>Booking History</h2>

            {loading ? (<p>Loading...</p>) : bookings.length === 0 ? (<p>No bookings found</p>) : (

                <table className="booking_history_table" border="1" cellPadding="10" style={{ width: "100%", marginTop: "12px" }}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Patient Name</th>
                            <th>Telephone</th>
                            <th>Doctor</th>
                            <th>Date</th>
                            <th>Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map((b) => (
                            <tr key={b.id}>
                                <td>{b.booking_id}</td>
                                <td>{b.first_name} {b.last_name}</td>
                                <td>{b.telephone}</td>
                                <td>{b.doctor_name}</td>
                                <td>{b.appointmentDate}</td>
                                <td>{b.appointmentTime}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default BookingHistory;
