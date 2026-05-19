import React, { useEffect, useState } from "react";

import "./home.css";

export default function Home() {

    const [data, setData] = useState(null);

    useEffect(() => {
        fetch("http://127.0.0.1:5000/home")
            .then((response) => response.json())
            .then((result) => { setData(result); })
            .catch((error) => { console.error("Fetch error:", error); });
    }, []);

    return (
        <>
            <div className="home-container">
                <h1>Welcome to Home</h1>
                <p2>A Hospital Information System (HIS) is a comprehensive, computer-based system used in hospitals to manage and organize all aspects of healthcare operations.
                    It integrates clinical, administrative, and financial data to ensure smooth coordination between different departments such as outpatient services, inpatient care,
                    laboratory, pharmacy, and billing. By digitizing patient records and workflows, HIS allows healthcare professionals to quickly access accurate medical histories,
                    test results, and treatment plans, which improves decision-making and reduces medical errors. It also helps hospital staff streamline tasks like appointment scheduling,
                    resource allocation, and inventory management. Overall, a Hospital Information System enhances efficiency, improves patient care quality, and supports better communication
                    the entire healthcare facility.</p2>
            </div>
            <div className="reviews">
                <div className="review-card">
                    <div className="review-top">
                        <img src="https://i.pravatar.cc/50?img=12" alt="Dr. James" />

                        <div>
                            <h4>Dr. James</h4>
                            <span>Cardiologist</span>
                        </div>
                    </div>

                    <p>
                        “The system improved appointment handling and patient management
                        significantly.”
                    </p>
                </div>

                <div className="review-card">
                    <div className="review-top">
                        <img src="https://i.pravatar.cc/50?img=32" alt="Dr. Sophia" />

                        <div>
                            <h4>Dr. Sophia</h4>
                            <span>Neurologist</span>
                        </div>
                    </div>

                    <p>
                        “A reliable and user-friendly platform that streamlined our daily
                        hospital operations.”
                    </p>
                </div>

                <div className="review-card">
                    <div className="review-top">
                        <img src="https://i.pravatar.cc/50?img=45" alt="Dr. Michael" />

                        <div>
                            <h4>Dr. Michael</h4>
                            <span>Pediatrician</span>
                        </div>
                    </div>

                    <p>
                        “Managing patient records and appointments has become faster and far
                        more efficient.”
                    </p>
                </div>
            </div>
        </>
    );
}