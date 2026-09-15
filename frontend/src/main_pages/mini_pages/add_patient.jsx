import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './add_patient.css';

function AddPatient() {
  const [form, setForm] = useState({
    firstname: '',
    lastname: '',
    nic: '',
    dob: '',
    address: '',
    telephone: '',
    email: '',
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const { firstname, lastname, nic, telephone, email } = form;

    if (!firstname.trim() || !lastname.trim() || !nic.trim() || !telephone.trim()) {
      alert('Please fill all required fields.');
      return false;
    }

    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      alert('Invalid email format.');
      return false;
    }

    const lowerPhone = (telephone || '').toLowerCase();
    if (/wa\.me|whatsapp|http|\.com|\.me|www\./.test(lowerPhone)) {
      alert('Invalid telephone: WhatsApp links or web URLs are not allowed. Please enter a standard phone number.');
      return false;
    }

    let normPhone = telephone.trim();
    if (normPhone.startsWith('+94')) normPhone = '0' + normPhone.slice(3).trim();
    else if (normPhone.startsWith('0094')) normPhone = '0' + normPhone.slice(4).trim();

    if (!/^\+?[\d\s\-()]+$/.test(normPhone)) {
      alert('Invalid telephone: Letters or special symbols are not allowed. Please enter a standard phone number.');
      return false;
    }

    const digits = normPhone.replace(/\D/g, '');
    if (digits.length < 7 || digits.length > 15) {
      alert('Invalid telephone number: Must contain between 7 and 15 digits.');
      return false;
    }

    return true;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    let cleanTel = form.telephone.trim();
    if (cleanTel.startsWith('+94')) cleanTel = '0' + cleanTel.slice(3).trim();
    else if (cleanTel.startsWith('0094')) cleanTel = '0' + cleanTel.slice(4).trim();

    const patientData = {
      firstName: form.firstname.trim(),
      lastName: form.lastname.trim(),
      nic: form.nic.trim(),
      dob: form.dob || null,
      address: form.address?.trim() || '',
      telephone: cleanTel,
      email: form.email?.trim() || '',
    };

    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:5000/patient/add_patient', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add patient');
      }

      alert(data.message || 'Patient added successfully!');

      handleClear();

      // optional: change if route does not exist
      navigate('/patient');
    } catch (error) {
      console.error('Add patient error:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setForm({
      firstname: '',
      lastname: '',
      nic: '',
      dob: '',
      address: '',
      telephone: '',
      email: '',
    });
  };

  return (
    <div className="add-patient-main-content">
      <div className="add-patient-page-header">
        <h3>Adding New Patient</h3>
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      <div className="add-patient-form">
        {/* FIRST NAME */}
        <div className="add-patient-form-row">
          <label>Firstname *</label>
          <input name="firstname" value={form.firstname} onChange={handleChange} placeholder="Enter first name (e.g. John)" />
        </div>

        {/* LAST NAME */}
        <div className="add-patient-form-row">
          <label>Lastname *</label>
          <input name="lastname" value={form.lastname} onChange={handleChange} placeholder="Enter last name (e.g. Perera)" />
        </div>

        {/* NIC */}
        <div className="add-patient-form-row">
          <label>NIC *</label>
          <input name="nic" value={form.nic} onChange={handleChange} placeholder="e.g. 200012345678 or 123456789V" />
          <small>National Identity Card number</small>
        </div>

        {/* DOB */}
        <div className="add-patient-form-row">
          <label>Date Of Birth *</label>
          <input type="date" name="dob" value={form.dob} onChange={handleChange} />
          <small>Select correct birth date</small>
        </div>

        {/* ADDRESS */}
        <div className="add-patient-form-row">
          <label>Address</label>
          <input name="address" value={form.address} onChange={handleChange} placeholder="House No, Street, City" />
        </div>

        {/* TELEPHONE */}
        <div className="add-patient-form-row">
          <label>Telephone *</label>
          <input name="telephone" value={form.telephone} onChange={handleChange} placeholder="e.g. 0771234567" />
          <small>Enter valid mobile number</small>
        </div>

        {/* EMAIL */}
        <div className="add-patient-form-row">
          <label>Email</label>
          <input name="email" value={form.email} onChange={handleChange} placeholder="e.g. name@gmail.com" />
        </div>

        {/* BUTTONS */}
        <div className="add-patient-form-actions">
          <button className="btn" onClick={handleCreate} disabled={loading}>
            {loading ? 'Saving...' : 'Create'}
          </button>

          <button className="btn" onClick={handleClear} disabled={loading}>
            Clear Form
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddPatient;
