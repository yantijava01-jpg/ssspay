import api from "./api";

export const authService = {
  register: (data) => api.post("/auth/register", data),
  login:    (data) => api.post("/auth/login", data),
  getProfile:   ()   => api.get("/auth/profile"),
  getDashboard: ()   => api.get("/auth/dashboard"),
  changePassword: (data) => api.put("/auth/change-password", data),
};
