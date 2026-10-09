const pool = require("../config/db");

// ============================================
// GET ALL ORDERS
// ============================================

const getOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(`
      SELECT
        o.id,
        o.order_number,
        o.customer_id,
        o.delivery_partner_id,
        o.supplier_id,
        o.total_amount,
        o.payment_status,
        o.order_status,
        o.shipping_address,
        o.created_at,
        o.updated_at,

        u.full_name AS customer_name,
        u.email AS customer_email,
        u.phone AS customer_phone

      FROM orders o

      INNER JOIN customers c
        ON c.id = o.customer_id

      INNER JOIN users u
        ON u.id = c.user_id

      ORDER BY o.created_at DESC
    `);

    return res.status(200).json({
      success: true,

      orders: orders.map((order) => ({
        id: order.id,

        orderNumber:
          order.order_number,

        customerId:
          order.customer_id,

        customer:
          order.customer_name,

        customerEmail:
          order.customer_email,

        customerPhone:
          order.customer_phone,

        deliveryPartnerId:
          order.delivery_partner_id,

        supplierId:
          order.supplier_id,

        totalAmount:
          Number(order.total_amount),

        paymentStatus:
          order.payment_status,

        orderStatus:
          order.order_status,

        shippingAddress:
          order.shipping_address,

        createdAt:
          order.created_at,

        updatedAt:
          order.updated_at,
      })),
    });
  } catch (error) {
    console.error(
      "Get orders error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load orders",
    });
  }
};

// ============================================
// GET SINGLE ORDER
// ============================================

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid order ID",
      });
    }

    const [orders] = await pool.query(
      `
      SELECT
        o.id,
        o.order_number,
        o.customer_id,
        o.delivery_partner_id,
        o.supplier_id,
        o.total_amount,
        o.payment_status,
        o.order_status,
        o.shipping_address,
        o.created_at,
        o.updated_at,

        u.full_name AS customer_name,
        u.email AS customer_email,
        u.phone AS customer_phone

      FROM orders o

      INNER JOIN customers c
        ON c.id = o.customer_id

      INNER JOIN users u
        ON u.id = c.user_id

      WHERE o.id = ?

      LIMIT 1
      `,
      [id]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Order not found",
      });
    }

    const order = orders[0];

    return res.status(200).json({
      success: true,

      order: {
        id:
          order.id,

        orderNumber:
          order.order_number,

        customerId:
          order.customer_id,

        customer:
          order.customer_name,

        customerEmail:
          order.customer_email,

        customerPhone:
          order.customer_phone,

        deliveryPartnerId:
          order.delivery_partner_id,

        supplierId:
          order.supplier_id,

        totalAmount:
          Number(order.total_amount),

        paymentStatus:
          order.payment_status,

        orderStatus:
          order.order_status,

        shippingAddress:
          order.shipping_address,

        createdAt:
          order.created_at,

        updatedAt:
          order.updated_at,
      },
    });
  } catch (error) {
    console.error(
      "Get order by ID error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load order",
    });
  }
};

// ============================================
// INTEGRATE CUSTOMER/SELLER ORDER
// ============================================
//
// This endpoint receives an order from the
// Customer/Seller backend.
//
// Customer/Seller DB:
//     shop_all_goods_customer
//
// Admin DB:
//     shop_all_goods
//
// IMPORTANT:
// Customer/Seller user IDs are NOT copied directly
// into Admin customer IDs.
//
// We match the customer using their email.
//
// ============================================

const integrateOrder = async (req, res) => {
  const connection =
    await pool.getConnection();

  try {
    const {
      orderNumber,
      customer,
      totalAmount,
      paymentStatus,
      shippingAddress,
      items = [],
    } = req.body;

    // ========================================
    // VALIDATION
    // ========================================

    if (!orderNumber) {
      return res.status(400).json({
        success: false,
        message:
          "Order number is required",
      });
    }

    if (!customer) {
      return res.status(400).json({
        success: false,
        message:
          "Customer information is required",
      });
    }

    if (
      !customer.email ||
      !customer.name
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Customer name and email are required",
      });
    }

    if (
      totalAmount === undefined ||
      totalAmount === null
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Total amount is required",
      });
    }

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Order items are required",
      });
    }

    // ========================================
    // CHECK IF ORDER ALREADY EXISTS
    // ========================================

    const [existingOrders] =
      await connection.query(
        `
        SELECT id
        FROM orders
        WHERE order_number = ?
        LIMIT 1
        `,
        [orderNumber]
      );

    if (existingOrders.length > 0) {
      return res.status(200).json({
        success: true,
        alreadyIntegrated: true,
        message:
          "Order already exists in Admin system",
        adminOrderId:
          existingOrders[0].id,
      });
    }

    // ========================================
    // START TRANSACTION
    // ========================================

    await connection.beginTransaction();

    // ========================================
    // FIND OR CREATE ADMIN USER
    // ========================================

    let adminUserId = null;

    const [existingUsers] =
      await connection.query(
        `
        SELECT id
        FROM users
        WHERE email = ?
        LIMIT 1
        `,
        [customer.email]
      );

    if (existingUsers.length > 0) {
      adminUserId =
        existingUsers[0].id;

      // Keep customer information updated.
      await connection.query(
        `
        UPDATE users
        SET
          full_name = ?,
          phone = ?,
          role = 'CUSTOMER',
          status = 'ACTIVE'
        WHERE id = ?
        `,
        [
          customer.name,
          customer.phone || null,
          adminUserId,
        ]
      );
    } else {
      // The Admin users table requires a password_hash.
      // This account is only the Admin-side representation
      // of the Customer/Seller customer.
      //
      // It is NOT intended to be used for customer login.

      const placeholderPassword =
        "EXTERNAL_CUSTOMER_ACCOUNT";

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
          VALUES (?, ?, ?, ?, 'CUSTOMER', 'ACTIVE')
          `,
          [
            customer.name,
            customer.email,
            customer.phone || null,
            placeholderPassword,
          ]
        );

      adminUserId =
        userResult.insertId;
    }

    // ========================================
    // FIND OR CREATE ADMIN CUSTOMER
    // ========================================

    let adminCustomerId = null;

    const [existingCustomers] =
      await connection.query(
        `
        SELECT id
        FROM customers
        WHERE user_id = ?
        LIMIT 1
        `,
        [adminUserId]
      );

    if (existingCustomers.length > 0) {
      adminCustomerId =
        existingCustomers[0].id;

      await connection.query(
        `
        UPDATE customers
        SET address = ?
        WHERE id = ?
        `,
        [
          shippingAddress || null,
          adminCustomerId,
        ]
      );
    } else {
      const [customerResult] =
        await connection.query(
          `
          INSERT INTO customers (
            user_id,
            address
          )
          VALUES (?, ?)
          `,
          [
            adminUserId,
            shippingAddress || null,
          ]
        );

      adminCustomerId =
        customerResult.insertId;
    }

    // ========================================
    // CREATE ADMIN ORDER
    // ========================================

    const adminPaymentStatus =
      String(
        paymentStatus || "PENDING"
      ).toUpperCase();

    const allowedPaymentStatuses = [
      "PENDING",
      "PAID",
      "FAILED",
      "REFUNDED",
    ];

    const finalPaymentStatus =
      allowedPaymentStatuses.includes(
        adminPaymentStatus
      )
        ? adminPaymentStatus
        : "PENDING";

    const [orderResult] =
      await connection.query(
        `
        INSERT INTO orders (
          order_number,
          customer_id,
          delivery_partner_id,
          supplier_id,
          total_amount,
          payment_status,
          order_status,
          shipping_address
        )
        VALUES (?, ?, NULL, NULL, ?, ?, 'PLACED', ?)
        `,
        [
          orderNumber,
          adminCustomerId,
          Number(totalAmount),
          finalPaymentStatus,
          shippingAddress || "",
        ]
      );

    const adminOrderId =
      orderResult.insertId;

    // ========================================
    // CREATE ADMIN ORDER ITEMS
    // ========================================

    for (const item of items) {
      let adminProductId = null;

      // Try to match by SKU if one is supplied.
      if (item.sku) {
        const [products] =
          await connection.query(
            `
            SELECT id
            FROM products
            WHERE sku = ?
            LIMIT 1
            `,
            [item.sku]
          );

        if (products.length > 0) {
          adminProductId =
            products[0].id;
        }
      }

      // If there is no matching Admin product,
      // create a temporary Admin product record.
      if (!adminProductId) {
        const safeSku =
          item.sku ||
          `EXT-${orderNumber}-${item.productId}`;

        const [existingSku] =
          await connection.query(
            `
            SELECT id
            FROM products
            WHERE sku = ?
            LIMIT 1
            `,
            [safeSku]
          );

        if (existingSku.length > 0) {
          adminProductId =
            existingSku[0].id;
        } else {
          const [productResult] =
            await connection.query(
              `
              INSERT INTO products (
                supplier_id,
                product_name,
                sku,
                description,
                price,
                stock_quantity,
                category,
                image_url,
                status
              )
              VALUES (
                NULL,
                ?,
                ?,
                ?,
                ?,
                0,
                ?,
                ?,
                'ACTIVE'
              )
              `,
              [
                item.productName ||
                  "External Product",

                safeSku,

                item.description ||
                  "Product synchronized from Customer/Seller system",

                Number(item.price || 0),

                item.category ||
                  "Other",

                item.productImage ||
                  null,
              ]
            );

          adminProductId =
            productResult.insertId;
        }
      }

      const quantity =
        Math.max(
          1,
          Number(item.quantity || 1)
        );

      const unitPrice =
        Number(item.price || 0);

      const subtotal =
        unitPrice * quantity;

      await connection.query(
        `
        INSERT INTO order_items (
          order_id,
          product_id,
          quantity,
          unit_price,
          subtotal
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          adminOrderId,
          adminProductId,
          quantity,
          unitPrice,
          subtotal,
        ]
      );
    }

    // ========================================
    // CREATE DELIVERY RECORD
    // ========================================

    await connection.query(
      `
      INSERT INTO deliveries (
        order_id,
        delivery_partner_id,
        delivery_status
      )
      VALUES (?, NULL, 'ASSIGNED')
      `,
      [adminOrderId]
    );

    // ========================================
    // CREATE ADMIN ORDER NOTIFICATION
    // ========================================
    //
    // Admin user ID = 1
    //
    // This notification starts as unread.
    // The Admin sidebar will later count
    // unread ORDER notifications.
    //
    // ========================================

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
        1,
        "New Order Received",
        `New order ${orderNumber} has been placed.`,
        "ORDER",
      ]
    );

    // ========================================
    // COMMIT
    // ========================================

    await connection.commit();

    console.log(
      `Order ${orderNumber} integrated into Admin system as order ${adminOrderId}`
    );

    console.log(
      `Unread order notification created for Admin user 1`
    );

    return res.status(201).json({
      success: true,

      message:
        "Order integrated into Admin system successfully",

      adminOrderId,

      orderNumber,
    });
  } catch (error) {
    await connection.rollback();

    console.error(
      "Order integration error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to integrate order into Admin system",
      error:
        error.message,
    });
  } finally {
    connection.release();
  }
};

// ============================================
// EXPORT
// ============================================

module.exports = {
  getOrders,
  getOrderById,
  integrateOrder,
};