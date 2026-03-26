import React from "react";
import QRCode from "react-qr-code";
import { motion } from "framer-motion";
import {
  RadialBarChart,
  RadialBar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";

const Dashboard = ({ preview, result, loading }) => {

  // ✅ SAFE DATA
  const confidenceRaw = result?.ai?.confidence ?? 0;
  const confidence = Math.round(confidenceRaw * 100);

  const aiResult = result?.ai?.result ?? "Unknown";

  // ✅ CHART DATA
  const chartData = [
    { name: "Confidence", value: confidence }
  ];

  const barData = [
    { name: "Real", value: aiResult === "Real" ? 100 : 0 },
    { name: "Fake", value: aiResult === "Fake" ? 100 : 0 }
  ];

  return (
    <div className="panel">

      {/* 🔥 HEADER */}
      <h3 style={{ marginBottom: "10px" }}>
        📊 AI + Blockchain Analysis
      </h3>

      {/* 🔄 LOADER */}
      {loading && (
        <motion.div
          className="loader"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
      )}

      {/* 🖼 IMAGE PREVIEW */}
      {preview && (
        <img src={preview} className="preview" alt="preview" />
      )}

      {/* 🚀 RESULT */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >

          {/* 🧠 RESULT BADGE */}
          <div className="result">
            <span
              className={
                aiResult === "Fake"
                  ? "fake"
                  : aiResult === "Real"
                  ? "real"
                  : "unknown"
              }
            >
              {aiResult}
            </span>
          </div>

          {/* 📊 CHART SECTION */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >

            {/* 🔵 RADIAL */}
            <RadialBarChart
              width={200}
              height={200}
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="100%"
              data={chartData}
            >
              <RadialBar dataKey="value" />
              <Tooltip />
            </RadialBarChart>

            {/* 📊 CONFIDENCE */}
            <p>Confidence: {confidence}%</p>

            {/* 📊 BAR */}
            <BarChart width={250} height={150} data={barData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" />
            </BarChart>

          </motion.div>

          {/* 🔐 HASH + QR */}
          {result?.hash && (
            <div className="hash">
              <strong>Hash:</strong>
              <p>{result.hash}</p>

              {/* ✅ QR (STABLE LIB) */}
              <QRCode
                value={String(result.hash)}
                size={100}
                style={{ marginTop: "10px" }}
              />

              <p style={{ fontSize: "12px", opacity: 0.6 }}>
                Scan to verify
              </p>
            </div>
          )}

        </motion.div>
      )}

    </div>
  );
};

export default Dashboard;