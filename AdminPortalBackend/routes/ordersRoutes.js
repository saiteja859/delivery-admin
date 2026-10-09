
const express = require("express");

const {
  getOrders,
  getOrderById,
  integrateOrder,
} = require("../controllers/ordersController");

const router = express.Router();

// ============================================
// GET ALL ORDERS
// ============================================

router.get(
  "/",
  getOrders
);

// ============================================
// INTEGRATE CUSTOMER/SELLER ORDER
// ============================================
//
// IMPORTANT:
// This route must come BEFORE /:id
// so "integrate" is not interpreted as
// an order ID.
//

router.post(
  "/integrate",
  integrateOrder
);

// ============================================
// GET SINGLE ORDER
// ============================================

router.get(
  "/:id",
  getOrderById
);

// ============================================
// EXPORT
// ============================================

module.exports = router;
