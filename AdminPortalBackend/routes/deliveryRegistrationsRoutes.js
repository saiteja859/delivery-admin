const express = require("express");

const {
  getDeliveryRegistrations,
  getDeliveryRegistrationById,
  approveDeliveryRegistration,
  rejectDeliveryRegistration,
} = require("../controllers/deliveryRegistrationsController");

const authenticateAdmin = require("../middleware/authMiddleware");

const router = express.Router();

// Every delivery-registration endpoint requires Admin authentication
router.use(authenticateAdmin);

// Get all delivery registrations
router.get("/", getDeliveryRegistrations);

// Get one delivery registration
router.get("/:id", getDeliveryRegistrationById);

// Approve a delivery registration
router.post("/:id/approve", approveDeliveryRegistration);

// Reject a delivery registration
router.post("/:id/reject", rejectDeliveryRegistration);

module.exports = router;