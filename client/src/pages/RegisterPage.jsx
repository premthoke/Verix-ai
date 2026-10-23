import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { registerAPI } from "../services/api";

// Shared styles — match LoginPage and existing dark glassmorphism design
const cardStyle = {
  background:     "rgba(255,255,255,0.05)",
  backdropFilter: "blur(20px)",
  border:         "1px solid rgba(255,255,255,0.1)",
  borderRadius:   "16px",
  padding:        "40px",
  maxWidth:       "420px",
  width:          "100%",
  color:          "white",
};

const inputStyle = {
  width:        "100%",
  padding:      "12px",
  marginTop:    "8px",
  marginBottom: "4px",
  borderRadius: "10px",
  border:       "1px solid rgba(255,255,255,0.12)",
  background:   "rgba(255,255,255,0.07)",
  color:        "white",
  fontSize:     "14px",
  outline:      "none",
  boxSizing:    "border-box",
};

const labelStyle = {
  fontSize: "13px",
  color:    "rgba(255,255,255,0.7)",
  display:  "block",
  marginTop:"14px",
};

const errorStyle = {
  background:   "rgba(255,80,80,0.15)",
  border:       "1px solid rgba(255,80,80,0.3)",
  borderRadius: "8px",
  padding:      "12px",
  color:        "#ff6b6b",
  fontSize:     "14px",
  marginBottom: "16px",
};

const RegisterPage = () => {
  const { login }  = useAuth();
  const navigate   = useNavigate();

  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState(null);
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // ── Client-side validation (mirrors backend constraints) ──────────────
    if (!name.trim() || !email.trim() || !password) {
      setError("Name, email, and password are all required.");
      return;
    }
    if (name.trim().length < 2 || name.trim().length > 100) {
      setError("Name must be between 2 and 100 characters.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await registerAPI(name.trim(), email.trim(), password);
      // res.data = { token, user: { id, name, email, createdAt } }
      login(res.data.token, res.data.user);
      navigate("/", { replace: true });
    } catch (err) {
      const msg = err.response?.data?.error || "Registration failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight:      "100vh",
      background:     "radial-gradient(circle at top, #0f172a, #020617)",
      display:        "flex",
      flexDirection:  "column",
      alignItems:     "center",
      justifyContent: "center",
      padding:        "40px 20px",
      fontFamily:     "Poppins, sans-serif",
    }}>
      <h2 style={{ color: "white", marginBottom: "28px", letterSpacing: "1px" }}>
        ⚡ Verix AI
      </h2>

      <div style={cardStyle}>
        <h3 style={{ margin: "0 0 6px" }}>Create account</h3>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "13px", margin: "0 0 24px" }}>
          Register to upload media and view your verification history.
        </p>

        {error && <div style={errorStyle}>❌ {error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <label style={labelStyle}>Name</label>
          <input
            style={inputStyle}
            type="text"
            autoComplete="name"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />

          <label style={labelStyle}>Email</label>
          <input
            style={inputStyle}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />

          <label style={labelStyle}>Password</label>
          <input
            style={inputStyle}
            type="password"
            autoComplete="new-password"
            placeholder="Min. 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading}
            style={{ marginTop: "24px", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#06b6d4", textDecoration: "none" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
