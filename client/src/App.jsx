import React, { useState } from "react";
import Upload from "./components/Upload";
import "./App.css";
import jsPDF from "jspdf";

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔥 CERTIFICATE STYLE PDF
  const downloadPDF = (data) => {
    const doc = new jsPDF();

    // HEADER
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 30, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text("Verix AI Verification Report", 20, 18);

    doc.setTextColor(0, 0, 0);

    // SECTION TITLE
    doc.setFontSize(14);
    doc.text("Analysis Result", 20, 50);

    // RESULT BOX
    doc.setDrawColor(200);
    doc.rect(20, 55, 170, 30);

    doc.setFontSize(12);
    doc.text(`Result: ${data.ai.result}`, 25, 65);
    doc.text(
      `Confidence: ${(data.ai.confidence * 100).toFixed(2)}%`,
      25,
      75
    );

    // HASH
    doc.setFontSize(14);
    doc.text("Blockchain Hash", 20, 105);

    doc.setFontSize(10);
    doc.text(data.hash, 20, 115, { maxWidth: 170 });

    // TIME
    doc.setFontSize(12);
    doc.text(
      `Generated on: ${new Date().toLocaleString()}`,
      20,
      140
    );

    // FOOTER
    doc.setTextColor(100);
    doc.setFontSize(10);
    doc.text(
      "Powered by Verix AI — Deepfake Detection System",
      20,
      280
    );

    doc.save("verix-report.pdf");
  };

  return (
    <div className="app">

      {/* NAVBAR */}
      <div className="topbar">
        <h2>⚡ Verix AI</h2>
        <span className="status">● System Online</span>
      </div>

      <div className="layout">

        {/* LEFT PANEL */}
        <Upload
          file={file}
          setFile={setFile}
          setPreview={setPreview}
          setResult={setResult}
          setLoading={setLoading}
        />

        {/* RIGHT PANEL */}
        <div className="panel result-panel">

          <h3>AI Analysis</h3>

          {/* LOADING */}
          {loading && (
            <div className="loader-box">
              <div className="loader"></div>
              <p>Analyzing image... Detecting patterns...</p>
            </div>
          )}

          {/* IMAGE PREVIEW */}
          {preview && (
            <img src={preview} className="preview" alt="preview" />
          )}

          {/* RESULT */}
          {result && !loading && (
            <>
              {/* RESULT BADGE */}
              <div className={`badge ${result.ai.result.toLowerCase()}`}>
                {result.ai.result}
              </div>

              {/* CONFIDENCE CIRCLE */}
              <div className="circle">
                <svg>
                  <circle cx="70" cy="70" r="60"></circle>
                  <circle
                    cx="70"
                    cy="70"
                    r="60"
                    style={{
                      strokeDashoffset:
                        377 - (377 * result.ai.confidence),
                    }}
                  ></circle>
                </svg>
                <div className="percent">
                  {Math.round(result.ai.confidence * 100)}%
                </div>
              </div>

              {/* AI INSIGHT */}
              <div className="insight">
                <h4>AI Insight</h4>
                <p>
                  {result.ai.result === "Fake"
                    ? "Possible AI-generated artifacts detected. Edges and textures show irregularities."
                    : result.ai.result === "Suspicious"
                    ? "Some inconsistencies detected. Further validation recommended."
                    : "No strong AI manipulation detected. Image appears natural and consistent."}
                </p>
              </div>

              {/* HASH */}
              <div className="hash">
                <strong>Hash:</strong>
                <p>{result.hash}</p>
              </div>

              {/* PDF BUTTON */}
              <button onClick={() => downloadPDF(result)}>
                📄 Download PDF Report
              </button>
            </>
          )}

        </div>

      </div>
    </div>
  );
}

export default App;