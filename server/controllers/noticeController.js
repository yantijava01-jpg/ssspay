const Notice = require("../models/Notice");
const { sendSuccess, sendError } = require("../utils/response");

// ─── GET ALL ACTIVE NOTICES ────────────────────────────────────────────────────
const getNotices = async (req, res) => {
  try {
    const notices = await Notice.getActive();
    const popups = notices.filter((n) => n.isPopup);
    const list = notices.filter((n) => !n.isPopup);

    return sendSuccess(
      res,
      { notices, popups, list },
      "Notices fetched."
    );
  } catch (error) {
    console.error("GetNotices error:", error);
    return sendError(res, "Failed to fetch notices.", 500);
  }
};

module.exports = { getNotices };
