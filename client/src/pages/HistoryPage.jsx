import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { historyAPI } from "../services/api";

const HistoryPage = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Redirect immediately if not logged in
    if (!token) {
      navigate("/login", { state: { from: "/history" }, replace: true });
      return;
    }

    historyAPI(token)
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("History fetch error:", err.message);
        setLoading(false);

        if (err.response?.status === 401) {
          logout();
          navigate("/login", { state: { from: "/history" }, replace: true });
        } else {
          setError(err.response?.data?.error || "Failed to load history. Please try again.");
        }
      });
  }, [token, navigate, logout]);

  const filtered = data.filter(
    (item) =>
      item.hash.toLowerCase().includes(search.toLowerCase()) ||
      item.result.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: "20px", color: "white" }}>
      <h2>📜 Verification History</h2>

      {/* SEARCH */}
      <input
        placeholder="Search by hash or result..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "12px",
          marginTop: "10px",
          borderRadius: "12px",
          border: "none",
          outline: "none",
          background: "rgba(255,255,255,0.08)",
          color: "white"
        }}
      />

      {/* LOADING */}
      {loading && (
        <p style={{ marginTop: "20px", opacity: 0.7 }}>
          Loading history...
        </p>
      )}

      {/* ERROR */}
      {!loading && error && (
        <div style={{
          marginTop: "20px",
          padding: "14px",
          borderRadius: "12px",
          background: "rgba(239,68,68,0.12)",
          border: "1px solid rgba(239,68,68,0.35)",
          color: "#fca5a5"
        }}>
          {error}
        </div>
      )}

      {/* NO DATA */}
      {!loading && !error && filtered.length === 0 && (
        <p style={{ marginTop: "20px", opacity: 0.7 }}>
          No history found
        </p>
      )}

      {/* DATA */}
      {!loading &&
        filtered.map((item, index) => (
          <div
            key={index}
            style={{
              marginTop: "15px",
              padding: "15px",
              borderRadius: "14px",
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.08)",
              transition: "0.3s"
            }}
          >
            <p>
              <strong>Result:</strong>{" "}
              <span
                style={{
                  color:
                    item.result === "Fake"
                      ? "#ff4d4d"
                      : item.result === "Suspicious"
                      ? "#facc15"
                      : "#22c55e"
                }}
              >
                {item.result}
              </span>
            </p>

            <p>
              <strong>Confidence:</strong>{" "}
              {Math.round(item.confidence * 100)}%
            </p>

            <p style={{ wordBreak: "break-all" }}>
              <strong>Hash:</strong> {item.hash}
            </p>

            <p style={{ opacity: 0.7 }}>
              <strong>Time:</strong>{" "}
              {new Date(item.time).toLocaleString()}
            </p>
          </div>
        ))}
    </div>
  );
};

export default HistoryPage;
