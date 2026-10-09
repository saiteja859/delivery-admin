require("dotenv").config();

const express = require("express");
const cors = require("cors");

const pool = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const ordersRoutes = require("./routes/ordersRoutes");
const productsRoutes = require("./routes/productsRoutes");
const suppliersRoutes = require("./routes/suppliersRoutes");
const deliveryRegistrationsRoutes = require("./routes/deliveryRegistrationsRoutes");
const deliveryMatchingRoutes = require("./routes/deliveryMatchingRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// ============================================
// ADMIN AUTH
// ============================================

app.use("/api/auth", authRoutes);

// ============================================
// ADMIN DASHBOARD
// ============================================

app.use("/api/dashboard", dashboardRoutes);

// ============================================
// ADMIN ORDERS
// ============================================

app.use("/api/orders", ordersRoutes);

// ============================================
// ADMIN PRODUCTS
// ============================================

app.use("/api/products", productsRoutes);

// ============================================
// ADMIN SUPPLIERS
// ============================================

app.use("/api/suppliers", suppliersRoutes);

// ============================================
// DELIVERY REGISTRATION MANAGEMENT
// ============================================

app.use(
"/api/delivery-registrations",
deliveryRegistrationsRoutes
);

// ============================================
// DELIVERY MATCHING
// ============================================

app.use(
"/api/delivery-matching",
deliveryMatchingRoutes
);

// ============================================
// ADMIN NOTIFICATIONS
// ============================================

app.use("/api/notifications", notificationRoutes);

// ============================================
// ROOT
// ============================================

app.get("/", (req, res) => {
res.json({
success: true,
message: "Shop All Goods Admin Backend is running",
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
  message: "Backend and MySQL are connected",
  database: rows[0].database_connected === 1,
});


} catch (error) {
console.error("Database connection error:", error);

res.status(500).json({
  success: false,
  message: "Database connection failed",
});


}
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
console.log(`Admin backend running on port ${PORT}`);
});
