import React, { useState } from "react";
import axios from "axios";
import "./App.css";
import {
  RadialBarChart,
  RadialBar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";

// 🔥 YOUR LIVE BACKEND
const BASE_URL = "https://verix-backend.onrender.com";

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    if (selected) setPreview(URL.createObjectURL(selected));
  };

  const handleUpload = async () => {
    if (!file) return alert("Select file");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);

      const res = await axios.post(`${BASE_URL}/api/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      setResult(res.data);

    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!file) return alert("Select file");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(`${BASE_URL}/api/verify`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      alert(`Blockchain: ${res.data.result}`);

    } catch (err) {
      console.error(err);
      alert("Verification failed");
    }
  };

  // 📊 Chart Data
  const chartData = result
    ? [
        {
          name: "Confidence",
          value: result.ai.confidence * 100
        }
      ]
    : [];

  const barData = result
    ? [
        { name: "Real", value: result.ai.result === "Real" ? 100 : 0 },
        { name: "Fake", value: result.ai.result === "Fake" ? 100 : 0 }
      ]
    : [];

  return (
    <div className="app">

      {/* TOPBAR */}
      <div className="topbar">
        <h2>Deepfake Proof System</h2>
        <span className="status">● System Online</span>
      </div>

      <div className="layout">

        {/* LEFT PANEL */}
        <div className="panel">
          <h3>Upload Media</h3>

          <input type="file" onChange={handleFileChange} />

          {preview && (
            <img src={preview} className="preview" alt="preview" />
          )}

          <button onClick={handleUpload}>Run AI Detection</button>
          <button onClick={handleVerify}>Verify Blockchain</button>
        </div>

        {/* RIGHT PANEL */}
        <div className="panel">
          <h3>Analysis Dashboard</h3>

          {loading && <div className="loader"></div>}

          {result && (
            <>
              {/* RESULT */}
              <div className="result">
                <span
                  className={
                    result.ai.result === "Fake"
                      ? "fake"
                      : result.ai.result === "Real"
                      ? "real"
                      : "unknown"
                  }
                >
                  {result.ai.result}
                </span>
              </div>

              {/* 🔵 RADIAL CHART */}
              <RadialBarChart
                width={200}
                height={200}
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="100%"
                data={chartData}
              >
                <RadialBar dataKey="value" cornerRadius={10} />
                <Tooltip />
              </RadialBarChart>

              <p>
                Confidence: {Math.round(result.ai.confidence * 100)}%
              </p>

              {/* 📊 BAR CHART */}
              <BarChart width={250} height={150} data={barData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" />
              </BarChart>

              {/* HASH */}
              <div className="hash">
                <strong>Hash:</strong>
                <p>{result.hash}</p>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

export default App;