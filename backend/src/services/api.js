import axios from "axios";
import toast from "react-hot-toast";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request Interceptor ───────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("taskflow_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor ──────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response.data,

  (error) => {
    const status = error.response?.status;

    switch (status) {
      case 401:
        localStorage.removeItem("taskflow_token");
        localStorage.removeItem("taskflow_user");
        if (!window.location.pathname.includes("/login")) {
          toast.error("Session expired. Please log in again.");
          window.location.href = "/login";
        }
        break;
      case 403:
        toast.error("You don't have permission to perform this action.");
        break;
      case 429:
        toast.error("Too many requests. Please slow down.");
        break;
      case 500:
      case 502:
      case 503:
        toast.error("Server error. Please try again later.");
        break;
      default:
        if (!error.response) {
          toast.error("Network error. Check your connection.");
        }
        break;
    }

    return Promise.reject(error);
  },
);

export default api;
