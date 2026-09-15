import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Splash from './splash';
import './login.css';
import mainLogo from './main_pages/assets/login_Logo.png'; // Adjust the path as necessary

/* ════════════════════════════════════════════
   THREE.JS COMPONENTS - Right Panel Background
   ════════════════════════════════════════════ */

// ---- Pre-generated random data (module-level, not called during render) ----

const PARTICLE_COUNT = 80;
const PARTICLE_COLORS = ['#22c55e', '#4ade80', '#86efac', '#bbf7d0', '#15803d'];
const PARTICLE_DATA = Array.from({ length: PARTICLE_COUNT }).map((_, i) => ({
  position: [
    (Math.sin(i * 7.13) * 0.5) * 14,
    (Math.cos(i * 3.77) * 0.5) * 14,
    (Math.sin(i * 11.3) * 0.5) * 6 - 2,
  ],
  speed: 0.15 + (((i * 13.37) % 1) * 0.4),
  scale: 0.02 + (((i * 7.91) % 1) * 0.06),
  offset: ((i * 5.43) % 1) * Math.PI * 2,
  color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
}));

const SPARKLE_COUNT = 40;
const SPARKLE_DATA = Array.from({ length: SPARKLE_COUNT }).map((_, i) => ({
  position: [
    (Math.sin(i * 9.17) * 0.5) * 12,
    2 + ((i * 3.53) % 1) * 5,
    (Math.cos(i * 6.29) * 0.5) * 4 - 1,
  ],
  speed: 0.5 + (((i * 11.07) % 1) * 1.5),
  scale: 0.015 + (((i * 4.81) % 1) * 0.035),
  offset: ((i * 8.63) % 1) * Math.PI * 2,
  baseOpacity: 0.4 + (((i * 6.17) % 1) * 0.5),
}));

// ---- Three.js Components ----

// Floating particles scattered across the scene
function FloatingParticles() {
  const meshRefs = useRef([]);

  useFrame((state) => {
    meshRefs.current.forEach((mesh, i) => {
      if (mesh) {
        const d = PARTICLE_DATA[i];
        mesh.position.y += Math.sin(state.clock.elapsedTime * d.speed + d.offset) * 0.004;
        mesh.position.x += Math.cos(state.clock.elapsedTime * d.speed * 0.5 + d.offset) * 0.002;
      }
    });
  });

  return (
    <group>
      {PARTICLE_DATA.map((p, i) => (
        <mesh key={i} ref={(el) => (meshRefs.current[i] = el)} position={p.position}>
          <sphereGeometry args={[p.scale, 10, 10]} />
          <meshStandardMaterial
            color={p.color}
            emissive={p.color}
            emissiveIntensity={0.8}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
    </group>
  );
}

// White sparkles at the top of the panel
function WhiteSparkles() {
  const meshRefs = useRef([]);

  useFrame((state) => {
    meshRefs.current.forEach((mesh, i) => {
      if (mesh) {
        const d = SPARKLE_DATA[i];
        // Twinkle effect
        mesh.material.opacity =
          d.baseOpacity * (0.5 + 0.5 * Math.sin(state.clock.elapsedTime * d.speed + d.offset));
        // Gentle drift
        mesh.position.y += Math.sin(state.clock.elapsedTime * d.speed * 0.3 + d.offset) * 0.002;
        mesh.position.x += Math.cos(state.clock.elapsedTime * d.speed * 0.2 + d.offset) * 0.001;
      }
    });
  });

  return (
    <group>
      {SPARKLE_DATA.map((s, i) => (
        <mesh key={i} ref={(el) => (meshRefs.current[i] = el)} position={s.position}>
          <sphereGeometry args={[s.scale, 8, 8]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={1.5}
            transparent
            opacity={s.baseOpacity}
          />
        </mesh>
      ))}
    </group>
  );
}

// Pulsing concentric rings
function PulseRings() {
  const ring1Ref = useRef();
  const ring2Ref = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ring1Ref.current) {
      const s1 = 1 + Math.sin(t * 1.2) * 0.12;
      ring1Ref.current.scale.set(s1, s1, s1);
      ring1Ref.current.rotation.z = t * 0.08;
      ring1Ref.current.material.opacity = 0.08 + Math.sin(t * 1.5) * 0.04;
    }
    if (ring2Ref.current) {
      const s2 = 1 + Math.sin(t * 0.9 + 1) * 0.15;
      ring2Ref.current.scale.set(s2, s2, s2);
      ring2Ref.current.rotation.z = -t * 0.06;
      ring2Ref.current.material.opacity = 0.06 + Math.sin(t * 1.2 + 2) * 0.03;
    }
  });

  return (
    <group position={[0, 0, -2]}>
      <mesh ref={ring1Ref}>
        <torusGeometry args={[3.5, 0.015, 16, 100]} />
        <meshStandardMaterial
          color="#4ade80"
          emissive="#22c55e"
          emissiveIntensity={0.6}
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh ref={ring2Ref}>
        <torusGeometry args={[4.2, 0.01, 16, 100]} />
        <meshStandardMaterial
          color="#86efac"
          emissive="#4ade80"
          emissiveIntensity={0.5}
          transparent
          opacity={0.07}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// Full 3D scene behind the right login panel
function ThreeScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 50 }}
      style={{ position: 'absolute', inset: 0, zIndex: 0 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[4, 4, 4]} intensity={0.8} color="#22c55e" />
      <pointLight position={[-4, -3, 2]} intensity={0.5} color="#4ade80" />

      <WhiteSparkles />

      <PulseRings />
      <FloatingParticles />
    </Canvas>
  );
}

/* ════════════════════════════════════════════
   LOGIN COMPONENT
   ════════════════════════════════════════════ */

function Login({ onLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: '',
  });

  const [splash, setSplash] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Nuzoviya | Login';
  }, []);

  const handleChange = useCallback((e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const { username, password, role } = formData;

    if (!username.trim() || !password || !role) {
      alert('Please fill in all fields and select a valid role');
      return;
    }

    console.log('Sending data to backend:', formData);
    setIsLoading(true);

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
        setIsLoading(false);
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
    setIsLoading(false);
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
          {/* LEFT LOGO AREA - Original white panel */}
          <div className="login-logo">
            <img
              src={mainLogo}
              alt="Product Logo"
              className="logo-image"
            />
          </div>

          {/* RIGHT LOGIN AREA - Three.js background */}
          <div className="login-container">
            {/* Three.js canvas behind everything */}
            <ThreeScene />

            {/* Animated green blobs */}
            <div className="blob blob-1" />
            <div className="blob blob-2" />
            <div className="blob blob-3" />

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
                <div className="input-wrapper">
                  <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <input type="text" id="username" value={formData.username} onChange={handleChange} required />
                </div>
              </div>

              <div className="login-form-group">
                <label htmlFor="password">Password:</label>
                <div className="input-wrapper">
                  <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input type="password" id="password" value={formData.password} onChange={handleChange} required />
                </div>
              </div>

              <div className="login-form-group">
                <label htmlFor="role">Role:</label>
                <div className="input-wrapper">
                  <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <line x1="20" y1="8" x2="20" y2="14" />
                    <line x1="23" y1="11" x2="17" y2="11" />
                  </svg>
                  <select
                    id="role"
                    className={!formData.role ? 'role-placeholder' : ''}
                    value={formData.role}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled>
                      Select Your Role in Hospital
                    </option>
                    <option value="Receptionist">Receptionist</option>
                    <option value="Doctor">Doctor</option>
                    <option value="MLT">MLT</option>
                    <option value="Radiologist">Radiologist</option>
                  </select>
                </div>
              </div>

              <button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <span className="btn-loading">
                    <span className="spinner" />
                    Signing in...
                  </span>
                ) : (
                  'Login'
                )}
              </button>
            </form>
          </div>
        </section>
      )}
    </>
  );
}

export default Login;
