const Settings = require("../models/Settings");
const { sendSuccess, sendError } = require("../utils/response");

// ─── GET PUBLIC SETTINGS (rates, app info) ─────────────────────────────────────
const getPublicSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();

    // Only expose what the frontend needs — never expose full admin config
    return sendSuccess(
      res,
      {
        settings: {
          usdtRate: settings.usdtRate,
          minOrderAmount: settings.minOrderAmount,
          cashbackRate: settings.cashbackRate * 100,     // as percentage
          referralRate: settings.referralRate * 100,     // as percentage
          telegramLink: settings.telegramLink,
          supportWhatsapp: settings.supportWhatsapp,
          appName: settings.appName,
          maintenanceMode: settings.maintenanceMode,
        },
      },
      "Settings fetched."
    );
  } catch (error) {
    console.error("GetPublicSettings error:", error);
    return sendError(res, "Failed to fetch settings.", 500);
  }
};

module.exports = { getPublicSettings };
