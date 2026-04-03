import api from "./api";

export const noticeService = {
  getNotices: () => api.get("/notices"),
};

export const settingsService = {
  getPublicSettings: () => api.get("/settings"),
};

export const upiService = {
  // ✅ Updated — now supports multiple UPIs per user
  submitUPI: (data) => api.post("/upi", data),
  getMyUPIs: () => api.get("/upi"),

  // Keep old name as alias so nothing breaks
  getMyUPI: () => api.get("/upi"),
};