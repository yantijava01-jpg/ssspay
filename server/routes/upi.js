const express = require("express");
const router = express.Router();

const { submitUPI, getMyUPI } = require("../controllers/upiController");
const { protect } = require("../middleware/auth");
const { validate, upiSubmitRules } = require("../middleware/validate");

router.use(protect);

router.post("/", upiSubmitRules, validate, submitUPI);
router.get("/",  getMyUPI);

module.exports = router;
