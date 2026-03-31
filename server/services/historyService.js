import fs from "fs";
import path from "path";

const FILE = path.resolve("data/history.json");

export const getHistory = () => {
  try {
    if (!fs.existsSync(FILE)) return [];

    return JSON.parse(fs.readFileSync(FILE, "utf-8"));
  } catch {
    return [];
  }
};

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
    console.log("SAVE ERROR:", err.message);
  }
};