const express = require("express");

const {
  updateDeliveryLocation,
  updateAvailability,
} = require("../controllers/deliveryLocationController");

const authenticateDelivery = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticateDelivery);

router.patch(
  "/location",
  updateDeliveryLocation
);

router.patch(
  "/availability",
  updateAvailability
);

module.exports = router;