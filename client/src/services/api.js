import axios from "axios";

const BASE_URL = "https://verix-backend.onrender.com";

export const uploadAPI = (formData) =>
  axios.post(`${BASE_URL}/api/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const verifyAPI = (formData) =>
  axios.post(`${BASE_URL}/api/verify`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });