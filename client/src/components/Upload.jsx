import React, { useState } from "react";

const Upload = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file); // ✅ correct key

      const res = await fetch(
        "https://verix-ai-1doz.onrender.com/api/upload",
        {
          method: "POST",
          body: formData
        }
      );

      const data = await res.json();

      console.log("UPLOAD RESPONSE:", data);

      setResult(data);

    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      alert("Upload failed");
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />

      <button onClick={handleUpload}>
        Analyze Media
      </button>

      {result && (
        <div>
          <h3>Result: {result.ai.result}</h3>
          <p>Confidence: {Math.round(result.ai.confidence * 100)}%</p>
          <p>Hash: {result.hash}</p>
        </div>
      )}
    </div>
  );
};

export default Upload;