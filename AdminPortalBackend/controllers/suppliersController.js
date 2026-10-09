const pool = require("../config/db");

// ============================================
// GET ALL SUPPLIERS
// ============================================

const getSuppliers = async (req, res) => {
  try {
    const [suppliers] = await pool.query(`
      SELECT
        s.id,
        s.user_id,
        s.business_name,
        s.phone AS supplier_phone,
        s.address,
        s.city,
        s.state,
        s.pincode,
        s.created_at,

        u.full_name,
        u.email,
        u.status

      FROM suppliers s

      INNER JOIN users u
        ON u.id = s.user_id

      ORDER BY s.created_at DESC
    `);

    return res.status(200).json({
      success: true,
      suppliers: suppliers.map((supplier) => ({
        id: supplier.id,
        userId: supplier.user_id,
        businessName: supplier.business_name,
        name: supplier.full_name,
        email: supplier.email,
        phone: supplier.supplier_phone,
        address: supplier.address,
        city: supplier.city,
        state: supplier.state,
        pincode: supplier.pincode,
        status: supplier.status,
        createdAt: supplier.created_at,
      })),
    });
  } catch (error) {
    console.error("Get suppliers error:", error.message);
    console.error("Full error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load suppliers",
    });
  }
};

// ============================================
// GET SINGLE SUPPLIER
// ============================================

const getSupplierById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: "Invalid supplier ID",
      });
    }

    const [suppliers] = await pool.query(
      `
      SELECT
        s.id,
        s.user_id,
        s.business_name,
        s.phone AS supplier_phone,
        s.address,
        s.city,
        s.state,
        s.pincode,
        s.created_at,

        u.full_name,
        u.email,
        u.status

      FROM suppliers s

      INNER JOIN users u
        ON u.id = s.user_id

      WHERE s.id = ?

      LIMIT 1
      `,
      [id]
    );

    if (suppliers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }

    const supplier = suppliers[0];

    return res.status(200).json({
      success: true,
      supplier: {
        id: supplier.id,
        userId: supplier.user_id,
        businessName: supplier.business_name,
        name: supplier.full_name,
        email: supplier.email,
        phone: supplier.supplier_phone,
        address: supplier.address,
        city: supplier.city,
        state: supplier.state,
        pincode: supplier.pincode,
        status: supplier.status,
        createdAt: supplier.created_at,
      },
    });
  } catch (error) {
    console.error("Get supplier by ID error:", error.message);
    console.error("Full error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load supplier",
    });
  }
};

module.exports = {
  getSuppliers,
  getSupplierById,
};