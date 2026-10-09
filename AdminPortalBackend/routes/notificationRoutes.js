const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// Get notifications for the Admin account
router.get("/", async (req, res) => {
try {
const adminUserId = 1;


const [notifications] = await pool.query(
  `SELECT
     id,
     user_id,
     title,
     message,
     notification_type,
     is_read,
     created_at
   FROM notifications
   WHERE user_id = ?
   ORDER BY created_at DESC
   LIMIT 50`,
  [adminUserId]
);

res.status(200).json({
  success: true,
  data: notifications,
});


} catch (error) {
console.error("Admin notifications error:", error);


res.status(500).json({
  success: false,
  message: "Failed to fetch admin notifications",
});


}
});

module.exports = router;
