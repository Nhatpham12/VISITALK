const express = require("express");
const router = express.Router();

const { getReportStats } = require("../controllers/report.controllers");
const { verifyToken } = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/role.middleware");

router.get("/stats", verifyToken, requireRole("admin"), getReportStats);

module.exports = router;
