import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './payment.css';

function Payment() {
  const navigate = useNavigate();

  const HOSPITAL_FEE = 500;
  const DOCTOR_FEE = 2000;
  const MLT_FEE = 1000;
  const RADIOLOGIST_FEE = 1000;

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    telephone: '',
    doctorName: '',
    doctorId: null,
    hospitalFeeSelected: false,
    doctorFeeSelected: false,
    mltFeeSelected: false,
    radiologistFeeSelected: false,
    additionalReason: '',
    additionalCharge: '',
  });

  const [loading, setLoading] = useState(false);

  const totalAmount =
    (form.hospitalFeeSelected ? HOSPITAL_FEE : 0) +
    (form.doctorFeeSelected ? DOCTOR_FEE : 0) +
    (form.mltFeeSelected ? MLT_FEE : 0) +
    (form.radiologistFeeSelected ? RADIOLOGIST_FEE : 0) +
    (Number(form.additionalCharge) || 0);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,

      [name]: value,
    }));
  };

  const handleClear = () => {
    setForm({
      firstName: '',
      lastName: '',
      telephone: '',
      doctorName: '',
      doctorId: null,
      hospitalFeeSelected: false,
      doctorFeeSelected: false,
      mltFeeSelected: false,
      radiologistFeeSelected: false,
      additionalReason: '',
      additionalCharge: '',
    });

  };

  const handlePay = async () => {
    if (!form.firstName || !form.lastName || !form.telephone) {
      alert('Please fill all required fields');

      return;
    }

    if (!form.hospitalFeeSelected && !form.doctorFeeSelected && !form.additionalCharge) {
      alert('Please select payment item');

      return;
    }

    setLoading(true);

    try {
      const payload = {
        firstName: form.firstName,

        lastName: form.lastName,

        telephone: form.telephone,

        hospitalFeeSelected: form.hospitalFeeSelected,

        doctorFeeSelected: form.doctorFeeSelected,

        mltFeeSelected: form.mltFeeSelected,

        radiologistFeeSelected: form.radiologistFeeSelected,

        additionalReason: form.additionalReason,

        additionalCharge: Number(form.additionalCharge) || 0,
      };

      const response = await fetch(
        'http://127.0.0.1:5000/payment',

        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment failed');
      }

      alert(data.message || 'Payment successful');

      handleClear();

      navigate('/booking');
    } catch (error) {
      console.log(error);

      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-patient-main-content">
      <div className="booking-patient-page-header">
        <Link to="/booking" className="back-btn">
          ←
        </Link>

        <h3>Payment Details</h3>
      </div>

      <div className="booking-patient-form">
        <div className="booking-patient-form-row">
          <label>First Name *</label>

          <input type="text" name="firstName" value={form.firstName} onChange={handleChange} />
        </div>

        <div className="booking-patient-form-row">
          <label>Last Name *</label>

          <input type="text" name="lastName" value={form.lastName} onChange={handleChange} />
        </div>

        <div className="booking-patient-form-row">
          <label>Telephone *</label>

          <input type="text" name="telephone" value={form.telephone} onChange={handleChange} />
        </div>

        <br></br>

        <div className="booking-patient-form-row">
          <label>Payment Items</label>

          <label>
            <input
              type="checkbox"
              checked={form.hospitalFeeSelected}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,

                  hospitalFeeSelected: e.target.checked,
                }))
              }
            />
            Hospital Fee (Rs.500)
          </label>

          <label>
            <input
              type="checkbox"
              checked={form.doctorFeeSelected}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,

                  doctorFeeSelected: e.target.checked,
                }))
              }
            />
            Doctor Fee (Rs.2000)
          </label>

          <label>
            <input
              type="checkbox"
              checked={form.mltFeeSelected}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,

                  mltFeeSelected: e.target.checked,
                }))
              }
            />
            MLT Fee (Rs.1000)
          </label>

          <label>
            <input
              type="checkbox"
              checked={form.radiologistFeeSelected}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,

                  radiologistFeeSelected: e.target.checked,
                }))
              }
            />
            Radiologist Fee (Rs.1000)
          </label>
        </div>
        <br></br>
        <div className="booking-patient-form-row">
          <label>Additional Description</label>

          <input type="text" name="additionalReason" value={form.additionalReason} onChange={handleChange} placeholder="Medicine, Lab Test, X-Ray..." />
        </div>

        <div className="booking-patient-form-row">
          <label>Additional Amount</label>

          <input type="number" name="additionalCharge" value={form.additionalCharge} onChange={handleChange} placeholder="Enter amount" />
        </div>

        <div className="booking-patient-form-row">
          <label>Total Amount</label>

          <input value={`Rs. ${totalAmount}`} readOnly />
        </div>

        <div className="booking-patient-form-actions">
          <button className="btn" onClick={handlePay} disabled={loading}>
            {loading ? 'Processing...' : 'Pay'}
          </button>

          <button className="btn" onClick={handleClear} disabled={loading}>
            Clear Form
          </button>
        </div>
      </div>
    </div>
  );
}

export default Payment;
