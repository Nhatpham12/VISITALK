const express = require("express");
const router = express.Router();

const { getReportStats } = require("../controllers/report.controllers");

router.get("/stats", getReportStats);

module.exports = router;
