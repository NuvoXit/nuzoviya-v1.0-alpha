import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import "./booking.css";
import BookingImg from "./assets/booking.png";
import AppointedImg from "./assets/appointment.png";



function Booking() {
    return (
        <div className="booking-main-content">
            <div className="booking-card-grid">

                <Link to="/booking/booking_patient" className="booking-card">
                    <div className="booking-card-icon">
                        <img src={BookingImg} alt="Booking" className="bookingimg"/>
                    </div>
                    <p>Booking</p>
                </Link>

                <Link to="/booking/booking_history" className="booking-card">
                    <div className="booking-card-icon">
                        <img src={AppointedImg} alt="Appointed" className="appointedimg"/>
                    </div>
                    <p>Booked History</p>
                </Link>

            </div>

        </div>

    );
}

export default Booking;