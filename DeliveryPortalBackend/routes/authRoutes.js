const express = require("express");

const {
  login,
  register,
  getRegistrationStatus,
} = require("../controllers/authController");

const authenticateDelivery = require("../middleware/authMiddleware");

const router = express.Router();

// ------------------------------------------------------
// Auth route test
// ------------------------------------------------------

router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Auth routes are working",
  });
});

// ------------------------------------------------------
// Delivery partner registration
// ------------------------------------------------------

router.post(
  "/register",
  register
);

// ------------------------------------------------------
// Delivery partner login
// ------------------------------------------------------

router.post(
  "/login",
  login
);

// ------------------------------------------------------
// Delivery application status
// ------------------------------------------------------

router.get(
  "/registration-status",
  getRegistrationStatus
);

// ------------------------------------------------------
// Current authenticated delivery partner
// ------------------------------------------------------

router.get(
  "/me",
  authenticateDelivery,
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Authentication successful",
      user: req.user,
    });
  }
);

module.exports = router;