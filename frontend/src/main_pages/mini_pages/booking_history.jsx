import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function BookingHistory() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("http://127.0.0.1:5000/bookings")
            .then((res) => res.json())
            .then((data) => {
                setBookings(data.bookings || []);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching bookings:", error);
                setLoading(false);
            });
    }, []);

    return (
        <div style={{ padding: "20px" }}>
            <Link to="/booking" style={{ display: "inline-block", marginBottom: "16px" }}>
                ← Back
            </Link>
            <h2>Booking History</h2>

            {loading ? (
                <p>Loading...</p>
            ) : bookings.length === 0 ? (
                <p>No bookings found</p>
            ) : (
                <table border="1" cellPadding="10" style={{ width: "100%", marginTop: "12px" }}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Patient NIC</th>
                            <th>Doctor</th>
                            <th>Date</th>
                            <th>Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map((b) => (
                            <tr key={b.id}>
                                <td>{b.id}</td>
                                <td>{b.patientNIC}</td>
                                <td>{b.doctorName}</td>
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
