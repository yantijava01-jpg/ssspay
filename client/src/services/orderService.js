import api from "./api";

export const orderService = {
  createOrder:      (data)   => api.post("/orders", data),
  getMyOrders:      (params) => api.get("/orders", { params }),
  getOrderById:     (id)     => api.get(`/orders/${id}`),
  getTransactions:  (params) => api.get("/orders/transactions", { params }),
  getTeam:          ()       => api.get("/orders/team"),
};
