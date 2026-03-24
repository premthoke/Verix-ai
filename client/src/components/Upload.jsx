import React from "react";
import { useDropzone } from "react-dropzone";
import { uploadAPI, verifyAPI } from "../services/api";

const Upload = ({ file, setFile, setPreview, setResult, setLoading }) => {

  const onDrop = (acceptedFiles) => {
    if (!acceptedFiles || acceptedFiles.length === 0) return;

    const selected = acceptedFiles[0];
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "image/*": []
    }
  });

  const handleUpload = async () => {
    if (!file) return alert("Select file");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const res = await uploadAPI(formData);
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
      const res = await verifyAPI(formData);
      alert(`Blockchain: ${res.data.result}`);
    } catch (err) {
      console.error(err);
      alert("Verification failed");
    }
  };

  return (
    <div className="panel">
      <h3>Upload Media</h3>

      {/* 🔥 DROPZONE */}
      <div {...getRootProps()} className="dropzone">
        <input {...getInputProps()} />
        <p>📂 Drag & drop image here or click</p>
      </div>

      {/* 📄 FILE NAME */}
      {file && (
        <p style={{ marginTop: "10px", opacity: 0.7 }}>
          📄 {file.name}
        </p>
      )}

      {/* 🚀 BUTTONS */}
      <button onClick={handleUpload}>🚀 Analyze Media</button>
      <button onClick={handleVerify}>🔐 Verify Authenticity</button>
    </div>
  );
};

export default Upload;