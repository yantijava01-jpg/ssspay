const UPI = require("../models/UPI");
const { sendSuccess, sendError } = require("../utils/response");

const MAX_UPI_PER_USER = 7;

// ── SUBMIT UPI (up to 7 per user) ─────────────────────────────────────────────
const submitUPI = async (req, res) => {
  try {
    const { upiId, label } = req.body;

    // Count existing UPIs for this user
    const existingCount = await UPI.countDocuments({ userId: req.user._id });
    if (existingCount >= MAX_UPI_PER_USER) {
      return sendError(
        res,
        `You can only add up to ${MAX_UPI_PER_USER} UPI IDs. Contact support to remove old ones.`,
        409
      );
    }

    // Check for duplicate UPI ID for this user
    const duplicate = await UPI.findOne({
      userId: req.user._id,
      upiId: upiId.trim().toLowerCase(),
    });
    if (duplicate) {
      return sendError(res, "This UPI ID is already added to your account.", 409);
    }

    const upi = await UPI.create({
      userId: req.user._id,
      upiId: upiId.trim().toLowerCase(),
      label: label?.trim() || "",
    });

    return sendSuccess(
      res,
      {
        upi: {
          _id: upi._id,
          upiId: upi.upiId,
          label: upi.label,
          status: upi.status,
          createdAt: upi.createdAt,
        },
        remaining: MAX_UPI_PER_USER - existingCount - 1,
      },
      "UPI ID submitted successfully.",
      201
    );
  } catch (error) {
    console.error("SubmitUPI error:", error);
    return sendError(res, "Failed to submit UPI ID.", 500);
  }
};

// ── GET MY UPIs ────────────────────────────────────────────────────────────────
const getMyUPIs = async (req, res) => {
  try {
    const upis = await UPI.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(
      res,
      {
        upis,
        count: upis.length,
        remaining: MAX_UPI_PER_USER - upis.length,
        max: MAX_UPI_PER_USER,
      },
      "UPIs fetched."
    );
  } catch (error) {
    console.error("GetMyUPIs error:", error);
    return sendError(res, "Failed to fetch UPIs.", 500);
  }
};

module.exports = { submitUPI, getMyUPIs };