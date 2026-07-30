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
    }, 2200);

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
    }, 2750);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [navigate, role, onFinish]);

  const greeting = getGreeting();

  return (
    <div className={`splash-overlay splash-overlay--${phase}`}>
      <div className="splash-content">
        <div className="splash-mark">
          <svg className="splash-mark-svg" viewBox="0 0 52 52">
            <circle className="splash-mark-ring" cx="26" cy="26" r="23" fill="none" />
            <path className="splash-mark-check" fill="none" d="M15 27l7 7 15-15.5" />
          </svg>
        </div>

        <p className="splash-eyebrow">{greeting}</p>
        <h1 className="splash-title">{username}</h1>
        <span className="splash-role">{role}</span>

        <div className="splash-progress">
          <div className="splash-progress-fill"></div>
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default Splash;
