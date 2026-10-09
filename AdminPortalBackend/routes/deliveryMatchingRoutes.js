const express = require("express");

const {
  findNearestSupplier,
  findNearestDeliveryPartner,
  createDeliveryAssignment,
} = require("../controllers/deliveryMatchingController");

const authenticateAdmin = require("../middleware/authMiddleware");

const router = express.Router();

// ============================================
// ADMIN AUTHENTICATION
// ============================================

router.use(authenticateAdmin);

// ============================================
// FIND NEAREST SUPPLIER FOR ORDER
// ============================================

router.get(
  "/order/:orderId/nearest-supplier",
  findNearestSupplier
);

// ============================================
// FIND NEAREST AVAILABLE DELIVERY PARTNER
// ============================================

router.get(
  "/supplier/:supplierId/nearest-delivery-partner",
  findNearestDeliveryPartner
);

// ============================================
// CREATE DELIVERY ASSIGNMENT
// ============================================

router.post(
  "/order/:orderId/assign-delivery",
  createDeliveryAssignment
);

module.exports = router;