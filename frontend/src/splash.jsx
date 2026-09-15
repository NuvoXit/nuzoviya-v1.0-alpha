import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './splash.css';

function Splash({ username, role, onFinish }) {
  const [phase, setPhase] = useState('enter');

  const navigate = useNavigate();

  useEffect(() => {
    const enterTimer = setTimeout(() => {
      setPhase('visible');
    }, 50);

    const exitTimer = setTimeout(() => {
      setPhase('exit');
    }, 2500);

    const finishTimer = setTimeout(() => {
      // Direct page change here

      if (role === 'Doctor') {
        navigate('/doctor-dashboard');
      } else if (role === 'Receptionist') {
        navigate('/reception-dashboard');
      } else if (role === 'MLT') {
        navigate('/mlt-dashboard');
      }

      // optional callback

      if (onFinish) {
        onFinish();
      }
    }, 3100);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [navigate, role, onFinish]);

  return (
    <div className={`splash-overlay splash-overlay--${phase}`}>
      <div className="splash-content">
        <div className="splash-check-ring">
          <svg className="splash-check-svg" viewBox="0 0 52 52">
            <circle className="splash-check-circle" cx="26" cy="26" r="24" fill="none" />

            <path className="splash-check-path" fill="none" d="M14 27l7 7 16-16" />
          </svg>
        </div>

        <h1 className="splash-title">Welcome!</h1>

        <p className="splash-username">{username}</p>

        <span className="splash-role">{role}</span>

        <div className="splash-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
}

export default Splash;
