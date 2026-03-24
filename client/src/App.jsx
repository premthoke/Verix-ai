import React, { useState } from "react";
import "./App.css";

import Navbar from "./components/Navbar";
import Upload from "./components/Upload";
import Dashboard from "./pages/Dashboard"; // ✅ FIXED PATH

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="app">
      <Navbar />

      <div className="layout">
        <Upload
          file={file}
          setFile={setFile}
          setPreview={setPreview}
          setResult={setResult}
          setLoading={setLoading}
        />

        <Dashboard
          preview={preview}
          result={result}
          loading={loading}
        />
      </div>
    </div>
  );
}

export default App;