import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8080/admin",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token && token !== "undefined") {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
