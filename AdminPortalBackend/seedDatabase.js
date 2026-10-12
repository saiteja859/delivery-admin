require("dotenv").config();
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

async function seed() {
  const dbConfig = {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "123456",
  };

  console.log("Connecting to MySQL server...");
  const connection = await mysql.createConnection(dbConfig);

  console.log("Resetting database shop_all_goods to fresh unified schema...");
  await connection.query("DROP DATABASE IF EXISTS shop_all_goods;");
  await connection.query("CREATE DATABASE shop_all_goods;");
  await connection.query("USE shop_all_goods;");

  console.log("Creating tables with common unified schema...");

  // 1. Users table
  await connection.query(`
    CREATE TABLE users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      full_name VARCHAR(100) NOT NULL,
      email VARCHAR(150) NOT NULL UNIQUE,
      phone VARCHAR(20),
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('ADMIN', 'DELIVERY_PARTNER', 'CUSTOMER', 'SUPPLIER') NOT NULL,
      status ENUM('ACTIVE', 'INACTIVE', 'BLOCKED') DEFAULT 'ACTIVE',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `);

  // 2. Admins table
  await connection.query(`
    CREATE TABLE admins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_admins_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 3. Customers table
  await connection.query(`
    CREATE TABLE customers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL UNIQUE,
      address TEXT,
      city VARCHAR(100),
      state VARCHAR(100),
      pincode VARCHAR(10),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_customers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 4. Delivery Partners table
  await connection.query(`
    CREATE TABLE delivery_partners (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL UNIQUE,
      vehicle_type VARCHAR(50),
      vehicle_number VARCHAR(30),
      license_number VARCHAR(50),
      availability_status ENUM('AVAILABLE', 'BUSY', 'OFFLINE') DEFAULT 'OFFLINE',
      rating DECIMAL(3,2) DEFAULT 0.00,
      total_deliveries INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_delivery_partners_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 5. Suppliers table
  await connection.query(`
    CREATE TABLE suppliers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL UNIQUE,
      business_name VARCHAR(150) NOT NULL,
      phone VARCHAR(20),
      address TEXT,
      city VARCHAR(100),
      state VARCHAR(100),
      pincode VARCHAR(10),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_suppliers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 6. Products table
  await connection.query(`
    CREATE TABLE products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      supplier_id INT,
      product_name VARCHAR(150) NOT NULL,
      sku VARCHAR(100) NOT NULL UNIQUE,
      description TEXT,
      price DECIMAL(10,2) NOT NULL,
      stock_quantity INT DEFAULT 0,
      category VARCHAR(100),
      image_url VARCHAR(500),
      status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_products_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
    );
  `);

  // 7. Orders table
  await connection.query(`
    CREATE TABLE orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_number VARCHAR(50) NOT NULL UNIQUE,
      customer_id INT NOT NULL,
      delivery_partner_id INT,
      supplier_id INT,
      total_amount DECIMAL(10,2) NOT NULL,
      payment_status ENUM('PENDING', 'PAID', 'FAILED', 'REFUNDED') DEFAULT 'PENDING',
      order_status ENUM('PLACED', 'CONFIRMED', 'READY_FOR_PICKUP', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED') DEFAULT 'PLACED',
      shipping_address TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
      CONSTRAINT fk_orders_delivery_partner FOREIGN KEY (delivery_partner_id) REFERENCES delivery_partners(id) ON DELETE SET NULL,
      CONSTRAINT fk_orders_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
    );
  `);

  // 8. Order Items table
  await connection.query(`
    CREATE TABLE order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      product_id INT NOT NULL,
      quantity INT NOT NULL,
      unit_price DECIMAL(10,2) NOT NULL,
      subtotal DECIMAL(10,2) NOT NULL,
      CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id)
    );
  `);

  // 9. Deliveries table
  await connection.query(`
    CREATE TABLE deliveries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL UNIQUE,
      delivery_partner_id INT,
      pickup_time DATETIME,
      picked_up_time DATETIME,
      out_for_delivery_time DATETIME,
      delivered_time DATETIME,
      delivery_status ENUM('ASSIGNED', 'READY_FOR_PICKUP', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED') DEFAULT 'ASSIGNED',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_deliveries_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      CONSTRAINT fk_deliveries_partner FOREIGN KEY (delivery_partner_id) REFERENCES delivery_partners(id) ON DELETE SET NULL
    );
  `);

  // 10. Delivery Locations table
  await connection.query(`
    CREATE TABLE delivery_locations (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      delivery_id INT NOT NULL,
      latitude DECIMAL(10,7) NOT NULL,
      longitude DECIMAL(10,7) NOT NULL,
      recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_delivery_locations_delivery FOREIGN KEY (delivery_id) REFERENCES deliveries(id) ON DELETE CASCADE
    );
  `);

  // 11. Notifications table
  await connection.query(`
    CREATE TABLE notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      title VARCHAR(200) NOT NULL,
      message TEXT NOT NULL,
      notification_type VARCHAR(50),
      is_read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 12. Payments table
  await connection.query(`
    CREATE TABLE payments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      transaction_id VARCHAR(150) UNIQUE,
      amount DECIMAL(10,2) NOT NULL,
      payment_method VARCHAR(50),
      payment_status ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED') DEFAULT 'PENDING',
      paid_at DATETIME,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );
  `);

  // 13. Delivery Partner Registrations table
  await connection.query(`
    CREATE TABLE delivery_partner_registrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      full_name VARCHAR(100) NOT NULL,
      email VARCHAR(150) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      password_hash VARCHAR(255),
      license_number VARCHAR(50),
      address TEXT,
      city VARCHAR(100),
      state VARCHAR(100),
      pincode VARCHAR(10),
      registration_status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
      rejection_reason TEXT,
      reviewed_by INT,
      reviewed_at DATETIME,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_delivery_partner_registrations_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
    );
  `);

  console.log("Seeding dummy data into shop_all_goods...");

  // Hashes
  const adminPassHash = await bcrypt.hash("admin123", 10);
  const deliveryPassHash = await bcrypt.hash("delivery123", 10);
  const customerPassHash = await bcrypt.hash("customer123", 10);
  const supplierPassHash = await bcrypt.hash("supplier123", 10);

  // Helper insert user
  async function insertUser(fullName, email, phone, passwordHash, role) {
    const [res] = await connection.query(
      "INSERT INTO users (full_name, email, phone, password_hash, role, status) VALUES (?, ?, ?, ?, ?, 'ACTIVE')",
      [fullName, email, phone, passwordHash, role]
    );
    return res.insertId;
  }

  // 1. Admin Users
  const admin1Id = await insertUser("Shop All Goods Admin", "admin@shopallgoods.com", "+1-800-555-0199", adminPassHash, "ADMIN");
  const admin2Id = await insertUser("System Admin", "admin@admin.com", "+1-800-555-0100", adminPassHash, "ADMIN");

  await connection.query("INSERT INTO admins (user_id) VALUES (?), (?)", [admin1Id, admin2Id]);

  // 2. Delivery Partner Users
  const dp1UserId = await insertUser("Ravi Kumar", "ravi.kumar@shopallgoods.com", "+91-9876543210", deliveryPassHash, "DELIVERY_PARTNER");
  const dp2UserId = await insertUser("Delivery Partner", "delivery@shopallgoods.com", "+91-9876543211", deliveryPassHash, "DELIVERY_PARTNER");

  const [dp1Res] = await connection.query(
    "INSERT INTO delivery_partners (user_id, vehicle_type, vehicle_number, license_number, availability_status, rating, total_deliveries) VALUES (?, 'Bike', 'MH-12-AB-1234', 'DL-987654321', 'AVAILABLE', 4.85, 42)",
    [dp1UserId]
  );
  const dp1Id = dp1Res.insertId;

  const [dp2Res] = await connection.query(
    "INSERT INTO delivery_partners (user_id, vehicle_type, vehicle_number, license_number, availability_status, rating, total_deliveries) VALUES (?, 'Scooter', 'KA-01-XY-5678', 'DL-123456789', 'AVAILABLE', 4.90, 18)",
    [dp2UserId]
  );
  const dp2Id = dp2Res.insertId;

  // 3. Customer Users
  const cust1UserId = await insertUser("John Doe", "customer@shopallgoods.com", "+1-555-0144", customerPassHash, "CUSTOMER");
  const cust2UserId = await insertUser("Jane Smith", "jane.smith@example.com", "+1-555-0188", customerPassHash, "CUSTOMER");

  const [c1Res] = await connection.query(
    "INSERT INTO customers (user_id, address, city, state, pincode) VALUES (?, '123 Elm Street, Suite 4B', 'New York', 'NY', '10001')",
    [cust1UserId]
  );
  const cust1Id = c1Res.insertId;

  const [c2Res] = await connection.query(
    "INSERT INTO customers (user_id, address, city, state, pincode) VALUES (?, '456 Oak Avenue', 'Los Angeles', 'CA', '90001')",
    [cust2UserId]
  );
  const cust2Id = c2Res.insertId;

  // 4. Supplier Users
  const sup1UserId = await insertUser("Tech Supplies Ltd", "supplier@techsupplies.com", "+1-800-555-0155", supplierPassHash, "SUPPLIER");
  const sup2UserId = await insertUser("Fresh Goods Mart", "supplier@freshgoods.com", "+1-800-555-0177", supplierPassHash, "SUPPLIER");

  const [s1Res] = await connection.query(
    "INSERT INTO suppliers (user_id, business_name, phone, address, city, state, pincode) VALUES (?, 'Tech Supplies Ltd', '+1-800-555-0155', '789 Innovation Way', 'San Jose', 'CA', '95110')",
    [sup1UserId]
  );
  const sup1Id = s1Res.insertId;

  const [s2Res] = await connection.query(
    "INSERT INTO suppliers (user_id, business_name, phone, address, city, state, pincode) VALUES (?, 'Fresh Goods Mart', '+1-800-555-0177', '321 Organic Lane', 'Seattle', 'WA', '98101')",
    [sup2UserId]
  );
  const sup2Id = s2Res.insertId;

  // 5. Products
  const productsData = [
    { name: "Wireless Noise-Canceling Headphones", sku: "PROD-HEADPHONE-001", price: 149.99, stock: 50, cat: "Electronics", supId: sup1Id, img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500" },
    { name: "Smart Fitness Watch", sku: "PROD-WATCH-002", price: 99.50, stock: 35, cat: "Electronics", supId: sup1Id, img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500" },
    { name: "Organic Roasted Coffee Beans (1kg)", sku: "PROD-COFFEE-003", price: 24.99, stock: 120, cat: "Groceries", supId: sup2Id, img: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500" },
    { name: "Premium Cotton T-Shirt", sku: "PROD-TSHIRT-004", price: 19.99, stock: 200, cat: "Apparel", supId: sup2Id, img: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500" },
    { name: "Ergonomic Office Chair", sku: "PROD-CHAIR-005", price: 229.00, stock: 15, cat: "Furniture", supId: sup1Id, img: "https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?w=500" }
  ];

  const productIds = [];
  for (const p of productsData) {
    const [res] = await connection.query(
      "INSERT INTO products (supplier_id, product_name, sku, description, price, stock_quantity, category, image_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')",
      [p.supId, p.name, p.sku, `High quality ${p.name}`, p.price, p.stock, p.cat, p.img]
    );
    productIds.push(res.insertId);
  }

  // 6. Orders & Deliveries
  const ordersData = [
    {
      num: "ORD-2026-1001",
      custId: cust1Id,
      dpId: dp1Id,
      supId: sup1Id,
      total: 149.99,
      payStatus: "PAID",
      orderStatus: "READY_FOR_PICKUP",
      addr: "123 Elm Street, Suite 4B, New York, NY 10001",
      delivStatus: "READY_FOR_PICKUP",
      prodId: productIds[0],
      qty: 1
    },
    {
      num: "ORD-2026-1002",
      custId: cust2Id,
      dpId: dp1Id,
      supId: sup2Id,
      total: 44.98,
      payStatus: "PAID",
      orderStatus: "OUT_FOR_DELIVERY",
      addr: "456 Oak Avenue, Los Angeles, CA 90001",
      delivStatus: "OUT_FOR_DELIVERY",
      prodId: productIds[2],
      qty: 2
    },
    {
      num: "ORD-2026-1003",
      custId: cust1Id,
      dpId: dp2Id,
      supId: sup2Id,
      total: 19.99,
      payStatus: "PAID",
      orderStatus: "DELIVERED",
      addr: "123 Elm Street, Suite 4B, New York, NY 10001",
      delivStatus: "DELIVERED",
      prodId: productIds[3],
      qty: 1
    }
  ];

  for (const o of ordersData) {
    const [res] = await connection.query(
      "INSERT INTO orders (order_number, customer_id, delivery_partner_id, supplier_id, total_amount, payment_status, order_status, shipping_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [o.num, o.custId, o.dpId, o.supId, o.total, o.payStatus, o.orderStatus, o.addr]
    );
    const orderId = res.insertId;

    // Add order item
    await connection.query(
      "INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)",
      [orderId, o.prodId, o.qty, o.total / o.qty, o.total]
    );

    // Add delivery record
    await connection.query(
      "INSERT INTO deliveries (order_id, delivery_partner_id, pickup_time, delivery_status) VALUES (?, ?, NOW(), ?)",
      [orderId, o.dpId, o.delivStatus]
    );

    // Add payment record
    await connection.query(
      "INSERT INTO payments (order_id, transaction_id, amount, payment_method, payment_status, paid_at) VALUES (?, ?, ?, 'CREDIT_CARD', 'SUCCESS', NOW())",
      [orderId, `TXN-${o.num}`, o.total]
    );
  }

  // 7. Delivery Partner Pending Application
  const regPassHash = await bcrypt.hash("applicant123", 10);
  await connection.query(
    `INSERT INTO delivery_partner_registrations 
     (full_name, email, phone, password_hash, license_number, address, city, state, pincode, registration_status)
     VALUES ('Amit Verma', 'applicant@example.com', '+91-9988776655', ?, 'DL-554433221', '78 MG Road', 'Mumbai', 'Maharashtra', '400001', 'PENDING')`,
    [regPassHash]
  );

  // 8. Notifications
  await connection.query(
    "INSERT INTO notifications (user_id, title, message, notification_type) VALUES (?, 'Welcome Admin', 'Admin portal initialized successfully with shop goods data', 'SYSTEM')",
    [admin1Id]
  );

  console.log("\n========================================================");
  console.log("✅ SUCCESS: Database shop_all_goods reset & seeded!");
  console.log("========================================================\n");
  console.log("🔑 DUMMY LOGIN CREDENTIALS:");
  console.log("--------------------------------------------------------");
  console.log("1. ADMIN PORTAL (http://localhost:3000)");
  console.log("   Email:    admin@shopallgoods.com   (OR admin@admin.com)");
  console.log("   Password: admin123");
  console.log("--------------------------------------------------------");
  console.log("2. DELIVERY PORTAL (http://localhost:3001)");
  console.log("   Email:    ravi.kumar@shopallgoods.com  (OR delivery@shopallgoods.com)");
  console.log("   Password: delivery123");
  console.log("--------------------------------------------------------");
  console.log("3. SAMPLE DATA CREATED:");
  console.log("   - 5 Products across Electronics, Groceries, Apparel, Furniture");
  console.log("   - 3 Real Orders with linked Deliveries & Payments");
  console.log("   - 1 Pending Delivery Partner Application for Admin Review");
  console.log("========================================================\n");

  await connection.end();
}

seed().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
