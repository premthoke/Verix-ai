import axios from "axios";

// ✅ YOUR BACKEND URL
const BASE_URL = "https://verix-ai-1doz.onrender.com/api";

// UPLOAD
export const uploadAPI = (formData) => {
  return axios.post(`${BASE_URL}/upload`, formData);
};

// VERIFY
export const verifyAPI = (formData) => {
  return axios.post(`${BASE_URL}/verify`, formData);
};

// HISTORY
export const historyAPI = () => {
  return axios.get(`${BASE_URL}/history`);
};