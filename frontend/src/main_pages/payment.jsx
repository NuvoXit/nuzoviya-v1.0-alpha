import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ADDpaymentImg from './assets/Payment.svg';
import './payment.css';

function Payment({ user, onLogout }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    // optional: load payment-related data if API exists
    fetch('http://127.0.0.1:5000/payment')
      .then((response) => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then((result) => setData(result))
      .catch((error) => {
        // keep this quiet in UI but log for debugging
        console.debug('Payment fetch error:', error);
      });
  }, []);

  return (
    <div className="payment-main-content">

      <div className="payment-card-grid">
        <Link to="/payment/doctor_payment" className="payment-card" aria-label="New booking">
          <img src={ADDpaymentImg} alt="Add Patient" className="payment-card-icon"/>
          <p className="payment-card-label">Doctor Payment</p>
        </Link>

        <Link to="/payment/mlt_payment" className="payment-card" aria-label="Booked history">
          <img src={ADDpaymentImg} alt="Add Patient" className="payment-card-icon"/>
          <p className="payment-card-label">MLT Payment</p>
        </Link>

        <Link to="/payment/radiologist_payment" className="payment-card" aria-label="Booked history">
          <img src={ADDpaymentImg} alt="Add Patient" className="payment-card-icon"/>
          <p className="payment-card-label">Radiologist Payment</p>
        </Link>

        <Link to="/payment/optometrist_payment" className="payment-card" aria-label="Booked history">
          <img src={ADDpaymentImg} alt="Add Patient" className="payment-card-icon"/>
          <p className="payment-card-label">Optometrist Payment</p>
        </Link>
      </div>
    </div>
  );
}

export default Payment;
