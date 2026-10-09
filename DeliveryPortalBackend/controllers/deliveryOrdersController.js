const pool = require("../config/db");

// ==================================================
// GET DELIVERY PARTNER ORDERS
// ==================================================

const getDeliveryOrders = async (req, res) => {
  try {
    const deliveryPartnerId =
      req.user.deliveryPartnerId;

    if (!deliveryPartnerId) {
      return res.status(400).json({
        success: false,
        message:
          "Delivery partner information is missing",
      });
    }

    // ------------------------------------------------
    // Get deliveries assigned to this delivery partner
    // ------------------------------------------------

    const [deliveries] = await pool.query(
      `
      SELECT
        d.id AS delivery_id,
        d.order_id,
        d.delivery_partner_id,

        d.pickup_time,
        d.picked_up_time,
        d.out_for_delivery_time,
        d.delivered_time,

        d.delivery_status,
        d.created_at AS delivery_created_at,
        d.updated_at AS delivery_updated_at,

        o.order_number,
        o.customer_id,
        o.supplier_id,

        o.total_amount,
        o.payment_status,
        o.order_status,
        o.shipping_address,

        o.created_at AS order_created_at,
        o.updated_at AS order_updated_at,

        customer_user.full_name AS customer_name,
        customer_user.email AS customer_email,
        customer_user.phone AS customer_phone,

        c.address AS customer_address,
        c.city AS customer_city,
        c.state AS customer_state,
        c.pincode AS customer_pincode,
        c.latitude AS customer_latitude,
        c.longitude AS customer_longitude,

        s.business_name AS supplier_name,
        s.phone AS supplier_phone,
        s.address AS supplier_address,
        s.city AS supplier_city,
        s.state AS supplier_state,
        s.pincode AS supplier_pincode,
        s.latitude AS supplier_latitude,
        s.longitude AS supplier_longitude,

        dp.current_latitude,
        dp.current_longitude,
        dp.location_updated_at

      FROM deliveries d

      INNER JOIN orders o
        ON o.id = d.order_id

      INNER JOIN customers c
        ON c.id = o.customer_id

      INNER JOIN users customer_user
        ON customer_user.id = c.user_id

      LEFT JOIN suppliers s
        ON s.id = o.supplier_id

      INNER JOIN delivery_partners dp
        ON dp.id = d.delivery_partner_id

      WHERE
        d.delivery_partner_id = ?

      ORDER BY
        d.created_at DESC
      `,
      [deliveryPartnerId]
    );

    // ------------------------------------------------
    // Return delivery information
    // ------------------------------------------------

    return res.status(200).json({
      success: true,

      deliveries: deliveries.map((delivery) => ({
        deliveryId:
          delivery.delivery_id,

        order: {
          id: delivery.order_id,

          orderNumber:
            delivery.order_number,

          totalAmount:
            Number(delivery.total_amount),

          paymentStatus:
            delivery.payment_status,

          orderStatus:
            delivery.order_status,

          shippingAddress:
            delivery.shipping_address,

          createdAt:
            delivery.order_created_at,

          updatedAt:
            delivery.order_updated_at,
        },

        customer: {
          id:
            delivery.customer_id,

          name:
            delivery.customer_name,

          email:
            delivery.customer_email,

          phone:
            delivery.customer_phone,

          address:
            delivery.customer_address,

          city:
            delivery.customer_city,

          state:
            delivery.customer_state,

          pincode:
            delivery.customer_pincode,

          latitude:
            delivery.customer_latitude,

          longitude:
            delivery.customer_longitude,
        },

        supplier:
          delivery.supplier_id
            ? {
                id:
                  delivery.supplier_id,

                businessName:
                  delivery.supplier_name,

                phone:
                  delivery.supplier_phone,

                address:
                  delivery.supplier_address,

                city:
                  delivery.supplier_city,

                state:
                  delivery.supplier_state,

                pincode:
                  delivery.supplier_pincode,

                latitude:
                  delivery.supplier_latitude,

                longitude:
                  delivery.supplier_longitude,
              }
            : null,

        deliveryPartner: {
          id:
            delivery.delivery_partner_id,

          latitude:
            delivery.current_latitude,

          longitude:
            delivery.current_longitude,

          locationUpdatedAt:
            delivery.location_updated_at,
        },

        deliveryStatus:
          delivery.delivery_status,

        pickupTime:
          delivery.pickup_time,

        pickedUpTime:
          delivery.picked_up_time,

        outForDeliveryTime:
          delivery.out_for_delivery_time,

        deliveredTime:
          delivery.delivered_time,

        createdAt:
          delivery.delivery_created_at,

        updatedAt:
          delivery.delivery_updated_at,
      })),
    });
  } catch (error) {
    console.error(
      "========================================"
    );

    console.error(
      "GET DELIVERY ORDERS ERROR"
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
        "Failed to load delivery orders",
    });
  }
};

// ==================================================
// EXPORT
// ==================================================

module.exports = {
  getDeliveryOrders,
};