import React, { useEffect, useState } from 'react';
import './home.css';

export default function Home() {
  const [data, setData] = useState(null);
  useEffect(() => {
    document.title = 'Nuzoviya | Home';
    fetch('http://127.0.0.1:5000/home')
      .then((response) => response.json())
      .then((result) => {
        setData(result);
      })
      .catch((error) => {
        console.error('Fetch error:', error);
      });
  }, []);

  return (
    <div className="home-page-wrapper">
      <main className="home-container">
        <h1>Welcome to Nuzoviya</h1>

        <p>
          Nuzoviya is a healthcare technology platform focused on
          <strong> connected care, digital workflows, and intelligent health data</strong>.
        </p>

        <p>
          The platform introduces core workflows for
          <strong> doctors, reception, laboratory, radiology, booking,
          scheduling, and healthcare forms</strong>.
        </p>

        <p>
          Our current focus is on
          <strong> frontend development, document management, and file-saving workflows</strong>,
          while backend services and integrations continue to evolve.
        </p>

        <p>
          Beyond product development, Nuzoviya is driven by research in
          <strong> bioinformatics, healthcare, computational science, and human health</strong>.
        </p>

        <p>
          <strong>Building healthcare technology. Exploring new possibilities.</strong>
        </p>

        <p className="contact-text">
          For collaboration, research, development, or more information,
          please get in touch with us.
        </p>
      </main>
    </div>
  );
}
