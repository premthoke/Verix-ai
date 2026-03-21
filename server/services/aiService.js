const axios = require("axios");
const FormData = require("form-data");
const AI_URL = "https://verix-ai-9e57.onrender.com/detect";

const detectFake = async (file) => {
  const formData = new FormData();
  formData.append("file", file.buffer, file.originalname);

  const response = await axios.post(
    "https://verix-ai-9e57.onrender.com/detect",
    formData,
    {
      headers: formData.getHeaders(),
    }
  );

  return response.data;
};

module.exports = { detectFake };