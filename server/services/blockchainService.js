import something from "./file.js";
const isLocal = process.env.NODE_ENV !== "production";

const storeOnBlockchain = async (hash, result) => {
  if (!isLocal) {
    console.log("Skipping blockchain (production)");
    return;
  }

  // your existing blockchain code here
};

const verifyFromBlockchain = async (hash) => {
  if (!isLocal) {
    console.log("Skipping blockchain verify (production)");
    return ["Not Available"];
  }

  // your existing blockchain code here
};

module.exports = { storeOnBlockchain, verifyFromBlockchain };