const express = require("express");

const {
  getDeliveryOrders,
} = require("../controllers/deliveryOrdersController");

const authenticateDelivery = require("../middleware/authMiddleware");

const router = express.Router();

// ============================================
// DELIVERY AUTHENTICATION
// ============================================

router.use(authenticateDelivery);

// ============================================
// GET ORDERS ASSIGNED TO DELIVERY PARTNER
// ============================================

router.get(
  "/",
  getDeliveryOrders
);

module.exports = router;