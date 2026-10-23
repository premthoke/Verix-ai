import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { uploadAPI, verifyAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const Upload = ({
  file,
  setFile,
  setPreview,
  setResult,
  setLoading,
  setVerifyResult
}) => {
  const { token, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const [uploadError, setUploadError] = useState(null);

  const onDrop = (acceptedFiles) => {
    if (!acceptedFiles || acceptedFiles.length === 0) return;

    const selected = acceptedFiles[0];
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setUploadError(null);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: false,
    accept: { "image/*": [] }
  });

  const handleUpload = async () => {
    if (!file) return alert("Select file");

    setUploadError(null);

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);

      const res = await uploadAPI(formData, token);
      const data = res.data;

      console.log("UPLOAD RESPONSE:", data);

      // ✅ SAFE SET
      if (data?.ai) {
        setResult(data);
      } else {
        setUploadError(data?.error || "Upload failed");
      }

    } catch (err) {
      console.error("UPLOAD ERROR:", err.message);
      if (err.response?.status === 401) {
        // Token expired or invalid — clear session and redirect to login
        logout();
        navigate("/login", { state: { from: "/" } });
      } else if (err.response?.status === 503) {
        setUploadError("AI service temporarily unavailable. Please try again.");
      } else {
        setUploadError(err.response?.data?.error || "Upload failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!file) return alert("Select file");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await verifyAPI(formData);
      setVerifyResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Verification failed");
    }
  };

  return (
    <div className="panel">
      <h3>Upload Media</h3>

      <div {...getRootProps()} className="dropzone">
        <input {...getInputProps()} />
        <p>📂 Drag & drop image here or click</p>
      </div>

      {file && <p className="filename">📄 {file.name}</p>}

      {uploadError && (
        <div style={{
          marginTop: "10px",
          padding: "10px 14px",
          borderRadius: "10px",
          background: "rgba(239,68,68,0.15)",
          border: "1px solid rgba(239,68,68,0.4)",
          color: "#fca5a5",
          fontSize: "0.88rem"
        }}>
          {uploadError}
        </div>
      )}

      {isLoggedIn ? (
        <button onClick={handleUpload}>🚀 Analyze Media</button>
      ) : (
        <div style={{
          marginTop: "12px",
          padding: "12px 14px",
          borderRadius: "12px",
          background: "rgba(99,102,241,0.12)",
          border: "1px solid rgba(99,102,241,0.35)",
          color: "#c7d2fe",
          fontSize: "0.9rem",
          textAlign: "center"
        }}>
          <Link to="/login" style={{ color: "#818cf8", textDecoration: "underline", fontWeight: 600 }}>
            Log in
          </Link>
          {" "}to analyze media
        </div>
      )}

      <button onClick={handleVerify}>🔐 Verify Authenticity</button>
    </div>
  );
};

export default Upload;
