
const jwt = require("jsonwebtoken");

// ======================================================
// ADMIN AUTHENTICATION MIDDLEWARE
// ======================================================

const authenticateAdmin = (req, res, next) => {
  try {
    // --------------------------------------------------
    // Get Authorization header
    // --------------------------------------------------

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // --------------------------------------------------
    // Validate Bearer token format
    // --------------------------------------------------

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

    // --------------------------------------------------
    // Check JWT secret
    // --------------------------------------------------

    if (!process.env.JWT_SECRET) {
      console.error(
        "JWT_SECRET is missing from environment"
      );

      return res.status(500).json({
        success: false,
        message: "Authentication configuration error",
      });
    }

    // --------------------------------------------------
    // Verify JWT
    // --------------------------------------------------

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // --------------------------------------------------
    // Make sure token belongs to an ADMIN
    // --------------------------------------------------

    if (
      !decoded.userId ||
      decoded.role !== "ADMIN"
    ) {
      return res.status(403).json({
        success: false,
        message: "Admin access denied",
      });
    }

    // --------------------------------------------------
    // Store authenticated admin information
    // --------------------------------------------------

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
    };

    // --------------------------------------------------
    // Continue to protected route
    // --------------------------------------------------

    next();
  } catch (error) {
    console.error(
      "Admin authentication error:",
      error.message
    );

    // --------------------------------------------------
    // Expired token
    // --------------------------------------------------

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Authentication token has expired",
      });
    }

    // --------------------------------------------------
    // Invalid token
    // --------------------------------------------------

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
    }

    // --------------------------------------------------
    // Other authentication errors
    // --------------------------------------------------

    return res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

module.exports = authenticateAdmin;