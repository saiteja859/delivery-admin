const express = require("express");

const {
  getDeliveryNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} = require("../controllers/notificationController");

const authenticateDelivery = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticateDelivery);

router.get(
  "/",
  getDeliveryNotifications
);

router.patch(
  "/:id/read",
  markNotificationAsRead
);

router.patch(
  "/read-all",
  markAllNotificationsAsRead
);

module.exports = router;