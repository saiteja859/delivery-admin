const express = require("express");

const {
  getDashboardData,
} = require("../controllers/dashboardController");

const router = express.Router();


// ============================================
// ADMIN DASHBOARD
// ============================================

router.get("/", getDashboardData);


module.exports = router;