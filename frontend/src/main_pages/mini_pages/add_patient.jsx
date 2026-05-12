import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./add_patient.css";

function AddPatient() {
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    nic: "",
    dob: "",
    address: "",
    telephone: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const { firstname, lastname, nic, telephone, email } = form;

    if (
      !firstname.trim() ||
      !lastname.trim() ||
      !nic.trim() ||
      !telephone.trim()
    ) {
      alert("Please fill all required fields.");
      return false;
    }

    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      alert("Invalid email format.");
      return false;
    }

    if (!/^[0-9+\-\s]{7,15}$/.test(telephone)) {
      alert("Invalid telephone number.");
      return false;
    }

    return true;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    const patientData = {
      first_name: form.firstname.trim(),
      last_name: form.lastname.trim(),
      NIC: form.nic.trim(),
      DOB: form.dob || null,
      address: form.address?.trim() || "",
      Tel_no: form.telephone.trim(),
      email: form.email?.trim() || "",
    };

    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/patient/add_patient",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(patientData),
        },
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Failed to add patient");
      }

      alert(data.message || "Patient added successfully!");

      handleClear();

      // optional: change if route does not exist
      navigate("/patient");
    } catch (error) {
      console.error("Add patient error:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setForm({
      firstname: "",
      lastname: "",
      nic: "",
      dob: "",
      address: "",
      telephone: "",
      email: "",
    });
  };

  return (
    <div className="main-content">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ←
        </button>
        <h3>Adding New Patient</h3>
      </div>

      <div className="form">
        {/* FIRST NAME */}
        <div className="form-row">
          <label>Firstname *</label>
          <input
            name="firstname"
            value={form.firstname}
            onChange={handleChange}
            placeholder="Enter first name (e.g. John)"
          />
        </div>

        {/* LAST NAME */}
        <div className="form-row">
          <label>Lastname *</label>
          <input
            name="lastname"
            value={form.lastname}
            onChange={handleChange}
            placeholder="Enter last name (e.g. Perera)"
          />
        </div>

        {/* NIC */}
        <div className="form-row">
          <label>NIC *</label>
          <input
            name="nic"
            value={form.nic}
            onChange={handleChange}
            placeholder="e.g. 200012345678 or 123456789V"
          />
          <small>National Identity Card number</small>
        </div>

        {/* DOB */}
        <div className="form-row">
          <label>Date Of Birth *</label>
          <input
            type="date"
            name="dob"
            value={form.dob}
            onChange={handleChange}
          />
          <small>Select correct birth date</small>
        </div>

        {/* ADDRESS */}
        <div className="form-row">
          <label>Address</label>
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="House No, Street, City"
          />
        </div>

        {/* TELEPHONE */}
        <div className="form-row">
          <label>Telephone *</label>
          <input
            name="telephone"
            value={form.telephone}
            onChange={handleChange}
            placeholder="e.g. 0771234567"
          />
          <small>Enter valid mobile number</small>
        </div>

        {/* EMAIL */}
        <div className="form-row">
          <label>Email</label>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="e.g. name@gmail.com"
          />
        </div>

        {/* BUTTONS */}
        <div className="form-actions">
          <button className="btn" onClick={handleCreate} disabled={loading}>
            {loading ? "Saving..." : "Create"}
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
