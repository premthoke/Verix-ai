import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// Use VITE_API_URL if configured in environment (Vercel / local .env),
// otherwise fall back to the deployed backend URL.
const API_BASE = import.meta.env.VITE_API_URL || "https://verix-ai-1doz.onrender.com/api";

const VerifyPage = () => {
  const { verificationId } = useParams();
  const [data, setData]     = useState(null);
  const [error, setError]   = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!verificationId) return;

    const fetchVerification = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/verify/${verificationId}`);
        const json = await res.json();

        if (!res.ok) {
          setError(json.error || "Verification not found");
        } else {
          setData(json);
        }
      } catch (err) {
        setError("Could not reach the verification server");
      } finally {
        setLoading(false);
      }
    };

    fetchVerification();
  }, [verificationId]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #0f0f1a 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
      fontFamily: "sans-serif"
    }}>
      <div style={{
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "16px",
        padding: "40px",
        maxWidth: "600px",
        width: "100%",
        color: "white"
      }}>
        <h2 style={{ marginBottom: "8px" }}>🔍 Verification Result</h2>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", marginBottom: "24px", wordBreak: "break-all" }}>
          ID: {verificationId}
        </p>

        {loading && (
          <p style={{ color: "rgba(255,255,255,0.6)" }}>Loading...</p>
        )}

        {error && (
          <div style={{
            background: "rgba(255,80,80,0.15)",
            border: "1px solid rgba(255,80,80,0.3)",
            borderRadius: "8px",
            padding: "16px",
            color: "#ff6b6b"
          }}>
            ❌ {error}
          </div>
        )}

        {data && !loading && (
          <>
            {/* Result badge */}
            <div style={{
              display: "inline-block",
              padding: "6px 20px",
              borderRadius: "20px",
              fontWeight: "bold",
              fontSize: "18px",
              marginBottom: "24px",
              background: data.result === "Real"
                ? "rgba(0,255,150,0.15)"
                : "rgba(255,80,80,0.15)",
              border: `1px solid ${data.result === "Real" ? "rgba(0,255,150,0.4)" : "rgba(255,80,80,0.4)"}`,
              color: data.result === "Real" ? "#00ff96" : "#ff6b6b"
            }}>
              {data.result === "Real" ? "✅ Authentic" : "⚠️ AI Generated / Fake"}
            </div>

            {/* Details */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={rowStyle}>
                <span style={labelStyle}>Confidence</span>
                <span style={valueStyle}>{Math.round(data.confidence * 100)}%</span>
              </div>
              <div style={rowStyle}>
                <span style={labelStyle}>SHA-256 Hash</span>
                <span style={{ ...valueStyle, fontSize: "11px", wordBreak: "break-all" }}>{data.hash}</span>
              </div>
              <div style={rowStyle}>
                <span style={labelStyle}>Verified At</span>
                <span style={valueStyle}>{new Date(data.verifiedAt).toLocaleString()}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const rowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  padding: "10px 0",
  borderBottom: "1px solid rgba(255,255,255,0.07)",
  gap: "16px"
};
const labelStyle = { color: "rgba(255,255,255,0.5)", fontSize: "13px", flexShrink: 0 };
const valueStyle = { color: "white", fontSize: "14px", textAlign: "right" };

export default VerifyPage;