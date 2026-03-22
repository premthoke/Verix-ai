const express = require("express");
const cors = require("cors");

const uploadRoutes = require("./routes/uploadRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api", uploadRoutes);

const PORT = 5000;

app.listen(process.env.PORT || 5000, () => {
  console.log("Server running");
});