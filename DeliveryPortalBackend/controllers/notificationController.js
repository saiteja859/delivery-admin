
const pool = require("../config/db");

// ================================================
// GET DELIVERY PARTNER NOTIFICATIONS
// ================================================

const getDeliveryNotifications = async (
  req,
  res
) => {
  try {
    const userId = req.user.userId;

    const [notifications] = await pool.query(
      `
      SELECT
        id,
        notification_type AS type,
        title,
        message,
        is_read,
        created_at
      FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      `,
      [userId]
    );

    return res.status(200).json({
      success: true,
      notifications: notifications.map(
        (notification) => ({
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          isRead: Boolean(
            notification.is_read
          ),
          createdAt:
            notification.created_at,
        })
      ),
    });
  } catch (error) {
    console.error(
      "========================================"
    );
    console.error(
      "GET DELIVERY NOTIFICATIONS ERROR"
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

    return res.status(500).json({
      success: false,
      message:
        "Failed to load notifications",
      error: error.message,
    });
  }
};

// ================================================
// MARK ONE NOTIFICATION AS READ
// ================================================

const markNotificationAsRead = async (
  req,
  res
) => {
  try {
    const userId = req.user.userId;
    const notificationId = Number(
      req.params.id
    );

    if (!Number.isInteger(notificationId)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid notification ID",
      });
    }

    const [result] = await pool.query(
      `
      UPDATE notifications
      SET is_read = 1
      WHERE id = ?
        AND user_id = ?
      `,
      [notificationId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Notification marked as read",
    });
  } catch (error) {
    console.error(
      "Mark notification as read error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update notification",
    });
  }
};

// ================================================
// MARK ALL NOTIFICATIONS AS READ
// ================================================

const markAllNotificationsAsRead = async (
  req,
  res
) => {
  try {
    const userId = req.user.userId;

    await pool.query(
      `
      UPDATE notifications
      SET is_read = 1
      WHERE user_id = ?
        AND is_read = 0
      `,
      [userId]
    );

    return res.status(200).json({
      success: true,
      message:
        "All notifications marked as read",
    });
  } catch (error) {
    console.error(
      "Mark all notifications as read error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update notifications",
    });
  }
};

module.exports = {
  getDeliveryNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};
