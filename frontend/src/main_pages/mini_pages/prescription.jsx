import { useNavigate } from "react-router-dom";
import "./prescription.css";

function Prescription() {
    const navigate = useNavigate();

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
                    onClick={() => navigate('/consult_patient_list')}
                >
                    ← Back
                </button>
            </div>

            <form action="/consult_patient_list/prescription" className="form_prescription">
                <fieldset>
                    <legend>Prescription</legend>
                    <h2>Patient Prescription Form</h2>
                    <p>Fill out the prescription details carefully</p>

                {/* Patient Information */}
                <div className="form_group">
                    <label>Patient Name</label>
                    <input type="text" name="patientName" placeholder="Enter Patient Name"/>
                </div>

                <div className="form_group">
                    <label>Age</label>
                    <input type="number" name="age" placeholder="Enter Age"/>
                </div>


                {/* Problem Details */}
                <div className="form_group">
                    <label>Problem</label>
                    <input type="text" name="problem" placeholder="Mention Problem"/>
                </div>

                <div className="form_group">
                    <label>Description</label>
                    <textarea
                        name="description"
                        placeholder="Describe the Problem..."
                        rows="4"
                    ></textarea>
                </div>

                {/* Medicine Details */}
                <div className="form_group">
                    <label>Medicine Name</label>
                    <input type="text" name="medicine" placeholder="Enter Medicine Name"/>
                </div>

                <div className="form_group">
                    <label>Dosage</label>
                    <input type="text" name="dosage" placeholder="Example: 1 tablet twice a day"/>
                </div>

                <div className="form_group">
                    <label>Prescription / Solution</label>
                    <textarea name="solution" placeholder="Write prescription or solution..." rows="4"></textarea>
                </div>

                {/* Additional Notes */}
                <div className="form_group">
                    <label>Additional Notes</label>
                    <textarea name="notes" placeholder="Additional instructions..." rows="3"></textarea>
                </div>

                {/* Appointment Date */}
                <div className="form_group">
                    <label>Next Appointment</label>
                    <input type="date" name="appointmentDate"/>
                </div>

                {/* Buttons */}
                <div className="form_buttons">
                    <button type="submit">Submit Prescription</button>
                    <button type="reset">Reset</button>
                </div>
            </fieldset>
        </form>
    </section>
    )
}

export default Prescription;
