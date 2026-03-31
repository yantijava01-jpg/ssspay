const express = require("express");
const router = express.Router();

const { getNotices } = require("../controllers/noticeController");
const { protect } = require("../middleware/auth");

// Active notices — authenticated users only
router.get("/", protect, getNotices);

module.exports = router;
