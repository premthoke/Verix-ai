import fs from "fs";
import path from "path";

// ✅ FIXED PATH (IMPORTANT)
const FILE = path.resolve("data/history.json");

// GET ALL
export const getHistory = () => {
  try {
    if (!fs.existsSync(FILE)) return [];

    const data = fs.readFileSync(FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.log("❌ READ ERROR:", err.message);
    return [];
  }
};

// SAVE NEW
export const saveHistory = (entry) => {
  try {
    let history = [];

    if (fs.existsSync(FILE)) {
      history = JSON.parse(fs.readFileSync(FILE, "utf-8"));
    }

    history.unshift(entry);

    fs.writeFileSync(FILE, JSON.stringify(history, null, 2));

    console.log("📜 History saved");
  } catch (err) {
    console.log("❌ SAVE ERROR:", err.message);
  }
};