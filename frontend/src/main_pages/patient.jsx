import { Link } from "react-router-dom";
import ADDpatientImg from "./assets/Add_patient.svg";
import Allpatientimg from "./assets/All_patient.png";
import "./patient.css";

function Patient() {
  return (
    <div className="main-content">
      <div className="card-grid">

        <Link to="/patient/add_patient" className="card">
          <div className="card-icon">
            <img src={ADDpatientImg} alt="Add Patient" className="patientimg"/>
          </div>
          <p>Add Patient</p>
        </Link>

        <Link to="/patient/all_patients" className="card">
          <div className="card-icon">
            <img src={Allpatientimg} alt="All Patients" className="patientimg"/>
          </div>
          <p>All Patient</p>
        </Link>

      </div>
    </div>
  );
}

export default Patient;