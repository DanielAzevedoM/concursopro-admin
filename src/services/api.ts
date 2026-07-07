import axios from "axios";

const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
export const api = axios.create({
  baseURL: `${baseUrl}/admin`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token && token !== "undefined") {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
