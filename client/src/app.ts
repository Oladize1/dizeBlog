import axios from "axios";
import { toast } from "react-toastify";

// const BASE_URL = 'https://dizeblog.onrender.com/api/blog'
const BASE_URL = 'http://localhost:3000/api/blog'

export const api = axios.create({
  baseURL: `${BASE_URL}`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await axios.post(
          `${BASE_URL}/refresh`,
          {},
          { withCredentials: true },
        );
        return api(originalRequest);
      } catch (refreshError) {
        toast.error("Session expired, Logging out...");
        localStorage.removeItem("userInfo");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);
