import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login({ onLogin }) {
  // Set default role to empty string so they are forced to pick one
  const [formData, setFormData] = useState({ username: "", password: "", role: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { username, password, role } = formData;

    // Validation: Ensure they didn't leave the role on the placeholder
    if (!username.trim() || !password || !role) {
      alert("Please fill in all fields and select a valid role");
      return;
    }

    console.log("Sending data to backend:", formData);

    try {
      const response = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Kept for cookies/session handling if needed
        body: JSON.stringify({ username, password, role }),
      });

      const data = await response.json();
      console.log("Response from backend:", data);

      if (!response.ok) {
        alert(data.error || "Login failed");
        return;
      }

      localStorage.setItem("role", data.role);
      localStorage.setItem("username", data.username);

      if (onLogin) {
        onLogin(data.username, data.role);
      }

      alert(data.message);
      navigate("/home");

    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Check backend.");
    }

    // Reset form after attempt
    setFormData({ username: "", password: "", role: "" });
  };

  return (
      <div className="login-container">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Login</h2>

          <div className="login-form-group">
            <label htmlFor="username">Username:</label>
            <input type="text" id="username" value={formData.username} onChange={handleChange} required />
          </div>

          <div className="login-form-group">
            <label htmlFor="password">Password:</label>
            <input type="password" id="password" value={formData.password} onChange={handleChange} required />
          </div>

          <div className="login-form-group">
            <label htmlFor="role">Role:</label>
            <select id="role" value={formData.role} onChange={handleChange} required>
              {/* FIXED: value is set to "" so 'required' validation works */}
              <option value="" disabled>Select Your Role in Hospital</option>
              <option value="Doctor">Doctor</option>
              <option value="Receptionist">Receptionist</option>
              <option value="MLT">MLT</option>
              {/* <option value="Nurse">Nurse</option> */}
            </select>
          </div>

          <button type="submit">Login</button>
        </form>
      </div>
  );
}

export default Login;