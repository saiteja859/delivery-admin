const pool = require("../config/db");

// ==================================================
// FIND NEAREST SUPPLIER FOR AN ORDER
// ==================================================

const findNearestSupplier = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId || isNaN(Number(orderId))) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    // ------------------------------------------------
    // Get order + customer location
    // ------------------------------------------------

    const [orders] = await pool.query(
      `
      SELECT
        o.id,
        o.order_number,
        o.customer_id,
        o.supplier_id,
        o.order_status,

        c.latitude AS customer_latitude,
        c.longitude AS customer_longitude

      FROM orders o

      INNER JOIN customers c
        ON c.id = o.customer_id

      WHERE o.id = ?

      LIMIT 1
      `,
      [orderId]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const order = orders[0];

    // ------------------------------------------------
    // Make sure order does not already have supplier
    // ------------------------------------------------

    if (order.supplier_id) {
      return res.status(400).json({
        success: false,
        message:
          "A supplier has already been selected for this order",
      });
    }

    // ------------------------------------------------
    // Make sure customer has location
    // ------------------------------------------------

    if (
      order.customer_latitude === null ||
      order.customer_longitude === null
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Customer location is not available for this order",
      });
    }

    // ------------------------------------------------
    // Find nearest active supplier
    //
    // 6371 = Earth's radius in kilometers
    // ------------------------------------------------

    const [suppliers] = await pool.query(
      `
      SELECT
        s.id,
        s.user_id,
        s.business_name,
        s.phone,
        s.address,
        s.city,
        s.state,
        s.pincode,
        s.latitude,
        s.longitude,

        (
          6371 * ACOS(
            LEAST(
              1,
              GREATEST(
                -1,
                COS(RADIANS(?))
                * COS(RADIANS(s.latitude))
                * COS(
                    RADIANS(s.longitude)
                    - RADIANS(?)
                  )
                + SIN(RADIANS(?))
                * SIN(RADIANS(s.latitude))
              )
            )
          )
        ) AS distance_km

      FROM suppliers s

      INNER JOIN users u
        ON u.id = s.user_id

      WHERE
        u.role = 'SUPPLIER'
        AND u.status = 'ACTIVE'
        AND s.latitude IS NOT NULL
        AND s.longitude IS NOT NULL

      ORDER BY distance_km ASC

      LIMIT 1
      `,
      [
        order.customer_latitude,
        order.customer_longitude,
        order.customer_latitude,
      ]
    );

    if (suppliers.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "No active supplier with location available",
      });
    }

    const nearestSupplier = suppliers[0];

    return res.status(200).json({
      success: true,
      message: "Nearest supplier found",
      supplier: {
        id: nearestSupplier.id,
        userId: nearestSupplier.user_id,
        businessName:
          nearestSupplier.business_name,
        phone: nearestSupplier.phone,
        address: nearestSupplier.address,
        city: nearestSupplier.city,
        state: nearestSupplier.state,
        pincode: nearestSupplier.pincode,
        latitude: nearestSupplier.latitude,
        longitude: nearestSupplier.longitude,
        distanceKm: Number(
          nearestSupplier.distance_km
        ),
      },
    });
  } catch (error) {
    console.error(
      "========================================"
    );
    console.error(
      "FIND NEAREST SUPPLIER ERROR"
    );
    console.error(
      "========================================"
    );
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    console.error("SQL State:", error.sqlState);
    console.error("SQL Message:", error.sqlMessage);
    console.error("Full Error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Failed to find nearest supplier",
    });
  }
};

// ==================================================
// FIND NEAREST AVAILABLE DELIVERY PARTNER
// ==================================================

const findNearestDeliveryPartner = async (
  req,
  res
) => {
  try {
    const { supplierId } = req.params;

    if (!supplierId || isNaN(Number(supplierId))) {
      return res.status(400).json({
        success: false,
        message: "Invalid supplier ID",
      });
    }

    // ------------------------------------------------
    // Get supplier location
    // ------------------------------------------------

    const [suppliers] = await pool.query(
      `
      SELECT
        id,
        business_name,
        latitude,
        longitude

      FROM suppliers

      WHERE id = ?

      LIMIT 1
      `,
      [supplierId]
    );

    if (suppliers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    const supplier = suppliers[0];

    if (
      supplier.latitude === null ||
      supplier.longitude === null
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Supplier location is not available",
      });
    }

    // ------------------------------------------------
    // Find nearest AVAILABLE delivery partner
    // ------------------------------------------------

    const [partners] = await pool.query(
      `
      SELECT
        dp.id,
        dp.user_id,
        dp.vehicle_type,
        dp.vehicle_number,
        dp.availability_status,
        dp.rating,
        dp.total_deliveries,
        dp.current_latitude,
        dp.current_longitude,

        u.full_name,
        u.email,
        u.phone,

        (
          6371 * ACOS(
            LEAST(
              1,
              GREATEST(
                -1,
                COS(RADIANS(?))
                * COS(RADIANS(dp.current_latitude))
                * COS(
                    RADIANS(dp.current_longitude)
                    - RADIANS(?)
                  )
                + SIN(RADIANS(?))
                * SIN(RADIANS(dp.current_latitude))
              )
            )
          )
        ) AS distance_km

      FROM delivery_partners dp

      INNER JOIN users u
        ON u.id = dp.user_id

      WHERE
        u.role = 'DELIVERY_PARTNER'
        AND u.status = 'ACTIVE'
        AND dp.availability_status = 'AVAILABLE'
        AND dp.current_latitude IS NOT NULL
        AND dp.current_longitude IS NOT NULL

      ORDER BY distance_km ASC

      LIMIT 1
      `,
      [
        supplier.latitude,
        supplier.longitude,
        supplier.latitude,
      ]
    );

    if (partners.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "No available delivery partner with location found",
      });
    }

    const nearestPartner = partners[0];

    return res.status(200).json({
      success: true,
      message:
        "Nearest delivery partner found",
      deliveryPartner: {
        id: nearestPartner.id,
        userId: nearestPartner.user_id,
        name: nearestPartner.full_name,
        email: nearestPartner.email,
        phone: nearestPartner.phone,
        vehicleType:
          nearestPartner.vehicle_type,
        vehicleNumber:
          nearestPartner.vehicle_number,
        availabilityStatus:
          nearestPartner.availability_status,
        rating: nearestPartner.rating,
        totalDeliveries:
          nearestPartner.total_deliveries,
        latitude:
          nearestPartner.current_latitude,
        longitude:
          nearestPartner.current_longitude,
        distanceKm: Number(
          nearestPartner.distance_km
        ),
      },
    });
  } catch (error) {
    console.error(
      "========================================"
    );
    console.error(
      "FIND NEAREST DELIVERY PARTNER ERROR"
    );
    console.error(
      "========================================"
    );
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    console.error("SQL State:", error.sqlState);
    console.error("SQL Message:", error.sqlMessage);
    console.error("Full Error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Failed to find nearest delivery partner",
    });
  }
};

// ==================================================
// CREATE DELIVERY ASSIGNMENT
// ==================================================

const createDeliveryAssignment = async (
  req,
  res
) => {
  const connection = await pool.getConnection();

  try {
    const { orderId } = req.params;

    if (!orderId || isNaN(Number(orderId))) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    // ------------------------------------------------
    // Start transaction
    // ------------------------------------------------

    await connection.beginTransaction();

    // ------------------------------------------------
    // Get order
    // ------------------------------------------------

    const [orders] = await connection.query(
      `
      SELECT
        id,
        order_number,
        customer_id,
        supplier_id,
        delivery_partner_id,
        order_status

      FROM orders

      WHERE id = ?

      LIMIT 1

      FOR UPDATE
      `,
      [orderId]
    );

    if (orders.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const order = orders[0];

    // ------------------------------------------------
    // Supplier must already be selected
    // ------------------------------------------------

    if (!order.supplier_id) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Supplier must be selected before assigning delivery",
      });
    }

    // ------------------------------------------------
    // Prevent duplicate delivery assignment
    // ------------------------------------------------

    const [existingDeliveries] =
      await connection.query(
        `
        SELECT
          id,
          delivery_partner_id,
          delivery_status

        FROM deliveries

        WHERE order_id = ?

        LIMIT 1
        `,
        [orderId]
      );

    if (existingDeliveries.length > 0) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message:
          "A delivery assignment already exists for this order",
        delivery: {
          id:
            existingDeliveries[0].id,

          deliveryPartnerId:
            existingDeliveries[0]
              .delivery_partner_id,

          status:
            existingDeliveries[0]
              .delivery_status,
        },
      });
    }

    // ------------------------------------------------
    // Get customer location
    // ------------------------------------------------

    const [customers] =
      await connection.query(
        `
        SELECT
          latitude,
          longitude

        FROM customers

        WHERE id = ?

        LIMIT 1
        `,
        [order.customer_id]
      );

    if (customers.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const customer = customers[0];

    if (
      customer.latitude === null ||
      customer.longitude === null
    ) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Customer location is not available",
      });
    }

    // ------------------------------------------------
    // Get supplier location
    // ------------------------------------------------

    const [suppliers] =
      await connection.query(
        `
        SELECT
          id,
          business_name,
          latitude,
          longitude

        FROM suppliers

        WHERE id = ?

        LIMIT 1
        `,
        [order.supplier_id]
      );

    if (suppliers.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    const supplier = suppliers[0];

    if (
      supplier.latitude === null ||
      supplier.longitude === null
    ) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message:
          "Supplier location is not available",
      });
    }

    // ------------------------------------------------
    // Find nearest AVAILABLE delivery partner
    // ------------------------------------------------

    const [partners] =
      await connection.query(
        `
        SELECT
          dp.id,
          dp.user_id,
          dp.vehicle_type,
          dp.vehicle_number,
          dp.availability_status,
          dp.rating,
          dp.total_deliveries,
          dp.current_latitude,
          dp.current_longitude,

          u.full_name,
          u.email,
          u.phone,

          (
            6371 * ACOS(
              LEAST(
                1,
                GREATEST(
                  -1,
                  COS(RADIANS(?))
                  * COS(
                      RADIANS(
                        dp.current_latitude
                      )
                    )
                  * COS(
                      RADIANS(
                        dp.current_longitude
                      )
                      - RADIANS(?)
                    )
                  + SIN(RADIANS(?))
                  * SIN(
                      RADIANS(
                        dp.current_latitude
                      )
                    )
                )
              )
            )
          ) AS distance_km

        FROM delivery_partners dp

        INNER JOIN users u
          ON u.id = dp.user_id

        WHERE
          u.role = 'DELIVERY_PARTNER'
          AND u.status = 'ACTIVE'
          AND dp.availability_status = 'AVAILABLE'
          AND dp.current_latitude IS NOT NULL
          AND dp.current_longitude IS NOT NULL

        ORDER BY distance_km ASC

        LIMIT 1

        FOR UPDATE
        `,
        [
          supplier.latitude,
          supplier.longitude,
          supplier.latitude,
        ]
      );

    if (partners.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message:
          "No available delivery partner with location found",
      });
    }

    const nearestPartner = partners[0];

    // ------------------------------------------------
    // Create delivery assignment
    // ------------------------------------------------

    const [deliveryResult] =
      await connection.query(
        `
        INSERT INTO deliveries (
          order_id,
          delivery_partner_id,
          delivery_status
        )

        VALUES (?, ?, 'ASSIGNED')
        `,
        [
          order.id,
          nearestPartner.id,
        ]
      );

    const deliveryId =
      deliveryResult.insertId;

    // ------------------------------------------------
    // Update order
    // ------------------------------------------------

    await connection.query(
      `
      UPDATE orders

      SET
        delivery_partner_id = ?,
        order_status = 'CONFIRMED'

      WHERE id = ?
      `,
      [
        nearestPartner.id,
        order.id,
      ]
    );

    // ------------------------------------------------
    // Create delivery tracking record
    // ------------------------------------------------

    await connection.query(
      `
      INSERT INTO delivery_tracking (
        order_id,
        delivery_partner_id,
        supplier_id,
        status,
        latitude,
        longitude,
        location_updated_at
      )

      VALUES (
        ?,
        ?,
        ?,
        'DELIVERY_REQUESTED',
        ?,
        ?,
        NOW()
      )
      `,
      [
        order.id,
        nearestPartner.id,
        order.supplier_id,
        nearestPartner.current_latitude,
        nearestPartner.current_longitude,
      ]
    );

    // ------------------------------------------------
    // Mark delivery partner as BUSY
    // ------------------------------------------------

    await connection.query(
      `
      UPDATE delivery_partners

      SET availability_status = 'BUSY'

      WHERE id = ?
      `,
      [nearestPartner.id]
    );

    // ------------------------------------------------
    // Commit transaction
    // ------------------------------------------------

    await connection.commit();

    return res.status(201).json({
      success: true,
      message:
        "Delivery assignment created successfully",

      delivery: {
        id:
          deliveryId,

        orderId:
          order.id,

        orderNumber:
          order.order_number,

        supplier: {
          id:
            supplier.id,

          businessName:
            supplier.business_name,
        },

        deliveryPartner: {
          id:
            nearestPartner.id,

          userId:
            nearestPartner.user_id,

          name:
            nearestPartner.full_name,

          email:
            nearestPartner.email,

          phone:
            nearestPartner.phone,

          vehicleType:
            nearestPartner.vehicle_type,

          vehicleNumber:
            nearestPartner.vehicle_number,

          distanceKm:
            Number(
              nearestPartner.distance_km
            ),
        },

        status:
          "ASSIGNED",
      },
    });
  } catch (error) {
    try {
      await connection.rollback();
    } catch (rollbackError) {
      console.error(
        "Rollback error:",
        rollbackError
      );
    }

    console.error(
      "========================================"
    );

    console.error(
      "CREATE DELIVERY ASSIGNMENT ERROR"
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

    return res.status(500).json({
      success: false,
      message:
        "Failed to create delivery assignment",
    });
  } finally {
    connection.release();
  }
};

// ==================================================
// EXPORT
// ==================================================

module.exports = {
  findNearestSupplier,
  findNearestDeliveryPartner,
  createDeliveryAssignment,
};