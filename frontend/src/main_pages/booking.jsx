import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import "./booking.css";
import BookingImg from "./assets/booking.png";
import AppointedImg from "./assets/appointment.png";



function Booking() {
    const [data, setData] = useState(null);
          
          useEffect(() => {
          fetch("http://127.0.0.1:5000/booking")
              .then((response) => response.json())
              .then((result) => {setData(result);})
              .catch((error) => {console.error("Fetch error:", error);});
          }, []);
    
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