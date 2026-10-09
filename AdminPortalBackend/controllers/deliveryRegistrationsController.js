
const pool = require("../config/db");

// GET ALL DELIVERY REGISTRATIONS
const getDeliveryRegistrations = async (req, res) => {
  try {
    const [registrations] = await pool.query(`
      SELECT
        id,
        full_name,
        email,
        phone,
        license_number,
        address,
        city,
        state,
        pincode,
        registration_status,
        rejection_reason,
        reviewed_by,
        reviewed_at,
        created_at,
        updated_at
      FROM delivery_partner_registrations
      ORDER BY created_at DESC
    `);

    return res.status(200).json({
      success: true,
      registrations: registrations.map(
        (registration) => ({
          id: registration.id,
          fullName: registration.full_name,
          email: registration.email,
          phone: registration.phone,
          licenseNumber:
            registration.license_number,
          address: registration.address,
          city: registration.city,
          state: registration.state,
          pincode: registration.pincode,
          registrationStatus:
            registration.registration_status,
          rejectionReason:
            registration.rejection_reason,
          reviewedBy: registration.reviewed_by,
          reviewedAt: registration.reviewed_at,
          createdAt: registration.created_at,
          updatedAt: registration.updated_at,
        })
      ),
    });
  } catch (error) {
    console.error(
      "Get delivery registrations error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load delivery registrations",
    });
  }
};

// GET SINGLE DELIVERY REGISTRATION
const getDeliveryRegistrationById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: "Invalid registration ID",
      });
    }

    const [registrations] = await pool.query(
      `
      SELECT
        id,
        full_name,
        email,
        phone,
        license_number,
        address,
        city,
        state,
        pincode,
        registration_status,
        rejection_reason,
        reviewed_by,
        reviewed_at,
        created_at,
        updated_at
      FROM delivery_partner_registrations
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    if (registrations.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Delivery registration not found",
      });
    }

    const registration = registrations[0];

    return res.status(200).json({
      success: true,
      registration: {
        id: registration.id,
        fullName: registration.full_name,
        email: registration.email,
        phone: registration.phone,
        licenseNumber:
          registration.license_number,
        address: registration.address,
        city: registration.city,
        state: registration.state,
        pincode: registration.pincode,
        registrationStatus:
          registration.registration_status,
        rejectionReason:
          registration.rejection_reason,
        reviewedBy: registration.reviewed_by,
        reviewedAt: registration.reviewed_at,
        createdAt: registration.created_at,
        updatedAt: registration.updated_at,
      },
    });
  } catch (error) {
    console.error(
      "Get delivery registration by ID error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load delivery registration",
    });
  }
};

// APPROVE DELIVERY REGISTRATION
const approveDeliveryRegistration = async (
  req,
  res
) => {
  console.log(
    "========================================"
  );
  console.log(
    "REAL APPROVE CONTROLLER HIT:",
    req.params.id
  );
  console.log(
    "========================================"
  );

  let connection;

  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: "Invalid registration ID",
      });
    }

    connection = await pool.getConnection();

    await connection.beginTransaction();

    console.log(
      "APPROVAL TRANSACTION STARTED:",
      id
    );

    // GET APPLICATION
    const [registrations] =
      await connection.query(
        `
        SELECT
          id,
          full_name,
          email,
          phone,
          password_hash,
          license_number,
          registration_status
        FROM delivery_partner_registrations
        WHERE id = ?
        FOR UPDATE
        `,
        [id]
      );

    if (registrations.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message:
          "Delivery registration not found",
      });
    }

    const registration = registrations[0];

    console.log(
      "APPLICATION FOUND:",
      registration.full_name,
      registration.email,
      registration.registration_status
    );

    // ONLY PENDING APPLICATIONS CAN BE APPROVED
    if (
      registration.registration_status !==
      "PENDING"
    ) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        message: `Registration is already ${registration.registration_status.toLowerCase()}`,
      });
    }

    const email = registration.email
      .trim()
      .toLowerCase();

    const passwordHash =
      registration.password_hash;

    // CHECK PASSWORD
    if (!passwordHash) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Applicant password is missing. The application cannot be approved.",
      });
    }

    // CHECK EXISTING USER
    console.log(
      "CHECKING EXISTING USER:",
      email
    );

    const [existingUsers] =
      await connection.query(
        `
        SELECT
          id,
          role
        FROM users
        WHERE email = ?
        LIMIT 1
        `,
        [email]
      );

    if (existingUsers.length > 0) {
      await connection.rollback();

      console.log(
        "USER ALREADY EXISTS:",
        existingUsers[0]
      );

      return res.status(409).json({
        success: false,
        message:
          "A user account already exists with this email address",
      });
    }

    // CREATE USER ACCOUNT
    console.log(
      "CREATING DELIVERY USER ACCOUNT..."
    );

    const [userResult] =
      await connection.query(
        `
        INSERT INTO users (
          full_name,
          email,
          phone,
          password_hash,
          role,
          status
        )
        VALUES (
          ?,
          ?,
          ?,
          ?,
          'DELIVERY_PARTNER',
          'ACTIVE'
        )
        `,
        [
          registration.full_name,
          email,
          registration.phone,
          passwordHash,
        ]
      );

    const userId = userResult.insertId;

    console.log(
      "USER CREATED SUCCESSFULLY:",
      userId
    );

    // CREATE DELIVERY PARTNER
    console.log(
      "CREATING DELIVERY PARTNER..."
    );

    const [deliveryPartnerResult] =
      await connection.query(
        `
        INSERT INTO delivery_partners (
          user_id,
          vehicle_type,
          vehicle_number,
          license_number,
          availability_status,
          rating,
          total_deliveries
        )
        VALUES (
          ?,
          NULL,
          NULL,
          ?,
          'OFFLINE',
          0.00,
          0
        )
        `,
        [
          userId,
          registration.license_number,
        ]
      );

    const deliveryPartnerId =
      deliveryPartnerResult.insertId;

    console.log(
      "DELIVERY PARTNER CREATED:",
      deliveryPartnerId
    );

    // UPDATE APPLICATION STATUS
    console.log(
      "UPDATING REGISTRATION STATUS..."
    );

    const [updateResult] =
      await connection.query(
        `
        UPDATE delivery_partner_registrations
        SET
          registration_status = 'APPROVED',
          rejection_reason = NULL,
          reviewed_by = ?,
          reviewed_at = CURRENT_TIMESTAMP
        WHERE id = ?
          AND registration_status = 'PENDING'
        `,
        [req.user.userId, id]
      );

    if (updateResult.affectedRows !== 1) {
      throw new Error(
        "Registration status could not be updated to APPROVED"
      );
    }

    console.log(
      "REGISTRATION STATUS UPDATED TO APPROVED:",
      id
    );

    // CREATE APPROVAL NOTIFICATION
    console.log(
      "CREATING APPROVAL NOTIFICATION..."
    );

    await connection.query(
      `
      INSERT INTO notifications (
        user_id,
        title,
        message,
        notification_type,
        is_read
      )
      VALUES (?, ?, ?, ?, 0)
      `,
      [
        userId,
        "Delivery Partner Application Approved",
        "Your delivery partner application has been approved. You can now log in to the Delivery Portal using your registered email address and password.",
        "DELIVERY_APPROVAL",
      ]
    );

    console.log(
      "APPROVAL NOTIFICATION CREATED"
    );

    // COMMIT EVERYTHING
    await connection.commit();

    console.log(
      "========================================"
    );
    console.log(
      "APPROVAL TRANSACTION COMMITTED:",
      id
    );
    console.log(
      "========================================"
    );

    return res.status(200).json({
      success: true,
      message:
        "Delivery partner application approved successfully",
      registrationId: Number(id),
      userId,
      deliveryPartnerId,
      loginEmail: email,
    });
  } catch (error) {
    // ROLLBACK IF TRANSACTION WAS STARTED
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error(
          "Approval rollback error:"
        );
        console.error(
          rollbackError.message
        );
      }
    }

    console.error(
      "========================================"
    );
    console.error(
      "APPROVE DELIVERY REGISTRATION ERROR"
    );
    console.error(
      "========================================"
    );
    console.error(
      "Message:",
      error.message
    );
    console.error(
      "Code:",
      error.code
    );
    console.error(
      "SQL State:",
      error.sqlState
    );
    console.error(
      "SQL Message:",
      error.sqlMessage
    );
    console.error(
      "Full Error:",
      error
    );
    console.error(
      "========================================"
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to approve delivery partner application",
      error: error.message,
      code: error.code || null,
      sqlState: error.sqlState || null,
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// REJECT DELIVERY REGISTRATION
const rejectDeliveryRegistration = async (
  req,
  res
) => {
  let connection;

  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: "Invalid registration ID",
      });
    }

    if (
      typeof rejectionReason !== "string" ||
      !rejectionReason.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Rejection reason is required",
      });
    }

    if (rejectionReason.trim().length > 1000) {
      return res.status(400).json({
        success: false,
        message:
          "Rejection reason cannot exceed 1000 characters",
      });
    }

    connection = await pool.getConnection();

    await connection.beginTransaction();

    const [registrations] =
      await connection.query(
        `
        SELECT
          id,
          full_name,
          email,
          registration_status
        FROM delivery_partner_registrations
        WHERE id = ?
        FOR UPDATE
        `,
        [id]
      );

    if (registrations.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message:
          "Delivery registration not found",
      });
    }

    const registration = registrations[0];

    if (
      registration.registration_status !==
      "PENDING"
    ) {
      await connection.rollback();

      return res.status(409).json({
        success: false,
        message: `Registration is already ${registration.registration_status.toLowerCase()}`,
      });
    }

    await connection.query(
      `
      UPDATE delivery_partner_registrations
      SET
        registration_status = 'REJECTED',
        rejection_reason = ?,
        reviewed_by = ?,
        reviewed_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [
        rejectionReason.trim(),
        req.user.userId,
        id,
      ]
    );

    await connection.commit();

    return res.status(200).json({
      success: true,
      message:
        "Delivery partner application rejected successfully",
      registrationId: Number(id),
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error(
          "Rejection rollback error:",
          rollbackError
        );
      }
    }

    console.error(
      "Reject delivery registration error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to reject delivery partner application",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

module.exports = {
  getDeliveryRegistrations,
  getDeliveryRegistrationById,
  approveDeliveryRegistration,
  rejectDeliveryRegistration,
};
