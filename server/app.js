import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import uploadRoutes from "./routes/uploadRoutes.js";
import verifyRoutes from "./routes/verifyRoutes.js";
import historyRoutes from "./routes/history.js";

const app = express();

app.use(cors());
app.use(express.json());

// ✅ BASE ROUTES (CLEAN)
app.use("/api", uploadRoutes);
app.use("/api", verifyRoutes);
app.use("/api", historyRoutes);

app.get("/", (req, res) => {
  res.send("Backend Running 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});   