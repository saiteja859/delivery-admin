const jwt = require("jsonwebtoken");

const authenticateDelivery = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check whether Authorization header exists
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Expected format:
    // Authorization: Bearer <token>
    const parts = authHeader.split(" ");

    if (
      parts.length !== 2 ||
      parts[0] !== "Bearer" ||
      !parts[1]
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format",
      });
    }

    const token = parts[1];

    // Make sure JWT secret exists
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing from environment");

      return res.status(500).json({
        success: false,
        message: "Authentication configuration error",
      });
    }

    // Verify JWT
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Make sure this token belongs to a delivery partner
    if (
      !decoded.userId ||
      !decoded.deliveryPartnerId ||
      decoded.role !== "DELIVERY_PARTNER"
    ) {
      return res.status(403).json({
        success: false,
        message: "Delivery access denied",
      });
    }

    // Attach authenticated delivery user to request
    req.user = {
      userId: decoded.userId,
      deliveryPartnerId: decoded.deliveryPartnerId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.error("Delivery authentication error:", error.message);

    if (
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Authentication token has expired",
      });
    }

    if (
      error.name === "JsonWebTokenError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

module.exports = authenticateDelivery;