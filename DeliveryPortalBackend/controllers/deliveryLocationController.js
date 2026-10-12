const pool = require("../config/db");

// ============================================
// UPDATE DELIVERY PARTNER LOCATION
// ============================================

const updateDeliveryLocation = async (req, res) => {
  try {
    const {
      latitude,
      longitude,
      street,
      area,
      city,
      state,
      pincode,
      formattedAddress,
    } = req.body;

    const deliveryPartnerId = req.user.deliveryPartnerId;

    // Validate latitude
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

    // Validate longitude
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

    const cleanStreet = String(street || "").trim();
    const cleanArea = String(area || "").trim();
    const cleanCity = String(city || "").trim();
    const cleanState = String(state || "").trim();
    const cleanPincode = String(pincode || "").trim();
    const cleanFormattedAddress = String(formattedAddress || "").trim();

    // ------------------------------------------
    // Update current location in delivery_partners
    // ------------------------------------------
    await pool.query(
      `
      UPDATE delivery_partners
      SET
        current_latitude = ?,
        current_longitude = ?,
        current_street = ?,
        current_area = ?,
        current_city = ?,
        current_state = ?,
        current_pincode = ?,
        current_formatted_address = ?,
        location_updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [
        Number(latitude),
        Number(longitude),
        cleanStreet || null,
        cleanArea || null,
        cleanCity || null,
        cleanState || null,
        cleanPincode || null,
        cleanFormattedAddress || null,
        deliveryPartnerId,
      ]
    );

    // Also record history entry if partner has active delivery
    const [activeDeliveries] = await pool.query(
      `
      SELECT id FROM deliveries 
      WHERE delivery_partner_id = ? AND delivery_status IN ('ASSIGNED', 'READY_FOR_PICKUP', 'PICKED_UP', 'OUT_FOR_DELIVERY')
      ORDER BY updated_at DESC LIMIT 1
      `,
      [deliveryPartnerId]
    );

    if (activeDeliveries.length > 0) {
      const activeDeliveryId = activeDeliveries[0].id;
      await pool.query(
        `
        INSERT INTO delivery_locations
        (delivery_id, latitude, longitude, street, area, city, state, pincode, formatted_address)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          activeDeliveryId,
          Number(latitude),
          Number(longitude),
          cleanStreet || null,
          cleanArea || null,
          cleanCity || null,
          cleanState || null,
          cleanPincode || null,
          cleanFormattedAddress || null,
        ]
      );
    }

    return res.status(200).json({
      success: true,
      message: "Precise location details updated successfully",
      location: {
        latitude: Number(latitude),
        longitude: Number(longitude),
        street: cleanStreet,
        area: cleanArea,
        city: cleanCity,
        state: cleanState,
        pincode: cleanPincode,
        formattedAddress: cleanFormattedAddress,
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