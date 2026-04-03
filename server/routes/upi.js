const express = require("express");
const router = express.Router();

const { submitUPI, getMyUPIs } = require("../controllers/upiController");
const { protect } = require("../middleware/auth");
const { validate, upiSubmitRules } = require("../middleware/validate");

router.use(protect);

router.post("/", upiSubmitRules, validate, submitUPI);
router.get("/", getMyUPIs);

module.exports = router;