import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Splash from './splash';
import './Login.css';
import mainLogo from './main_pages/assets/Nuvo.png'; // Adjust the path as necessary

function Login({ onLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: '',
  });

  const [splash, setSplash] = useState(null);
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

    if (!username.trim() || !password || !role) {
      alert('Please fill in all fields and select a valid role');
      return;
    }

    console.log('Sending data to backend:', formData);

    try {
      const response = await fetch('http://127.0.0.1:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username,
          password,
          role,
        }),
      });

      const data = await response.json();

      console.log('Response from backend:', data);

      if (!response.ok) {
        alert(data.error || 'Login failed');
        return;
      }

      localStorage.setItem('role', data.role);
      localStorage.setItem('username', data.username);

      if (onLogin) {
        onLogin(data.username, data.role);
      }
      // Show splash
      setSplash({
        username: data.username,
        role: data.role,
      });
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. Check backend.');
    }
    setFormData({
      username: '',
      password: '',
      role: '',
    });
  };

  // IMPORTANT:
  // Do not remove splash before navigation

  const handleSplashFinish = () => {
    navigate('/home');
  };

  return (
    <>
      {splash ? (
        <Splash
          username={splash.username}

          role={splash.role}

          onFinish={handleSplashFinish}
        />
      ) : (
        <section className="login-background">
          {/* LEFT LOGO AREA */}

          <div className="login-logo">
            <img
              src={mainLogo}

              alt="Product Logo"

              className="logo-image"
            />
          </div>

          {/* RIGHT LOGIN AREA */}
          <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
              <h2
                style={{
                  fontFamily: 'Arial, sans-serif',
                  fontSize: '30px',
                  fontWeight: 'bold',
                }}>
                Kindly Get Your Access
              </h2>
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
                  <option value="" disabled>
                    Select Your Role in Hospital
                  </option>
                  <option value="Receptionist">Receptionist</option>
                  <option value="Doctor">Doctor</option>
                  <option value="MLT">MLT</option>
                  <option value="Radiologist">Radiologist</option>
                </select>
              </div>

              <button type="submit">Login</button>
            </form>
          </div>
        </section>
      )}
    </>
  );
}

export default Login;
