import React from "react";
import { motion } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";
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

  const chartData = result
    ? [{ name: "Confidence", value: result.ai.confidence * 100 }]
    : [];

  const barData = result
    ? [
        { name: "Real", value: result.ai.result === "Real" ? 100 : 0 },
        { name: "Fake", value: result.ai.result === "Fake" ? 100 : 0 }
      ]
    : [];

  return (
    <div className="panel">

      {/* 🔥 Heading */}
      <h3 style={{ marginBottom: "10px" }}>
        📊 AI + Blockchain Analysis
      </h3>

      {/* 🔄 Animated Loader */}
      {loading && (
        <motion.div
          className="loader"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
      )}

      {preview && (
        <img src={preview} className="preview" alt="preview" />
      )}

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >

          {/* RESULT BADGE */}
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

          {/* 🔥 Animated Charts */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >

            <RadialBarChart width={200} height={200} data={chartData}>
              <RadialBar dataKey="value" />
              <Tooltip />
            </RadialBarChart>

            <p>Confidence: {Math.round(result.ai.confidence * 100)}%</p>

            <BarChart width={250} height={150} data={barData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" />
            </BarChart>

          </motion.div>

          {/* 🔐 HASH + QR */}
          <div className="hash">
            <strong>Hash:</strong>
            <p>{result.hash}</p>
{/* <QRCodeCanvas value={result.hash} size={100} /> */}
            <QRCodeCanvas value={result.hash} size={100} />
            <p style={{ fontSize: "12px", opacity: 0.6 }}>
              Scan to verify
            </p>
          </div>

        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;