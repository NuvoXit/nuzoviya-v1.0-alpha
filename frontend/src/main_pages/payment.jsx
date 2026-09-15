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
  const [bookingSuggestions, setBookingSuggestions] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  const totalAmount =
    (form.hospitalFeeSelected ? HOSPITAL_FEE : 0) +
    (form.doctorFeeSelected ? DOCTOR_FEE : 0) +
    (form.mltFeeSelected ? MLT_FEE : 0) +
    (form.radiologistFeeSelected ? RADIOLOGIST_FEE : 0) +
    (Number(form.additionalCharge) || 0);

  const handleBookingSearch = async (query) => {
    if (!query || query.trim().length === 0) {
      setBookingSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:5000/booking/search_bookings?query=${encodeURIComponent(query.trim())}`);
      if (!response.ok) {
        setBookingSuggestions([]);
        return;
      }
      const list = await response.json();
      setBookingSuggestions(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Error searching bookings for payment:', error);
      setBookingSuggestions([]);
    }
  };

  const selectBooking = (b) => {
    setForm((prev) => ({
      ...prev,
      firstName: b.first_name || '',
      lastName: b.last_name || '',
      telephone: b.telephone || '',
      doctorName: b.doctor_name || '',
      hospitalFeeSelected: true,
      doctorFeeSelected: true,
    }));
    setSelectedBookingId(b.booking_id);
    setBookingSuggestions([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (['firstName', 'lastName', 'telephone'].includes(name)) {
      handleBookingSearch(value);
    }
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
    setBookingSuggestions([]);
    setSelectedBookingId(null);
  };

  const handlePay = async () => {
    if (!form.firstName || !form.lastName || !form.telephone) {
      alert('Please fill all required fields');
      return;
    }

    const lowerPhone = (form.telephone || '').toLowerCase();
    if (/wa\.me|whatsapp|http|\.com|\.me|www\./.test(lowerPhone)) {
      alert('Invalid telephone: WhatsApp links or web URLs are not allowed. Please enter a standard phone number.');
      return;
    }

    let cleanTel = form.telephone.trim();
    if (cleanTel.startsWith('+94')) cleanTel = '0' + cleanTel.slice(3).trim();
    else if (cleanTel.startsWith('0094')) cleanTel = '0' + cleanTel.slice(4).trim();

    if (!/^\+?[\d\s\-()]+$/.test(cleanTel)) {
      alert('Invalid telephone: Letters or special symbols are not allowed. Please enter a valid phone number.');
      return;
    }

    const digits = cleanTel.replace(/\D/g, '');
    if (digits.length < 7 || digits.length > 15) {
      alert('Invalid telephone number: Must contain between 7 and 15 digits.');
      return;
    }

    if (!form.hospitalFeeSelected && !form.doctorFeeSelected && !form.additionalCharge) {
      alert('Please select payment item');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        bookingId: selectedBookingId,
        firstName: form.firstName,
        lastName: form.lastName,
        telephone: cleanTel,
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
        <h3>Payment Details</h3>
        <Link to="/booking" className="back-btn">
          ← Back
        </Link>
      </div>

      <div className="booking-patient-form">
        <div className="booking-patient-form-row booked-patient-search-field" style={{ position: 'relative' }}>
          <label>First Name *</label>
          <input
            type="text"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            autoComplete="off"
            placeholder="Search booked patient or enter first name..."
          />
          {bookingSuggestions && bookingSuggestions.length > 0 && (
            <ul className="booked-patient-suggestions">
              {bookingSuggestions.map((b) => (
                <li key={b.booking_id} onClick={() => selectBooking(b)}>
                  <strong>{b.first_name} {b.last_name}</strong>
                  <span className="suggestion-meta">
                    Dr: {b.doctor_name} | Date: {b.appointmentDate} | Tel: {b.telephone}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="booking-patient-form-row">
          <label>Last Name *</label>
          <input type="text" name="lastName" value={form.lastName} onChange={handleChange} placeholder="Enter last name..." />
        </div>

        <div className="booking-patient-form-row">
          <label>Telephone *</label>
          <input type="text" name="telephone" value={form.telephone} onChange={handleChange} placeholder="Enter telephone..." />
          {form.doctorName && (
            <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600', marginTop: '6px' }}>
              ✓ Scheduled with {form.doctorName}
            </span>
          )}
        </div>

        <br></br>

        <div className="booking-patient-form-row payment-section">
          <h4 className="payment-section-title">Payment Items</h4>

          <div className="payment-option">
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
          </div>

          <div className="payment-option">
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
          </div>

          <div className="payment-option">
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
          </div>

          <div className="payment-option">
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
