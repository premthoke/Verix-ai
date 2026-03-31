import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import fs from "fs";

import uploadRoutes from "./routes/uploadRoutes.js";
import verifyRoutes from "./routes/verifyRoutes.js";
import historyRoutes from "./routes/history.js";

const app = express();

app.use(cors());
app.use(express.json());

// create uploads folder if not exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// routes
app.use("/api/upload", uploadRoutes);
app.use("/api/verify", verifyRoutes);
app.use("/api/history", historyRoutes);

app.get("/", (req, res) => {
  res.send("Backend Running 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});