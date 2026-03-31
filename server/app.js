import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import uploadRoutes from "./routes/uploadRoutes.js";
import verifyRoutes from "./routes/verifyRoutes.js";
import historyRoutes from "./routes/history.js";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://verix-ai.vercel.app"
    ],
    methods: ["GET", "POST"],
    credentials: true
  })
);
app.use(express.json());

// ✅ BASE ROUTES (CLEAN)
app.use("/api", uploadRoutes);
app.use("/api", verifyRoutes);
app.use("/api", historyRoutes);

app.get("/", (req, res) => {
  res.send("Backend Running 🚀");
});

app.get("/api/test", (req, res) => {
  res.json({ message: "Backend working 🚀" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});   