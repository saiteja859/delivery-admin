
const pool = require("../config/db");

const getDashboardData = async (req, res) => {
  try {
    // ============================================
    // TOTAL ORDERS
    // ============================================

    const [orderCount] = await pool.query(`
      SELECT COUNT(*) AS total_orders
      FROM orders
    `);

    // ============================================
    // TOTAL REVENUE
    // Exclude cancelled orders
    // ============================================

    const [revenue] = await pool.query(`
      SELECT
        COALESCE(SUM(total_amount), 0) AS total_revenue
      FROM orders
      WHERE order_status <> 'CANCELLED'
    `);

    // ============================================
    // TOTAL CUSTOMERS
    // ============================================

    const [customerCount] = await pool.query(`
      SELECT COUNT(*) AS total_customers
      FROM customers
    `);

    // ============================================
    // PENDING DELIVERIES
    // ============================================

    const [pendingDeliveryCount] = await pool.query(`
      SELECT COUNT(*) AS pending_deliveries
      FROM deliveries
      WHERE delivery_status IN (
        'ASSIGNED',
        'READY_FOR_PICKUP',
        'PICKED_UP',
        'OUT_FOR_DELIVERY'
      )
    `);

    // ============================================
    // RECENT ORDERS
    // ============================================
    //
    // One order can contain multiple products.
    // We use GROUP_CONCAT so the dashboard can
    // display all product names in one row.
    //
    // IMPORTANT:
    // orders.customer_id references customers.id
    // in the Admin/Delivery database.
    //

    const [recentOrders] = await pool.query(`
      SELECT
        o.id,
        o.order_number,
        o.total_amount,
        o.order_status,
        o.created_at,

        u.full_name AS customer_name,

        GROUP_CONCAT(
          DISTINCT p.product_name
          ORDER BY p.product_name
          SEPARATOR ', '
        ) AS product_names

      FROM orders o

      INNER JOIN customers c
        ON c.id = o.customer_id

      INNER JOIN users u
        ON u.id = c.user_id

      LEFT JOIN order_items oi
        ON oi.order_id = o.id

      LEFT JOIN products p
        ON p.id = oi.product_id

      GROUP BY
        o.id,
        o.order_number,
        o.total_amount,
        o.order_status,
        o.created_at,
        u.full_name

      ORDER BY o.created_at DESC

      LIMIT 5
    `);

    // ============================================
    // RESPONSE
    // ============================================

    return res.status(200).json({
      success: true,

      stats: {
        totalOrders: Number(
          orderCount[0].total_orders
        ),

        totalRevenue: Number(
          revenue[0].total_revenue
        ),

        totalCustomers: Number(
          customerCount[0].total_customers
        ),

        pendingDeliveries: Number(
          pendingDeliveryCount[0].pending_deliveries
        ),
      },

      recentOrders: recentOrders.map((order) => ({
        id: order.id,

        orderNumber: order.order_number,

        customer: order.customer_name,

        product:
          order.product_names ||
          "Multiple products",

        amount: Number(
          order.total_amount
        ),

        status: order.order_status,

        createdAt: order.created_at,
      })),
    });

  } catch (error) {
    console.error(
      "Dashboard data error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard data",
    });
  }
};

module.exports = {
  getDashboardData,
};
