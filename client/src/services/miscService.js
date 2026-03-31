import api from "./api";

export const noticeService = {
  getNotices: () => api.get("/notices"),
};

export const settingsService = {
  getPublicSettings: () => api.get("/settings"),
};

export const upiService = {
  submitUPI: (data) => api.post("/upi", data),
  getMyUPI:  ()     => api.get("/upi"),
};
