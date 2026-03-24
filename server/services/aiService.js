const axios = require("axios");
const FormData = require("form-data");

const detectDeepfake = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file.buffer, file.originalname);

    const response = await axios.post(
      "http://localhost:5001/predict",
      formData,
      {
        headers: formData.getHeaders(),
      }
    );

    return response.data;

  } catch (error) {
    console.error(error.message);
    throw new Error("AI Service failed");
  }
};

module.exports = { detectDeepfake };