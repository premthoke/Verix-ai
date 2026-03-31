import React, { useEffect, useState } from "react";
import axios from "axios";

const HistoryPage = () => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000/api/history")
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, []);

  const filtered = data.filter(item =>
    item.hash.includes(search) || item.result.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: "20px", color: "white" }}>
      <h2>📜 Verification History</h2>

      <input
        placeholder="Search by hash or result..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginTop: "10px",
          borderRadius: "10px",
          border: "none",
          outline: "none"
        }}
      />

      {filtered.length === 0 ? (
        <p style={{ marginTop: "20px" }}>No history found</p>
      ) : (
        filtered.map((item, index) => (
          <div
            key={index}
            style={{
              marginTop: "15px",
              padding: "15px",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(10px)"
            }}
          >
            <p><strong>Result:</strong> {item.result}</p>
            <p><strong>Confidence:</strong> {Math.round(item.confidence * 100)}%</p>
            <p><strong>Hash:</strong> {item.hash}</p>
            <p><strong>Time:</strong> {new Date(item.time).toLocaleString()}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default HistoryPage;