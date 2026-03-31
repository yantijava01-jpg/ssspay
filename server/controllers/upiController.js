const UPI = require("../models/UPI");
const { sendSuccess, sendError } = require("../utils/response");
const { UPI_STATUS } = require("../config/constants");

// ─── SUBMIT UPI (user, once only) ─────────────────────────────────────────────
const submitUPI = async (req, res) => {
  try {
    const { upiId } = req.body;

    // Check if already submitted
    const existing = await UPI.findOne({ userId: req.user._id });
    if (existing) {
      return sendError(
        res,
        "You have already submitted a UPI ID. Contact support to update it.",
        409
      );
    }

    const upi = await UPI.create({
      userId: req.user._id,
      upiId: upiId.trim().toLowerCase(),
    });

    return sendSuccess(
      res,
      {
        upi: {
          _id: upi._id,
          upiId: upi.upiId,
          status: upi.status,
          createdAt: upi.createdAt,
        },
      },
      "UPI ID submitted successfully.",
      201
    );
  } catch (error) {
    console.error("SubmitUPI error:", error);
    if (error.code === 11000) {
      return sendError(res, "You have already submitted a UPI ID.", 409);
    }
    return sendError(res, "Failed to submit UPI ID.", 500);
  }
};

// ─── GET MY UPI ────────────────────────────────────────────────────────────────
const getMyUPI = async (req, res) => {
  try {
    const upi = await UPI.findOne({ userId: req.user._id }).lean();

    return sendSuccess(
      res,
      { upi: upi || null },
      upi ? "UPI fetched." : "No UPI ID submitted yet."
    );
  } catch (error) {
    console.error("GetMyUPI error:", error);
    return sendError(res, "Failed to fetch UPI.", 500);
  }
};

module.exports = { submitUPI, getMyUPI };
