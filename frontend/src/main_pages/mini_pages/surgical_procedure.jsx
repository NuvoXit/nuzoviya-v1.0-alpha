import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import './surgical_procedure.css';

function SurgicalProcedure() {
  const { id } = useParams();

  const [patient, setPatient] = useState(null);
  const [patientLoading, setPatientLoading] = useState(true);

  const [nurses, setNurses] = useState([]);
  const [nurseLoading, setNurseLoading] = useState(true);

  const [showNurseList, setShowNurseList] = useState(false);

  const [selectedNurses, setSelectedNurses] = useState([]);

  const nursePanelRef = useRef(null);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/patient/all_patients')
      .then((res) => res.json())

      .then((data) => {
        const foundPatient = Array.isArray(data) ? data.find((item) => String(item.patient_id) === String(id)) : null;

        setPatient(foundPatient || null);

        setPatientLoading(false);
      })

      .catch((error) => {
        console.error(error);

        setPatient(null);

        setPatientLoading(false);
      });
  }, [id]);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/nurse/all_nurses')
      .then((res) => res.json())

      .then((data) => {
        const mapped = Array.isArray(data)
          ? data.map((nurse) => ({
              id: nurse.nurse_id,

              name: nurse.nurse_full_name,

              role: 'Nurse',
            }))
          : [];

        setNurses(mapped);

        setNurseLoading(false);
      });
  }, []);

  useEffect(() => {
    const closeMenu = (event) => {
      if (nursePanelRef.current && !nursePanelRef.current.contains(event.target)) {
        setShowNurseList(false);
      }
    };

    document.addEventListener('mousedown', closeMenu);

    return () => {
      document.removeEventListener('mousedown', closeMenu);
    };
  }, []);

  const handleAddNurse = (nurse) => {
    setSelectedNurses((current) => (current.some((item) => item.id === nurse.id) ? current : [...current, nurse]));
  };

  const removeNurse = (id) => {
    setSelectedNurses((current) => current.filter((nurse) => nurse.id !== id));
  };

  return (
    <section className="surgical-procedure-stage">
      <div className="surgical-box">
        <div className="patient-panel">
          <div className="patient-panel-row">
            <span className="patient-panel-label">Patient Name :</span>

            <span className="patient-panel-value">{patientLoading ? 'Loading...' : patient ? `${patient.first_name} ${patient.last_name}` : 'Patient not found'}</span>
          </div>

          <div className="patient-panel-row">
            <span className="patient-panel-label">Patient ID :</span>

            <span className="patient-panel-value">{patientLoading ? 'Loading...' : patient ? patient.patient_id : '—'}</span>
          </div>
        </div>

        <fieldset className="procedure-fieldset" ref={nursePanelRef}>
          <legend className="procedure-legend">
            <button type="button" className="add-people-btn" onClick={() => setShowNurseList((current) => !current)}>
              + Add People
            </button>

            <div className="selected-nurses-bar">
              {selectedNurses.map((nurse) => (
                <div className="selected-nurse-pill" key={nurse.id}>
                  <span className="selected-nurse-dot" />

                  <span>{nurse.name}</span>

                  <button className="selected-nurse-close" onClick={() => removeNurse(nurse.id)}>
                    ×
                  </button>
                </div>
              ))}
            </div>
          </legend>

          {showNurseList && (
            <div className="nurse-picker">
              <button className="nurse-picker-close" onClick={() => setShowNurseList(false)}>
                ×
              </button>

              {nurseLoading ? (
                <p>Loading nurses...</p>
              ) : (
                nurses.map((nurse) => (
                  <div className="nurse-picker-row" key={nurse.id}>
                    <label className="nurse-picker-label">
                      <input type="radio" name="nurse" />

                      <span className="nurse-avatar" />

                      <span className="nurse-info">
                        <strong>{nurse.name}</strong>

                        <small>{nurse.role}</small>
                      </span>
                    </label>

                    <button className="nurse-add-btn" onClick={() => handleAddNurse(nurse)}>
                      +
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          <div className="surgery-area">
            <textarea className="display-box" placeholder="Describe the preparation of surgery.........." />

            <textarea className="display-box" placeholder="Describe the process of surgery.........." />

            <button type="button" className="send-btn">
              Send
            </button>
          </div>
        </fieldset>
      </div>
    </section>
  );
}

export default SurgicalProcedure;
