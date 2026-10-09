const pool = require("../config/db");

// ============================================
// GET ALL PRODUCTS
// ============================================

const getProducts = async (req, res) => {
try {
const [products] = await pool.query(`
SELECT
p.id,
p.supplier_id,
p.product_name,
p.sku,
p.description,
p.price,
p.stock_quantity,
p.category,
p.image_url,
p.status,
p.created_at,
p.updated_at,

    s.id AS supplier_record_id,
    su.full_name AS supplier_name,
    su.email AS supplier_email,
    su.phone AS supplier_phone

  FROM products p

  LEFT JOIN suppliers s
    ON s.id = p.supplier_id

  LEFT JOIN users su
    ON su.id = s.user_id

  ORDER BY p.created_at DESC
`);

return res.status(200).json({
  success: true,
  products: products.map((product) => ({
    id: product.id,
    supplierId: product.supplier_id,
    productName: product.product_name,
    sku: product.sku,
    description: product.description,
    price: Number(product.price),
    stockQuantity: product.stock_quantity,
    category: product.category,
    imageUrl: product.image_url,
    status: product.status,
    supplier: product.supplier_name || null,
    supplierEmail: product.supplier_email || null,
    supplierPhone: product.supplier_phone || null,
    createdAt: product.created_at,
    updatedAt: product.updated_at,
  })),
});


} catch (error) {
console.error("Get products error:", error);


return res.status(500).json({
  success: false,
  message: "Failed to load products",
});


}
};

// ============================================
// GET SINGLE PRODUCT
// ============================================

const getProductById = async (req, res) => {
try {
const { id } = req.params;


if (!id || isNaN(Number(id))) {
  return res.status(400).json({
    success: false,
    message: "Invalid product ID",
  });
}

const [products] = await pool.query(
  `
  SELECT
    p.id,
    p.supplier_id,
    p.product_name,
    p.sku,
    p.description,
    p.price,
    p.stock_quantity,
    p.category,
    p.image_url,
    p.status,
    p.created_at,
    p.updated_at,

    s.id AS supplier_record_id,
    su.full_name AS supplier_name,
    su.email AS supplier_email,
    su.phone AS supplier_phone

  FROM products p

  LEFT JOIN suppliers s
    ON s.id = p.supplier_id

  LEFT JOIN users su
    ON su.id = s.user_id

  WHERE p.id = ?

  LIMIT 1
  `,
  [id]
);

if (products.length === 0) {
  return res.status(404).json({
    success: false,
    message: "Product not found",
  });
}

const product = products[0];

return res.status(200).json({
  success: true,
  product: {
    id: product.id,
    supplierId: product.supplier_id,
    productName: product.product_name,
    sku: product.sku,
    description: product.description,
    price: Number(product.price),
    stockQuantity: product.stock_quantity,
    category: product.category,
    imageUrl: product.image_url,
    status: product.status,
    supplier: product.supplier_name || null,
    supplierEmail: product.supplier_email || null,
    supplierPhone: product.supplier_phone || null,
    createdAt: product.created_at,
    updatedAt: product.updated_at,
  },
});


} catch (error) {
console.error("Get product by ID error:", error);


return res.status(500).json({
  success: false,
  message: "Failed to load product",
});

}
};

module.exports = {
getProducts,
getProductById,
};
