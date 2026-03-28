import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import uploadRoutes from "./routes/uploadRoutes.js";
import verifyRoutes from "./routes/verifyRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

// ✅ CLEAN ROUTES
app.use("/api/upload", uploadRoutes);
app.use("/api/verify", verifyRoutes);

app.get("/", (req, res) => {
  res.send("Backend Running 🚀");
});

// ✅ IMPORTANT FOR RENDER
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});