import React, { useState } from "react";
import Upload from "./components/Upload";
import "./App.css";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [verifyResult, setVerifyResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const downloadPDF = async () => {
    if (!result) return;

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Verix AI Verification Report", 20, 20);

    doc.setFontSize(12);
    doc.text(`Result: ${result.ai.result}`, 20, 40);
    doc.text(
      `Confidence: ${Math.round(result.ai.confidence * 100)}%`,
      20,
      50
    );

    const blockchainStatus =
      verifyResult?.status === "Verified"
        ? "Verified"
        : "Not Found";

    doc.text(`Blockchain: ${blockchainStatus}`, 20, 60);
    doc.text(`Hash: ${result.hash}`, 20, 70);

    doc.text(
      `Generated: ${new Date().toLocaleString()}`,
      20,
      80
    );

    // 🔥 QR FIX
    const qrData = `${window.location.origin}/verify?hash=${result.hash}`;
    const qrImage = await QRCode.toDataURL(qrData);

    doc.addImage(qrImage, "PNG", 140, 40, 50, 50);

    doc.save("verix-report.pdf");
  };

  return (
    <div className="app">

      {/* NAVBAR */}
      <div className="topbar">
        <h2>⚡ Verix AI</h2>

        <div style={{ display: "flex", gap: "15px" }}>
          <a href="/" style={{ color: "white" }}>Home</a>
          <a href="/history" style={{ color: "white" }}>History</a>
        </div>

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
          setVerifyResult={setVerifyResult}
        />

        {/* RIGHT */}
        <div className="panel result-panel">

          <h3>AI Analysis</h3>

          {loading && (
            <div className="loader-box">
              <div className="loader"></div>
              <p>Analyzing image...</p>
            </div>
          )}

          {preview && (
            <img src={preview} className="preview" alt="preview" />
          )}

          {result && !loading && (
            <>
              <div className={`badge ${result.ai.result.toLowerCase()}`}>
                {result.ai.result}
              </div>

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

              <div className="insight">
                <h4>AI Insight</h4>
                <p>
                  {result.ai.result === "Fake"
                    ? "AI manipulation detected."
                    : "Image appears natural."}
                </p>
              </div>

              <div className="hash">
                <strong>Hash:</strong>
                <p>{result.hash}</p>
              </div>

              {verifyResult && (
                <div className="verify-box">
                  <h4>🔐 Blockchain</h4>
                  <div className="verify success">
                    {verifyResult.status} → {verifyResult.result}
                  </div>
                </div>
              )}

              <button className="download-btn" onClick={downloadPDF}>
                📄 Download Certificate
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

export default App;