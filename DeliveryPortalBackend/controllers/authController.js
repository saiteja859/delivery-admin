const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const pool = require("../config/db");

// DELIVERY PARTNER LOGIN
const login = async (req, res) => {
  try {
    const email = String(req.body.email || "")
      .trim()
      .toLowerCase();

    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const [users] = await pool.query(
      `
      SELECT
        u.id,
        u.full_name,
        u.email,
        u.phone,
        u.password_hash,
        u.role,
        u.status,

        dp.id AS delivery_partner_id,
        dp.vehicle_type,
        dp.vehicle_number,
        dp.license_number,
        dp.availability_status,
        dp.rating,
        dp.total_deliveries

      FROM users u

      INNER JOIN delivery_partners dp
        ON dp.user_id = u.id

      WHERE LOWER(u.email) = ?
        AND u.role = 'DELIVERY_PARTNER'

      LIMIT 1
      `,
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = users[0];

    if (user.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message:
          "Your delivery partner account is not active",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error(
        "JWT_SECRET is missing from environment"
      );

      return res.status(500).json({
        success: false,
        message: "Authentication configuration error",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        deliveryPartnerId:
          user.delivery_partner_id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "8h",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",

      token,

      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,

        deliveryPartnerId:
          user.delivery_partner_id,

        vehicleType: user.vehicle_type,
        vehicleNumber: user.vehicle_number,
        licenseNumber: user.license_number,

        availabilityStatus:
          user.availability_status,

        rating: Number(user.rating || 0),
        totalDeliveries:
          Number(user.total_deliveries || 0),
      },
    });
  } catch (error) {
    console.error(
      "Delivery login error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

// DELIVERY PARTNER REGISTRATION
const register = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      licenseNumber,
      address,
      city,
      state,
      pincode,
    } = req.body;

    const cleanFullName = String(
      fullName || ""
    ).trim();

    const cleanEmail = String(email || "")
      .trim()
      .toLowerCase();

    const cleanPhone = String(phone || "").trim();

    const cleanPassword = String(
      password || ""
    );

    const cleanLicenseNumber = String(
      licenseNumber || ""
    ).trim();

    const cleanAddress = String(
      address || ""
    ).trim();

    const cleanCity = String(city || "").trim();

    const cleanState = String(
      state || ""
    ).trim();

    const cleanPincode = String(
      pincode || ""
    ).trim();

    if (
      !cleanFullName ||
      !cleanEmail ||
      !cleanPhone ||
      !cleanPassword ||
      !cleanAddress ||
      !cleanCity ||
      !cleanState ||
      !cleanPincode
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required registration details",
      });
    }

    if (cleanPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters",
      });
    }

    /*
     * Check whether this email already belongs
     * to an actual user account.
     *
     * Rejected applicants are NOT stored in users,
     * so they are allowed to submit a new application.
     */
    const [existingUsers] = await pool.query(
      `
      SELECT
        id,
        role,
        status
      FROM users
      WHERE LOWER(email) = ?
      LIMIT 1
      `,
      [cleanEmail]
    );

    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];

      if (
        existingUser.role ===
        "DELIVERY_PARTNER"
      ) {
        return res.status(409).json({
          success: false,
          message:
            "A delivery partner account already exists for this email address",
        });
      }

      return res.status(409).json({
        success: false,
        message:
          "This email address is already registered",
      });
    }

    /*
     * Check for an existing pending application.
     *
     * We allow rejected applicants to reapply.
     * We prevent duplicate PENDING applications
     * for the same email.
     */
    const [pendingRegistrations] =
      await pool.query(
        `
        SELECT
          id,
          registration_status
        FROM delivery_partner_registrations
        WHERE LOWER(email) = ?
          AND registration_status = 'PENDING'
        ORDER BY id DESC
        LIMIT 1
        `,
        [cleanEmail]
      );

    if (pendingRegistrations.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "You already have a pending delivery partner application",
        applicationId:
          pendingRegistrations[0].id,
      });
    }

    /*
     * The password is stored in the registration table
     * until an administrator approves the application.
     */
    const passwordHash = await bcrypt.hash(
      cleanPassword,
      10
    );

    const [result] = await pool.query(
      `
      INSERT INTO delivery_partner_registrations (
        full_name,
        email,
        phone,
        password_hash,
        license_number,
        address,
        city,
        state,
        pincode,
        registration_status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')
      `,
      [
        cleanFullName,
        cleanEmail,
        cleanPhone,
        passwordHash,
        cleanLicenseNumber || null,
        cleanAddress,
        cleanCity,
        cleanState,
        cleanPincode,
      ]
    );

    return res.status(201).json({
      success: true,
      message:
        "Registration submitted successfully. Please wait for administrator approval.",
      application: {
        id: result.insertId,
        fullName: cleanFullName,
        email: cleanEmail,
        status: "PENDING",
      },
    });
  } catch (error) {
    console.error(
      "Delivery registration error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to submit delivery partner registration",
    });
  }
};

// CHECK DELIVERY APPLICATION STATUS
const getRegistrationStatus = async (
  req,
  res
) => {
  try {
    const email = String(
      req.query.email || ""
    )
      .trim()
      .toLowerCase();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required",
      });
    }

    /*
     * We return only the latest application.
     *
     * This is important for reapplication:
     *
     * Old rejected application:
     * ID 2 -> REJECTED
     *
     * New application:
     * ID 4 -> PENDING
     *
     * The latest record is therefore the
     * applicant's current application.
     */
    const [registrations] = await pool.query(
      `
      SELECT
        id,
        full_name,
        email,
        registration_status,
        rejection_reason,
        created_at,
        updated_at
      FROM delivery_partner_registrations
      WHERE LOWER(email) = ?
      ORDER BY id DESC
      LIMIT 1
      `,
      [email]
    );

    if (registrations.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "No delivery partner application was found for this email address.",
      });
    }

    const registration =
      registrations[0];

    return res.status(200).json({
      success: true,

      application: {
        id: registration.id,

        fullName:
          registration.full_name,

        email:
          registration.email,

        status:
          registration.registration_status,

        rejectionReason:
          registration.rejection_reason ||
          null,

        createdAt:
          registration.created_at,

        updatedAt:
          registration.updated_at,
      },
    });
  } catch (error) {
    console.error(
      "Get delivery registration status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to check application status",
    });
  }
};

module.exports = {
  login,
  register,
  getRegistrationStatus,
};