module.exports = {
  // Order limits
  MIN_ORDER_AMOUNT: 100,
  MAX_ORDERS_PER_DAY: 50,

  // Reward rates
  CASHBACK_RATE: 0.025,       // 2.5%
  REFERRAL_RATE: 0.003,       // 0.3%

  // User statuses
  USER_STATUS: {
    PENDING: "pending",
    ACTIVE: "active",
    DISABLED: "disabled",
  },

  // Order statuses
  ORDER_STATUS: {
    PENDING: "pending",
    PROCESSING: "processing",
    SUCCESS: "success",
    FAILED: "failed",
  },

  // Transaction types
  TRANSACTION_TYPE: {
    DEPOSIT: "deposit",
    REWARD: "reward",
    REFERRAL: "referral",
    WITHDRAW: "withdraw",
  },

  // UPI statuses
  UPI_STATUS: {
    ENABLED: "enabled",
    DISABLED: "disabled",
    RISK: "risk",
    FAILED: "failed",
  },

  // JWT
  JWT_EXPIRES_IN: "7d",

  // Roles
  ROLE: {
    USER: "user",
    ADMIN: "admin",
  },
};
