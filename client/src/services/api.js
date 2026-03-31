import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request interceptor: attach JWT ──────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("ssspay_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle auth errors globally ────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // Token expired or invalid → force logout
    if (status === 401) {
      const isLoginRoute = error.config?.url?.includes("/auth/login");
      if (!isLoginRoute) {
        localStorage.removeItem("ssspay_token");
        localStorage.removeItem("ssspay_user");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// ── Helper: extract error message from response ───────────────────────────────
export const getErrorMessage = (error) => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.errors?.length > 0) {
    return error.response.data.errors.map((e) => e.message).join(", ");
  }
  if (error.message === "Network Error") return "Network error. Please check your connection.";
  if (error.code === "ECONNABORTED") return "Request timed out. Please try again.";
  return "Something went wrong. Please try again.";
};

export default api;
