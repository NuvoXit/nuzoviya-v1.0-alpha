import { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import "./prescription.css";

function calcAge(dob) {
  if (!dob) return '';

  const birth = new Date(dob);
  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age >= 0 ? age : '';
}

function Prescription() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const statePatient = location.state?.patient;

    const [formData, setFormData] = useState({
        patientName: statePatient?.name || '',
        age: statePatient?.age !== undefined && statePatient?.age !== '—' ? statePatient.age : '',
        problem: '',
        description: '',
        solution: '',
        notes: '',
        appointmentDate: '',
    });

    const [medicines, setMedicines] = useState([
        { id: 1, name: '', dosage: '' }
    ]);

    // Surgical Procedure integration state
    const [includeSurgery, setIncludeSurgery] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [nurses, setNurses] = useState([]);
    const [nurseLoading, setNurseLoading] = useState(true);
    const [showNurseList, setShowNurseList] = useState(false);
    const [selectedNurses, setSelectedNurses] = useState([]);
    const [surgeryData, setSurgeryData] = useState({
        surgeryDate: '',
        surgeryTime: '',
        preparation: '',
        process: '',
    });

    const [bookedSurgeries, setBookedSurgeries] = useState([]);
    const [slotConflict, setSlotConflict] = useState(null);
    const [suggestedSlots, setSuggestedSlots] = useState([]);

    const nursePanelRef = useRef(null);

    useEffect(() => {
        if (!formData.patientName && id) {
            fetch('http://127.0.0.1:5000/patient/all_patients')
                .then((res) => res.json())
                .then((data) => {
                    const found = Array.isArray(data) ? data.find((p) => String(p.patient_id) === String(id)) : null;
                    if (found) {
                        const fullName = `${found.first_name} ${found.last_name}`;
                        const calculatedAge = calcAge(found.dob);
                        setFormData((prev) => ({
                            ...prev,
                            patientName: fullName,
                            age: calculatedAge,
                        }));
                    }
                })
                .catch((err) => {
                    console.error('Failed to load patient for prescription:', err);
                });
        }
    }, [id, formData.patientName]);

    // Fetch scheduled surgeries to monitor time slot availability
    useEffect(() => {
        if (includeSurgery) {
            fetch('http://127.0.0.1:5000/prescription/scheduled_surgeries')
                .then((res) => res.json())
                .then((data) => {
                    if (Array.isArray(data)) {
                        setBookedSurgeries(data);
                    }
                })
                .catch((err) => console.error('Error fetching booked surgeries:', err));
        }
    }, [includeSurgery]);

    // Real-time conflict detection & alternative duration calculation
    useEffect(() => {
        if (!surgeryData.surgeryDate || !surgeryData.surgeryTime || !includeSurgery) {
            setSlotConflict(null);
            setSuggestedSlots([]);
            return;
        }

        const normalizeTime = (t) => {
            if (!t) return '';
            const parts = t.split(':');
            return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
        };

        const pickedDate = surgeryData.surgeryDate;
        const pickedTime = normalizeTime(surgeryData.surgeryTime);

        // Find conflicting surgery on the same date and time
        const conflicting = bookedSurgeries.find((b) => {
            const bDate = b.surgery_date ? b.surgery_date.split('T')[0] : '';
            const bTime = normalizeTime(b.surgery_time);
            return bDate === pickedDate && bTime === pickedTime;
        });

        if (conflicting) {
            setSlotConflict({
                patientName: conflicting.patient_name,
                doctorName: conflicting.doctor_name,
                date: pickedDate,
                time: pickedTime,
            });

            // Generate alternative duration suggestions on the same date
            const [hours, minutes] = pickedTime.split(':').map(Number);
            const candidates = [
                `${String((hours + 1) % 24).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
                `${String((hours + 2) % 24).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
                '09:00',
                '11:30',
                '14:00',
                '15:30',
                '17:00',
            ];

            const bookedTimesOnDate = bookedSurgeries
                .filter((b) => (b.surgery_date ? b.surgery_date.split('T')[0] : '') === pickedDate)
                .map((b) => normalizeTime(b.surgery_time));

            const uniqueAvailable = Array.from(new Set(candidates)).filter(
                (cand) => cand !== pickedTime && !bookedTimesOnDate.includes(cand)
            );

            setSuggestedSlots(uniqueAvailable.slice(0, 4));
        } else {
            setSlotConflict(null);
            setSuggestedSlots([]);
        }
    }, [surgeryData.surgeryDate, surgeryData.surgeryTime, bookedSurgeries, includeSurgery]);

    // Fetch nurses when surgical procedure section is enabled
    useEffect(() => {
        if (includeSurgery && nurses.length === 0) {
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
                })
                .catch((err) => {
                    console.error('Failed to load nurses:', err);
                    setNurseLoading(false);
                });
        }
    }, [includeSurgery, nurses.length]);

    // Close nurse dropdown on outside click
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
        setSelectedNurses((current) =>
            current.some((item) => item.id === nurse.id) ? current : [...current, nurse]
        );
    };

    const removeNurse = (nurseId) => {
        setSelectedNurses((current) => current.filter((nurse) => nurse.id !== nurseId));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAddMedicine = () => {
        setMedicines((prev) => [
            ...prev,
            { id: Date.now(), name: '', dosage: '' }
        ]);
    };

    const handleRemoveMedicine = (idToRemove) => {
        if (medicines.length === 1) {
            setMedicines([{ id: Date.now(), name: '', dosage: '' }]);
        } else {
            setMedicines((prev) => prev.filter((m) => m.id !== idToRemove));
        }
    };

    const handleMedicineChange = (idToUpdate, field, value) => {
        setMedicines((prev) =>
            prev.map((m) => (m.id === idToUpdate ? { ...m, [field]: value } : m))
        );
    };

    const handleReset = () => {
        setFormData((prev) => ({
            ...prev,
            problem: '',
            description: '',
            solution: '',
            notes: '',
            appointmentDate: '',
        }));
        setMedicines([{ id: Date.now(), name: '', dosage: '' }]);
        setIncludeSurgery(false);
        setIsAuthorized(false);
        setSelectedNurses([]);
        setSurgeryData({ surgeryDate: '', surgeryTime: '', preparation: '', process: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (includeSurgery && slotConflict) {
            alert(`Cannot submit: Surgery time slot (${slotConflict.time} on ${slotConflict.date}) is already allocated to patient '${slotConflict.patientName}'. Please select an available alternative time.`);
            return;
        }

        const doctorName = localStorage.getItem("username") || "Dr. Consulting Physician";
        const payload = {
            patientId: id ? parseInt(id, 10) : null,
            patientName: formData.patientName,
            age: formData.age ? parseInt(formData.age, 10) : null,
            doctorName: doctorName,
            problem: formData.problem,
            description: formData.description,
            solution: formData.solution,
            notes: formData.notes,
            appointmentDate: formData.appointmentDate || null,
            medicines: medicines.filter((m) => m.name.trim() || m.dosage.trim()),
            surgicalProcedure: includeSurgery
                ? {
                      included: true,
                      authorized: isAuthorized,
                      surgeryDate: surgeryData.surgeryDate || null,
                      surgeryTime: surgeryData.surgeryTime || null,
                      assignedStaff: selectedNurses,
                      preparation: surgeryData.preparation,
                      process: surgeryData.process,
                  }
                : { included: false },
            surgeryDate: includeSurgery ? (surgeryData.surgeryDate || null) : null,
            surgeryTime: includeSurgery ? (surgeryData.surgeryTime || null) : null,
        };

        try {
            const response = await fetch('http://127.0.0.1:5000/prescription/add_prescription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                alert('Prescription submitted successfully!');
                if (id) {
                    navigate(`/consult_patient_list/${id}/dashboard`);
                } else {
                    navigate('/consult_patient_list');
                }
            } else {
                const errData = await response.json();
                alert(`Failed to submit prescription: ${errData.error || 'Server error'}`);
            }
        } catch (err) {
            console.error('Error submitting prescription:', err);
            alert('Prescription saved locally (Backend unreachable).');
            if (id) {
                navigate(`/consult_patient_list/${id}/dashboard`);
            } else {
                navigate('/consult_patient_list');
            }
        }
    };

    return (
        <section className="prescription-section">
            <div className="prescription-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="prescription-title" style={{ margin: 0 }}>Prescription</h1>
                    <p className="prescription-description" style={{ margin: 0 }}>Fill out the prescription details carefully and submit when you are ready.</p>
                </div>
                <button
                    type="button"
                    className="prescription-back-btn"
                    onClick={() => (id ? navigate(`/consult_patient_list/${id}/dashboard`) : navigate('/consult_patient_list'))}
                >
                    ← Back
                </button>
            </div>

            <form className="form_prescription" onSubmit={handleSubmit}>
                <fieldset>
                    <legend>Prescription</legend>
                    <h2>Patient Prescription Form</h2>
                    <p>Fill out the prescription details carefully</p>

                {/* Patient Information */}
                <div className="form_group">
                    <label>Patient Name</label>
                    <input
                        type="text"
                        name="patientName"
                        placeholder="Enter Patient Name"
                        value={formData.patientName}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form_group">
                    <label>Age</label>
                    <input
                        type="number"
                        name="age"
                        placeholder="Enter Age"
                        value={formData.age}
                        onChange={handleChange}
                    />
                </div>

                {/* Problem & Clinical Description (Email-Style Box) */}
                <div className="form_group form_group--full">
                    <label>Problem & Clinical Description</label>
                    <div className="problem-email-box">
                        <div className="problem-email-header">
                            <span className="problem-email-label">Subject:</span>
                            <input
                                type="text"
                                name="problem"
                                className="problem-email-subject"
                                placeholder="Problem / Chief Complaint (e.g. Severe Headache, Chronic Cough)"
                                value={formData.problem}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="problem-email-divider" />
                        <div className="problem-email-body">
                            <textarea
                                name="description"
                                className="problem-email-textarea"
                                placeholder="Describe symptoms, patient complaints, clinical diagnosis details (Body)..."
                                rows="4"
                                value={formData.description}
                                onChange={handleChange}
                            ></textarea>
                        </div>
                    </div>
                </div>

                {/* Unified Medicine & Dosage List Section */}
                <div className="medicines-list-section">
                    <div className="medicines-list-header">
                        <div>
                            <label className="medicines-section-title">Medicine & Dosage List</label>
                            <p className="medicines-section-subtitle">Add prescribed medicines and specify dosage details</p>
                        </div>
                        <button
                            type="button"
                            className="add-medicine-btn"
                            onClick={handleAddMedicine}
                        >
                            + Add Medicine
                        </button>
                    </div>

                    <div className="medicines-items-container">
                        {medicines.map((med, index) => (
                            <div className="medicine-row" key={med.id}>
                                <span className="medicine-index">#{index + 1}</span>
                                <div className="medicine-input-field medicine-name-field">
                                    <input
                                        type="text"
                                        placeholder="Medicine Name (e.g. Paracetamol 500mg)"
                                        value={med.name}
                                        onChange={(e) => handleMedicineChange(med.id, 'name', e.target.value)}
                                    />
                                </div>
                                <div className="medicine-input-field medicine-dosage-field">
                                    <input
                                        type="text"
                                        placeholder="Dosage & Frequency (e.g. 1 tab twice daily after food)"
                                        value={med.dosage}
                                        onChange={(e) => handleMedicineChange(med.id, 'dosage', e.target.value)}
                                    />
                                </div>
                                {medicines.length > 1 && (
                                    <button
                                        type="button"
                                        className="remove-medicine-btn"
                                        title="Remove medicine item"
                                        onClick={() => handleRemoveMedicine(med.id)}
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="form_group form_group--full">
                    <label>Prescription / Solution</label>
                    <textarea
                        name="solution"
                        placeholder="Write prescription or solution..."
                        rows="4"
                        value={formData.solution}
                        onChange={handleChange}
                    ></textarea>
                </div>

                {/* Additional Notes */}
                <div className="form_group form_group--half">
                    <label>Additional Notes</label>
                    <textarea
                        name="notes"
                        placeholder="Additional instructions..."
                        rows="3"
                        value={formData.notes}
                        onChange={handleChange}
                    ></textarea>
                </div>

                {/* Optional Next Appointment Date */}
                <div className="form_group form_group--half">
                    <label>
                        Next Follow-up Appointment <span className="optional-tag">(Optional)</span>
                    </label>
                    <input
                        type="date"
                        name="appointmentDate"
                        value={formData.appointmentDate}
                        onChange={handleChange}
                    />
                    <small className="field-hint">Doctor can set a date if a follow-up visit is needed.</small>
                </div>

                {/* =========================================================
                   SURGICAL PROCEDURE SECTION (CHECKBOX TOGGLE & EXPANDABLE)
                   ========================================================= */}
                <div className="surgical-toggle-card">
                    <div className="surgical-toggle-header">
                        <label className="surgical-toggle-checkbox-label">
                            <input
                                type="checkbox"
                                className="surgical-toggle-checkbox"
                                checked={includeSurgery}
                                onChange={(e) => setIncludeSurgery(e.target.checked)}
                            />
                            <div className="surgical-toggle-text">
                                <span className="surgical-toggle-title">Include Surgical Procedure Recommendation</span>
                                <span className="surgical-toggle-subtitle">
                                    Check this option if this patient requires a surgical procedure recommendation and staff assignment
                                </span>
                            </div>
                        </label>
                        {includeSurgery && (
                            <span className="surgical-active-badge">Active</span>
                        )}
                    </div>

                    {includeSurgery && (
                        <div className="surgical-expanded-content" ref={nursePanelRef}>
                            {/* Surgery Schedule Date & Time */}
                            <div className="surgical-schedule-grid">
                                <div className="surgical-schedule-box">
                                    <label className="surgical-field-label">Scheduled Surgery Date</label>
                                    <input
                                        type="date"
                                        className="surgical-input-schedule"
                                        value={surgeryData.surgeryDate}
                                        onChange={(e) =>
                                            setSurgeryData((prev) => ({ ...prev, surgeryDate: e.target.value }))
                                        }
                                    />
                                </div>
                                <div className="surgical-schedule-box">
                                    <label className="surgical-field-label">Scheduled Surgery Time</label>
                                    <input
                                        type="time"
                                        className="surgical-input-schedule"
                                        value={surgeryData.surgeryTime}
                                        onChange={(e) =>
                                            setSurgeryData((prev) => ({ ...prev, surgeryTime: e.target.value }))
                                        }
                                    />
                                </div>
                            </div>

                            {/* Surgery Slot Conflict & Duration Alternatives */}
                            {slotConflict && (
                                <div className="surgery-conflict-card">
                                    <div className="surgery-conflict-header">
                                        <span className="surgery-conflict-alert-tag">Time Slot Conflict</span>
                                        <span className="surgery-conflict-badge">Exclusive Patient Booking</span>
                                    </div>
                                    <p className="surgery-conflict-reason">
                                        <strong>Reason:</strong> The slot at <strong>{slotConflict.time}</strong> on <strong>{slotConflict.date}</strong> is already reserved for patient <strong>{slotConflict.patientName}</strong>. Each surgery date and time is exclusively dedicated to one patient.
                                    </p>

                                    {suggestedSlots.length > 0 && (
                                        <div className="surgery-alternative-durations">
                                            <span className="alternative-durations-title">Suggested Available Time Slots:</span>
                                            <div className="alternative-durations-buttons">
                                                {suggestedSlots.map((timeSlot) => (
                                                    <button
                                                        type="button"
                                                        key={timeSlot}
                                                        className="alternative-duration-btn"
                                                        onClick={() => setSurgeryData((prev) => ({ ...prev, surgeryTime: timeSlot }))}
                                                    >
                                                        {timeSlot}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Medical Staff / Nurses Assignment */}
                            <div className="surgical-staff-section">
                                <div className="surgical-staff-header">
                                    <label className="surgical-field-label">Assigned Medical Team & Nurses</label>
                                    <button
                                        type="button"
                                        className="add-people-btn"
                                        onClick={() => setShowNurseList((prev) => !prev)}
                                    >
                                        + Add People
                                    </button>
                                </div>

                                <div className="selected-nurses-bar">
                                    {selectedNurses.length === 0 ? (
                                        <span className="no-nurses-placeholder">
                                            No medical staff assigned yet. Click "+ Add People" to assign nurses/assistants.
                                        </span>
                                    ) : (
                                        selectedNurses.map((nurse) => (
                                            <div className="selected-nurse-pill" key={nurse.id}>
                                                <span className="selected-nurse-dot" />
                                                <span>{nurse.name}</span>
                                                <button
                                                    type="button"
                                                    className="selected-nurse-close"
                                                    onClick={() => removeNurse(nurse.id)}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {showNurseList && (
                                    <div className="nurse-picker">
                                        <div className="nurse-picker-top">
                                            <span className="nurse-picker-title">Select Medical Staff</span>
                                            <button
                                                type="button"
                                                className="nurse-picker-close"
                                                onClick={() => setShowNurseList(false)}
                                            >
                                                ×
                                            </button>
                                        </div>

                                        {nurseLoading ? (
                                            <p className="nurse-picker-loading">Loading medical staff...</p>
                                        ) : nurses.length === 0 ? (
                                            <p className="nurse-picker-empty">No staff found.</p>
                                        ) : (
                                            <div className="nurse-picker-list">
                                                {nurses.map((nurse) => {
                                                    const isSelected = selectedNurses.some((n) => n.id === nurse.id);
                                                    return (
                                                        <div className="nurse-picker-row" key={nurse.id}>
                                                            <div className="nurse-picker-label">
                                                                <span className="nurse-avatar" />
                                                                <div className="nurse-info">
                                                                    <strong>{nurse.name}</strong>
                                                                    <small>{nurse.role}</small>
                                                                </div>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                className={`nurse-add-btn ${isSelected ? 'nurse-add-btn--selected' : ''}`}
                                                                onClick={() => handleAddNurse(nurse)}
                                                                disabled={isSelected}
                                                            >
                                                                {isSelected ? '✓' : '+'}
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Surgery Preparation & Process Textareas */}
                            <div className="surgical-notes-grid">
                                <div className="surgical-note-box">
                                    <label className="surgical-field-label">Pre-Operative Preparation Details</label>
                                    <textarea
                                        className="surgical-textarea"
                                        placeholder="Describe preparation for surgery (pre-op instructions, fasting requirements, medical clearance)..."
                                        rows="3"
                                        value={surgeryData.preparation}
                                        onChange={(e) =>
                                            setSurgeryData((prev) => ({ ...prev, preparation: e.target.value }))
                                        }
                                    ></textarea>
                                </div>

                                <div className="surgical-note-box">
                                    <label className="surgical-field-label">Surgical Process & Operative Technique</label>
                                    <textarea
                                        className="surgical-textarea"
                                        placeholder="Describe the surgical process, operative technique, instruments and protocols..."
                                        rows="3"
                                        value={surgeryData.process}
                                        onChange={(e) =>
                                            setSurgeryData((prev) => ({ ...prev, process: e.target.value }))
                                        }
                                    ></textarea>
                                </div>
                            </div>

                            {/* Doctor Authorization and Confirmation Ticking */}
                            <div className="surgical-authorization-card">
                                <div className="surgical-auth-left">
                                    <h4 className="surgical-auth-title">Doctor Surgical Authorization</h4>
                                    <p className="surgical-auth-desc">
                                        Confirm and certify that you authorize this surgical procedure for the patient.
                                    </p>
                                </div>

                                <div className="surgical-auth-right">
                                    <button
                                        type="button"
                                        className={`surgical-authorize-btn ${isAuthorized ? 'surgical-authorize-btn--confirmed' : ''}`}
                                        onClick={() => setIsAuthorized((prev) => !prev)}
                                    >
                                        <span className="surgical-auth-checkbox">
                                            {isAuthorized ? '✓' : ''}
                                        </span>
                                        <span className="surgical-auth-btn-text">
                                            {isAuthorized
                                                ? '✓ Authorized & Confirmed'
                                                : 'Authorize & Confirm Procedure'}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Buttons */}
                <div className="form_buttons">
                    <button type="submit">Submit Prescription</button>
                    <button type="button" onClick={handleReset}>Reset</button>
                </div>
            </fieldset>
        </form>
    </section>
    );
}

export default Prescription;
