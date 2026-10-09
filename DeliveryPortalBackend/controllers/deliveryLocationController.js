const pool = require("../config/db");

// ============================================
// UPDATE DELIVERY PARTNER LOCATION
// ============================================

const updateDeliveryLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    const deliveryPartnerId =
      req.user.deliveryPartnerId;

    // ------------------------------------------
    // Validate latitude
    // ------------------------------------------

    if (
      latitude === undefined ||
      latitude === null ||
      isNaN(Number(latitude)) ||
      Number(latitude) < -90 ||
      Number(latitude) > 90
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid latitude",
      });
    }

    // ------------------------------------------
    // Validate longitude
    // ------------------------------------------

    if (
      longitude === undefined ||
      longitude === null ||
      isNaN(Number(longitude)) ||
      Number(longitude) < -180 ||
      Number(longitude) > 180
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid longitude",
      });
    }

    // ------------------------------------------
    // Update current location
    // ------------------------------------------

    await pool.query(
      `
      UPDATE delivery_partners
      SET
        current_latitude = ?,
        current_longitude = ?,
        location_updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [
        Number(latitude),
        Number(longitude),
        deliveryPartnerId,
      ]
    );

    return res.status(200).json({
      success: true,
      message: "Location updated successfully",
      location: {
        latitude: Number(latitude),
        longitude: Number(longitude),
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    console.error(
      "Update delivery location error:",
      error.message
    );

    console.error("Full error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update delivery location",
    });
  }
};

// ============================================
// UPDATE DELIVERY PARTNER AVAILABILITY
// ============================================

const updateAvailability = async (req, res) => {
  try {
    const { availabilityStatus } = req.body;

    const deliveryPartnerId =
      req.user.deliveryPartnerId;

    const allowedStatuses = [
      "AVAILABLE",
      "BUSY",
      "OFFLINE",
    ];

    if (
      !allowedStatuses.includes(
        availabilityStatus
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid availability status",
      });
    }

    await pool.query(
      `
      UPDATE delivery_partners
      SET availability_status = ?
      WHERE id = ?
      `,
      [
        availabilityStatus,
        deliveryPartnerId,
      ]
    );

    return res.status(200).json({
      success: true,
      message:
        "Availability updated successfully",
      availabilityStatus,
    });
  } catch (error) {
    console.error(
      "Update availability error:",
      error.message
    );

    console.error("Full error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Failed to update availability",
    });
  }
};

module.exports = {
  updateDeliveryLocation,
  updateAvailability,
};