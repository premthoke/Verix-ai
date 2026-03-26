import express from "express";
import cors from "cors";
import uploadRoutes from "./routes/uploadRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", uploadRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});