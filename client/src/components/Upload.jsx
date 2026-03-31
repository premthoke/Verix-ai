import React from "react";
import { useDropzone } from "react-dropzone";
import { uploadAPI, verifyAPI } from "../services/api";

const Upload = ({
  file,
  setFile,
  setPreview,
  setResult,
  setLoading,
  setVerifyResult
}) => {

  const onDrop = (acceptedFiles) => {
    if (!acceptedFiles || acceptedFiles.length === 0) return;

    const selected = acceptedFiles[0];
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: false,
    accept: { "image/*": [] }
  });

  const handleUpload = async () => {
  try {
    const formData = new FormData();

    formData.append("file", selectedFile); // MUST be "file"

    const res = await fetch("https://verix-ai-1doz.onrender.com/api/upload", {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    console.log("UPLOAD RESPONSE:", data);

  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    alert("Upload failed");
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

      <button onClick={handleUpload}>🚀 Analyze Media</button>
      <button onClick={handleVerify}>🔐 Verify Authenticity</button>
    </div>
  );
};

export default Upload;