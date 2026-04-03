import api from "./api";

export const adminService = {
  // Analytics
  getAnalytics: () => api.get("/admin/analytics"),

  // Users
  getAllUsers: (params) => api.get("/admin/users", { params }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  updateUserStatus: (id, data) => api.put(`/admin/users/${id}/status`, data),
  toggleFreeze: (id) => api.put(`/admin/users/${id}/freeze`),
  resetPassword: (id, data) => api.put(`/admin/users/${id}/reset-password`, data),
  adjustBalance: (id, data) => api.put(`/admin/users/${id}/balance`, data),

  // Orders
  getAllOrders: (params) => api.get("/admin/orders", { params }),
  approveOrder: (id, data) => api.put(`/admin/orders/${id}/approve`, data),
  rejectOrder: (id, data) => api.put(`/admin/orders/${id}/reject`, data),

  // Transactions (new)
  getAllTransactions: (params) => api.get("/admin/transactions", { params }),

  // UPI
  getAllUPIs: (params) => api.get("/admin/upis", { params }),
  updateUPI: (id, data) => api.put(`/admin/upis/${id}/status`, data),

  // Notices
  getAllNotices: () => api.get("/admin/notices"),
  createNotice: (data) => api.post("/admin/notices", data),
  updateNotice: (id, data) => api.put(`/admin/notices/${id}`, data),
  deleteNotice: (id) => api.delete(`/admin/notices/${id}`),

  // Settings
  getSettings: () => api.get("/admin/settings"),
  updateSettings: (data) => api.put("/admin/settings", data),

  // Export
  exportUsers: () => api.get("/admin/export/users", { responseType: "blob" }),
  exportOrders: () => api.get("/admin/export/orders", { responseType: "blob" }),
};