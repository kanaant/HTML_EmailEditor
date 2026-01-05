import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="landing-container" style={{
      fontFamily: "'Inter', sans-serif",
      backgroundColor: "#0f172a",
      color: "#f8fafc",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem"
    }}>
      <div style={{ textAlign: "center", maxWidth: "800px" }}>
        <img src="/favicon.png" alt="Logo" style={{ width: "100px", marginBottom: "1.5rem" }} />
        <h1 style={{ 
          fontSize: "3.5rem", 
          fontWeight: "800", 
          marginBottom: "1rem",
          background: "linear-gradient(to right, #41D1FF, #BD34FE)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>
          HTML Email Editor
        </h1>
        <p style={{ fontSize: "1.25rem", color: "#94a3b8", marginBottom: "3rem", lineHeight: "1.6" }}>
          The professional visual builder for responsive HTML emails. <br/>
          Create, edit, and export production-ready code in minutes.
        </p>
        
        <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center" }}>
          <a href="https://maquifit.darksenses.com/docs" target="_blank" rel="noopener noreferrer" style={{
            padding: "1rem 2rem",
            backgroundColor: "#1e293b",
            color: "#fff",
            borderRadius: "0.5rem",
            textDecoration: "none",
            fontWeight: "600",
            transition: "all 0.2s",
            border: "1px solid #334155"
          }}>
            Read Documentation
          </a>
          <Link to="/editor" style={{
            padding: "1rem 2rem",
            background: "linear-gradient(135deg, #41D1FF 0%, #BD34FE 100%)",
            color: "#fff",
            borderRadius: "0.5rem",
            textDecoration: "none",
            fontWeight: "600",
            boxShadow: "0 4px 14px 0 rgba(0,118,255,0.39)"
          }}>
            Open Editor
          </Link>
        </div>
      </div>
      
      <div style={{ marginTop: "4rem", color: "#475569", fontSize: "0.875rem" }}>
        &copy; {new Date().getFullYear()} HTML Email Editor. All rights reserved.
      </div>
    </div>
  );
};

export default LandingPage;
