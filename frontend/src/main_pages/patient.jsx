import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ADDpatientImg from "./assets/add_patient.svg";
import Allpatientimg from "./assets/all_patient.png";
import "./patient.css";

function Patient() {
  const [data, setData] = useState(null);
      
      useEffect(() => {
      fetch("http://127.0.0.1:5000/patient")
          .then((response) => response.json())
          .then((result) => {setData(result);})
          .catch((error) => {console.error("Fetch error:", error);});
      }, []);


  return (
    <div className="patient-main-content">
      <div className="patient-card-grid">

        <Link to="/patient/add_patient" className="patient-card">
          <div className="patient-card-icon">
            <img src={ADDpatientImg} alt="Add Patient" className="patientimg"/>
          </div>
          <p>Add Patient</p>
        </Link>

        <Link to="/patient/all_patients" className="patient-card">
          <div className="patient-card-icon">
            <img src={Allpatientimg} alt="All Patients" className="patientimg"/>
          </div>
          <p>All Patient</p>
        </Link>

      </div>
    </div>
  );
}

export default Patient;