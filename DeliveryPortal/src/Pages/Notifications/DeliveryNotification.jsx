
import {
  Bell,
  CheckCircle2,
  Clock3,
  Package,
  Truck,
  ArrowLeft,
  CheckCheck,
  XCircle,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../Context/AuthContext";

import "./DeliveryNotification.css";

const API_BASE_URL = "http://localhost:5001/api";

const DeliveryNotification = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ======================================================
  // LOAD NOTIFICATIONS
  // ======================================================

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        setError("Please login again.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/notifications`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load notifications"
        );
      }

      // TEMPORARY DEBUG
      console.log(
        "NOTIFICATIONS FROM BACKEND:",
        data.notifications
      );

      console.log(
        "NOTIFICATION COUNT:",
        (data.notifications || []).length
      );

      setNotifications(data.notifications || []);
    } catch (err) {
      console.error(
        "Load notifications error:",
        err
      );

      setError(
        err.message ||
          "Unable to load notifications"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadNotifications();
    }
  }, [token]);

  // ======================================================
  // MARK ONE NOTIFICATION AS READ
  // ======================================================

  const markAsRead = async (notificationId) => {
    try {
      if (!token) {
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update notification"
        );
      }

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                isRead: true,
              }
            : notification
        )
      );
    } catch (err) {
      console.error(
        "Mark notification as read error:",
        err
      );
    }
  };

  // ======================================================
  // MARK ALL AS READ
  // ======================================================

  const markAllAsRead = async () => {
    try {
      if (!token) {
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/notifications/read-all`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update notifications"
        );
      }

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );
    } catch (err) {
      console.error(
        "Mark all notifications error:",
        err
      );
    }
  };

  // ======================================================
  // NOTIFICATION ICON
  // ======================================================

  const getNotificationIcon = (type) => {
    switch (type) {
      case "DELIVERY_APPROVAL":
        return <CheckCircle2 />;

      case "DELIVERY_REJECTION":
        return <XCircle />;

      case "ORDER":
        return <Package />;

      case "SUPPLIER":
        return <Truck />;

      case "DELIVERY":
        return <Truck />;

      case "SYSTEM":
        return <Clock3 />;

      default:
        return <Bell />;
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  return (
    <div className="delivery-notification-page">
      {/* HEADER */}

      <div className="delivery-notification-header">
        <button
          type="button"
          className="delivery-notification-back"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="delivery-notification-title">
          <div className="delivery-notification-title-icon">
            <Bell size={22} />
          </div>

          <div>
            <h1>Notifications</h1>

            <p>
              Stay updated with your latest
              activities.
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            className="delivery-notification-mark-all"
            onClick={markAllAsRead}
          >
            <CheckCheck size={18} />
            Mark all as read
          </button>
        )}
      </div>

      {/* CONTENT */}

      <div className="delivery-notification-content">
        {loading && (
          <div className="delivery-notification-state">
            <Bell size={28} />
            <p>Loading notifications...</p>
          </div>
        )}

        {!loading && error && (
          <div className="delivery-notification-state error">
            <Bell size={28} />
            <p>{error}</p>

            <button
              type="button"
              onClick={loadNotifications}
            >
              Try Again
            </button>
          </div>
        )}

        {!loading &&
          !error &&
          notifications.length === 0 && (
            <div className="delivery-notification-state">
              <Bell size={36} />

              <h3>No notifications yet</h3>

              <p>
                You will see important updates here.
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          notifications.length > 0 && (
            <div className="delivery-notification-list">
              {notifications.map(
                (notification) => (
                  <div
                    key={notification.id}
                    className={`delivery-notification-card ${
                      notification.isRead
                        ? "read"
                        : "unread"
                    }`}
                    onClick={() => {
                      if (!notification.isRead) {
                        markAsRead(
                          notification.id
                        );
                      }
                    }}
                  >
                    <div
                      className={`delivery-notification-icon ${
                        notification.type
                          ?.toLowerCase()
                          .replaceAll("_", "-")
                      }`}
                    >
                      {getNotificationIcon(
                        notification.type
                      )}
                    </div>

                    <div className="delivery-notification-body">
                      <div className="delivery-notification-card-header">
                        <h3>
                          {notification.title}
                        </h3>

                        {!notification.isRead && (
                          <span className="delivery-notification-new">
                            New
                          </span>
                        )}
                      </div>

                      <p>
                        {notification.message}
                      </p>

                      <span className="delivery-notification-date">
                        {new Date(
                          notification.createdAt
                        ).toLocaleString()}
                      </span>
                    </div>

                    {!notification.isRead && (
                      <div className="delivery-notification-unread-dot" />
                    )}
                  </div>
                )
              )}
            </div>
          )}
      </div>
    </div>
  );
};

export default DeliveryNotification;
