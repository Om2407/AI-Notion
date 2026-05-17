import axios from "axios";

const api = axios.create({
  baseURL: "/",
  headers: { "Content-Type": "application/json" },
});

// Attach token to every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("peblo_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally — logout user
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("peblo_token");
      localStorage.removeItem("peblo_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
