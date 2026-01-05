import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await login(email, password);
      localStorage.setItem('accessToken', data.accessToken);
      navigate('/editor');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#0f172a",
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{
        backgroundColor: "#1e293b",
        padding: "2.5rem",
        borderRadius: "1rem",
        width: "100%",
        maxWidth: "400px",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
      }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <img src="/favicon.png" alt="Logo" style={{ width: "60px", marginBottom: "1rem" }} />
          <h2 style={{ color: "#f8fafc", margin: 0 }}>Welcome Back</h2>
          <p style={{ color: "#94a3b8", marginTop: "0.5rem" }}>Sign in to continue to the Editor</p>
        </div>

        {error && (
          <div style={{
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            color: "#ef4444",
            padding: "0.75rem",
            borderRadius: "0.5rem",
            marginBottom: "1.5rem",
            fontSize: "0.875rem",
            textAlign: "center"
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ display: "block", color: "#e2e8f0", marginBottom: "0.5rem", fontSize: "0.875rem" }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "0.5rem",
                border: "1px solid #334155",
                backgroundColor: "#0f172a",
                color: "white",
                outline: "none",
                fontSize: "1rem"
              }}
            />
          </div>
          <div style={{ marginBottom: "2rem" }}>
            <label style={{ display: "block", color: "#e2e8f0", marginBottom: "0.5rem", fontSize: "0.875rem" }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "0.5rem",
                border: "1px solid #334155",
                backgroundColor: "#0f172a",
                color: "white",
                outline: "none",
                fontSize: "1rem"
              }}
            />
          </div>
          <button type="submit" style={{
            width: "100%",
            padding: "0.875rem",
            background: "linear-gradient(135deg, #41D1FF 0%, #BD34FE 100%)",
            color: "white",
            border: "none",
            borderRadius: "0.5rem",
            fontWeight: "600",
            fontSize: "1rem",
            cursor: "pointer",
            transition: "opacity 0.2s"
          }}>
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
