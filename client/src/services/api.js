import axios from "axios";

// ✅ CHANGE THIS TO YOUR RENDER BACKEND URL
const BASE_URL = "https://verix-backend.onrender.com";

export const uploadAPI = (formData) =>
  axios.post(`${BASE_URL}/api/upload`, formData);

export const verifyAPI = (formData) =>
  axios.post(`${BASE_URL}/api/verify`, formData);