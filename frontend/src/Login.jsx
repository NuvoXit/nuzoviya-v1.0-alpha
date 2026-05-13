import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login({ onLogin }) {
  // added: accept onLogin prop from App.jsx
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "user",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const { username, password, role } = formData;

    if (!username.trim() || !password) {
      alert("Please fill in all fields");
      return;
    }

    console.log("Sending data to backend:", formData);

    try {
      const response = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password, role }),
      });

      const data = await response.json();
      console.log("Response from backend:", data);

      if (!response.ok) {
        alert(data.error || "Login failed");
        return;
      }

      localStorage.setItem("role", data.user.role);
      localStorage.setItem("username", data.user.username);

      onLogin(data.user.role); // added: tells App.jsx to update sidebar immediately

      alert(data.message);
      navigate("/home");
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Check backend.");
    }

    setFormData({ username: "", password: "", role: "user" });
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <div className="login-form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div className="login-form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="login-form-group">
          <label htmlFor="role">Role:</label>
          <select id="role" value={formData.role} onChange={handleChange}>
            <option value="user">Select Your Role in Hospital</option>
            <option value="guest">Receptionist</option>
            <option value="admin">Surgical Doctor</option>
            <option value="admin">MLT</option>
            <option value="admin">Radiologist</option>
          </select>
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
