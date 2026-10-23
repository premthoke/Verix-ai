import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginAPI } from "../services/api";

// ── Shared glassmorphism card style (matches existing VerifyPage / HistoryPage) ─
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

const LoginPage = () => {
  const { login }    = useAuth();
  const navigate     = useNavigate();
  const location     = useLocation();

  // Redirect to where the user came from (e.g. /history), default to /
  const from = location.state?.from || "/";

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState(null);
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // ── Client-side validation ─────────────────────────────────────────────
    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    try {
      const res = await loginAPI(email.trim(), password);
      // res.data = { token, user: { id, name, email, createdAt } }
      login(res.data.token, res.data.user);
      navigate(from, { replace: true });
    } catch (err) {
      // axios wraps HTTP errors — extract the backend message safely
      const msg = err.response?.data?.error || "Login failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight:       "100vh",
      background:      "radial-gradient(circle at top, #0f172a, #020617)",
      display:         "flex",
      flexDirection:   "column",
      alignItems:      "center",
      justifyContent:  "center",
      padding:         "40px 20px",
      fontFamily:      "Poppins, sans-serif",
    }}>
      {/* Logo / brand */}
      <h2 style={{ color: "white", marginBottom: "28px", letterSpacing: "1px" }}>
        ⚡ Verix AI
      </h2>

      <div style={cardStyle}>
        <h3 style={{ margin: "0 0 6px" }}>Sign in</h3>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "13px", margin: "0 0 24px" }}>
          Access your verification history and upload files.
        </p>

        {error && <div style={errorStyle}>❌ {error}</div>}

        <form onSubmit={handleSubmit} noValidate>
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
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading}
            style={{ marginTop: "24px", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>
          No account?{" "}
          <Link to="/register" style={{ color: "#06b6d4", textDecoration: "none" }}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
