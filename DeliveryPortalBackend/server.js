require("dotenv").config();

const express = require("express");
const cors = require("cors");

const pool = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const deliveryLocationRoutes = require("./routes/deliveryLocationRoutes");
const deliveryOrdersRoutes = require("./routes/deliveryOrdersRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// ============================================
// DELIVERY AUTH
// ============================================

app.use("/api/auth", authRoutes);

// ============================================
// DELIVERY NOTIFICATIONS
// ============================================

app.use(
  "/api/notifications",
  notificationRoutes
);

// ============================================
// DELIVERY LOCATION & AVAILABILITY
// ============================================

app.use(
  "/api/delivery",
  deliveryLocationRoutes
);

// ============================================
// TEMPORARY ORDERS ROUTE CHECK
// ============================================

app.get(
  "/api/delivery-orders-test",
  (req, res) => {
    res.json({
      success: true,
      message:
        "Delivery orders route section is loaded",
    });
  }
);

// ============================================
// DELIVERY ORDERS
// ============================================

app.use(
  "/api/delivery/orders",
  deliveryOrdersRoutes
);

// ============================================
// TEMPORARY DELIVERY ROUTE CHECK
// ============================================

app.get("/api/delivery-test", (req, res) => {
  res.json({
    success: true,
    message:
      "Delivery location routes are loaded",
  });
});

// ============================================
// TEMPORARY BACKEND VERSION CHECK
// ============================================

app.get("/api/version", (req, res) => {
  res.json({
    success: true,
    version: "delivery-backend-location-v1",
    message:
      "This is the current Delivery Portal backend",
  });
});

// ============================================
// ROOT
// ============================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message:
      "Delivery Portal Backend is running",
  });
});

// ============================================
// HEALTH CHECK
// ============================================

app.get("/api/health", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT 1 AS database_connected"
    );

    res.status(200).json({
      success: true,
      message:
        "Delivery Backend and MySQL are connected",
      database: "shop_all_goods",
      connected:
        rows[0].database_connected === 1,
    });
  } catch (error) {
    console.error(
      "Delivery database connection error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Delivery Backend database connection failed",
    });
  }
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(
    `Delivery Portal Backend running on port ${PORT}`
  );
});