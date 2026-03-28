import React, { useState } from "react";
import Upload from "./components/Upload";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="app">

      {/* 🔥 NAVBAR */}
      <div className="topbar">
        <h2>⚡ Verix — Deepfake Proof System</h2>
        <span className="status">● System Online</span>
      </div>

      <div className="layout">

        {/* LEFT */}
        <Upload
          file={file}
          setFile={setFile}
          setPreview={setPreview}
          setResult={setResult}
          setLoading={setLoading}
        />

        {/* RIGHT */}
        <div className="panel">
          <h3>AI + Blockchain Analysis</h3>

          {loading && <div className="loader"></div>}

          {preview && (
            <img src={preview} className="preview" />
          )}

          {result && (
            <>
              <div className="result">
                <span className={result.ai.result === "Fake" ? "fake" : "real"}>
                  {result.ai.result}
                </span>
              </div>

              <p>Confidence: {Math.round(result.ai.confidence * 100)}%</p>

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