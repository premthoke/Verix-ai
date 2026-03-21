const axios = require("axios");
const FormData = require("form-data");

const detectFake = async (file) => {
  const formData = new FormData();
  formData.append("file", file.buffer, file.originalname);

  const response = await axios.post(
    "https://your-ai-service.onrender.com/detect",
    formData,
    {
      headers: formData.getHeaders(),
    }
  );

  return response.data;
};

module.exports = { detectFake };