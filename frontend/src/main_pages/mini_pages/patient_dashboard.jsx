import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import "./patient_dashboard.css";




function PatientDashboard () {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPatients = () => {
        setLoading(true);
        fetch("http://127.0.0.1:5000/patient/all_patients")
            .then((res) => res.json())
            .then((data) => {
                setPatients(Array.isArray(data) ? data : []);
                setLoading(false);
            })  
            .catch((error) => {
                console.error("Error fetching patients:", error);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    return (
        <section className="patient-dasboard-option">
            <div className="patient-dasboard">
                <div className="patient-details">
                    <p>
                        <span className="patientdash-name">ID Number: </span>
                        <span className="patientdash-info">12345</span>

                    </p>
                    <p>
                        <h2 className="patientdash-name">Patient Name: John Doe</h2>
                    </p>
                    <p>
                        <span className="patientdash-name">Age: </span>
                        <span className="patientdash-info">30</span>
                    </p>
                </div>
                <hr className="vertical-line" ></hr>
                <div className="patientdash-verticalbar">
                    <Link to="" className="patientdash-links">Bload Checkup</Link>
                    <Link to="" className="patientdash-links">Eye Checkup</Link>
                    <Link to="" className="patientdash-links">X-Ray Checkup</Link>
                    <Link to="" className="patientdash-links">Other</Link>
                </div>
            </div>

            <div className="options">
                <Link to="/cosult_patient_list/</id>.dasboard/prescription" className="options-links">Precription</Link>
                <Link to="" className="options-links">Surgical Procedure</Link>
                <Link to="" className="options-links">Feedback</Link>


            </div>

        </section>
    );
}

export default PatientDashboard;