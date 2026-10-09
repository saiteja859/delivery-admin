
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const pool = require("../config/db");

// ======================================================
// ADMIN LOGIN
// ======================================================

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // --------------------------------------------------
    // Validate input
    // --------------------------------------------------

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    // --------------------------------------------------
    // Find admin
    // --------------------------------------------------

    const [admins] = await pool.query(
      `
      SELECT
        a.id AS admin_id,
        a.user_id,

        u.id AS user_id,
        u.full_name,
        u.email,
        u.phone,
        u.password_hash,
        u.role,
        u.status

      FROM admins a

      INNER JOIN users u
        ON u.id = a.user_id

      WHERE LOWER(u.email) = ?
        AND u.role = 'ADMIN'

      LIMIT 1
      `,
      [normalizedEmail]
    );

    // --------------------------------------------------
    // Admin not found
    // --------------------------------------------------

    if (admins.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const admin = admins[0];

    // --------------------------------------------------
    // Check account status
    // --------------------------------------------------

    if (admin.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: "Your admin account is not active",
      });
    }

    // --------------------------------------------------
    // Compare password
    // --------------------------------------------------

    const passwordMatch = await bcrypt.compare(
      password,
      admin.password_hash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

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
    // Create Admin JWT
    // --------------------------------------------------

    const token = jwt.sign(
      {
        userId: admin.user_id,
        adminId: admin.admin_id,
        role: "ADMIN",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "8h",
      }
    );

    // --------------------------------------------------
    // Successful login response
    // --------------------------------------------------

    return res.status(200).json({
      success: true,
      message: "Admin login successful",

      token,

      user: {
        id: admin.user_id,
        adminId: admin.admin_id,
        name: admin.full_name,
        email: admin.email,
        phone: admin.phone,
        role: admin.role,
        status: admin.status,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);

    return res.status(500).json({
      success: false,
      message: "Admin login failed",
      error: error.message,
    });
  }
};

module.exports = {
  loginAdmin,
};
