import {
  ArrowRight,
  Bell,
  CheckCircle2,
  Clock3,
  IndianRupee,
  LogOut,
  MapPin,
  Package,
  Star,
  Target,
  Truck,
  User,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../../Context/AuthContext";
import { reverseGeocode } from "../../Utils/reverseGeocode";

import "./DeliveryDashboard.css";

const API_BASE_URL = "http://localhost:5001/api";

const defaultOrder = {
  id: "SAG-10283",
  customer: "Priya Reddy",
  phone: "+91 99887 12345",
  address: "Madhapur, Hyderabad, Telangana",
  product: "Smart Watch Pro",
  sku: "SAG-SW-002",
  quantity: 1,
  supplier: "Digital Hub",
  supplierPhone: "+91 99887 66554",
  supplierAddress:
    "Electronic City, Bengaluru, Karnataka",
  amount: 4299,
  payment: "Paid",
  acceptedAt: "01 Oct 2026, 1:42 PM",
  supplierStatus: "Accepted",
  deliveryStatus: "Ready for Pickup",
};

const weeklyEarnings = [
  { day: "Mon", amount: 820 },
  { day: "Tue", amount: 1120 },
  { day: "Wed", amount: 980 },
  { day: "Thu", amount: 1340 },
  { day: "Fri", amount: 1240 },
  { day: "Sat", amount: 1580 },
  { day: "Sun", amount: 920 },
];

function DeliveryDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const { logout, token } = useAuth();

  const [currentHour, setCurrentHour] = useState(
    new Date().getHours()
  );

  const [unreadNotificationCount, setUnreadNotificationCount] =
    useState(0);

  const [locationStatus, setLocationStatus] =
    useState("starting");

  const [locationError, setLocationError] =
    useState("");

  const [currentAddressDetails, setCurrentAddressDetails] =
    useState(null);

  // ============================================
  // GREETING CLOCK
  // ============================================

  useEffect(() => {
    const updateGreetingTime = () => {
      setCurrentHour(new Date().getHours());
    };

    const interval = setInterval(
      updateGreetingTime,
      60000
    );

    return () => clearInterval(interval);
  }, []);

  // ============================================
  // UNREAD NOTIFICATIONS
  // ============================================

  useEffect(() => {
    const loadUnreadNotificationCount = async () => {
      try {
        if (!token) {
          setUnreadNotificationCount(0);
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
            data.message ||
              "Failed to load notifications"
          );
        }

        const notifications =
          data.notifications || [];

        const unreadCount = notifications.filter(
          (notification) =>
            notification.isRead === false
        ).length;

        setUnreadNotificationCount(
          unreadCount
        );
      } catch (error) {
        console.error(
          "Load unread notification count error:",
          error
        );

        setUnreadNotificationCount(0);
      }
    };

    loadUnreadNotificationCount();
  }, [token]);

  // ============================================
  // DELIVERY PARTNER GPS TRACKING
  // ============================================

  useEffect(() => {
    if (!token) {
      setLocationStatus("unavailable");
      return;
    }

    if (!navigator.geolocation) {
      setLocationStatus("unavailable");
      setLocationError(
        "GPS is not supported by this browser."
      );
      return;
    }

    let watchId = null;
    let isMounted = true;

    const updateAvailability = async (
      availabilityStatus
    ) => {
      try {
        await fetch(
          `${API_BASE_URL}/delivery/availability`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              availabilityStatus,
            }),
          }
        );
      } catch (error) {
        console.error(
          "Update delivery availability error:",
          error
        );
      }
    };

    const sendLocationToBackend = async (
      position
    ) => {
      try {
        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;

        const addressDetails = await reverseGeocode(
          latitude,
          longitude
        );

        if (isMounted && addressDetails) {
          setCurrentAddressDetails(addressDetails);
        }

        const response = await fetch(
          `${API_BASE_URL}/delivery/location`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              latitude,
              longitude,
              street: addressDetails?.street || "",
              area: addressDetails?.area || "",
              city: addressDetails?.city || "",
              state: addressDetails?.state || "",
              pincode: addressDetails?.pincode || "",
              formattedAddress:
                addressDetails?.formattedAddress || "",
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to update location"
          );
        }

        if (isMounted) {
          setLocationStatus("active");
          setLocationError("");
        }
      } catch (error) {
        console.error(
          "Send delivery location error:",
          error
        );

        if (isMounted) {
          setLocationStatus("error");
          setLocationError(
            "Unable to update your location."
          );
        }
      }
    };

    const handleLocationError = (error) => {
      console.error(
        "Browser geolocation error:",
        error
      );

      if (!isMounted) {
        return;
      }

      setLocationStatus("error");

      if (error.code === 1) {
        setLocationError(
          "Location permission was denied. Please allow location access."
        );
      } else if (error.code === 2) {
        setLocationError(
          "Your current location could not be determined."
        );
      } else if (error.code === 3) {
        setLocationError(
          "Location request timed out. Retrying..."
        );
      } else {
        setLocationError(
          "Unable to access your current location."
        );
      }
    };

    const startLocationTracking = async () => {
      try {
        setLocationStatus("requesting");

        await updateAvailability("AVAILABLE");

        watchId =
          navigator.geolocation.watchPosition(
            sendLocationToBackend,
            handleLocationError,
            {
              enableHighAccuracy: true,
              maximumAge: 10000,
              timeout: 15000,
            }
          );
      } catch (error) {
        console.error(
          "Start location tracking error:",
          error
        );

        if (isMounted) {
          setLocationStatus("error");
          setLocationError(
            "Unable to start location tracking."
          );
        }
      }
    };

    startLocationTracking();

    return () => {
      isMounted = false;

      if (watchId !== null) {
        navigator.geolocation.clearWatch(
          watchId
        );
      }
    };
  }, [token]);

  // ============================================
  // PAGE DATA
  // ============================================

  const greeting =
    currentHour < 12
      ? "Good morning"
      : currentHour < 17
        ? "Good afternoon"
        : "Good evening";

  const orderFromState = location.state?.order;

  const [storedOrder] = (() => {
    try {
      const saved = localStorage.getItem(
        "activeDeliveryOrder"
      );

      return saved ? [JSON.parse(saved)] : [null];
    } catch {
      return [null];
    }
  })();

  const activeOrder =
    orderFromState || storedOrder || defaultOrder;

  const statusSteps = [
    "Ready for Pickup",
    "Picked Up",
    "Out for Delivery",
    "Delivered",
  ];

  const currentStatusIndex = Math.max(
    statusSteps.indexOf(
      activeOrder.deliveryStatus
    ),
    0
  );

  // ============================================
  // ORDER ACTIONS
  // ============================================

  const getNextAction = () => {
    if (
      activeOrder.deliveryStatus ===
      "Ready for Pickup"
    ) {
      return "Confirm Pickup";
    }

    if (
      activeOrder.deliveryStatus ===
      "Picked Up"
    ) {
      return "Start Delivery";
    }

    if (
      activeOrder.deliveryStatus ===
      "Out for Delivery"
    ) {
      return "Mark Delivered";
    }

    return "Delivered";
  };

  const updateOrderStatus = () => {
    const nextStatusMap = {
      "Ready for Pickup": "Picked Up",
      "Picked Up": "Out for Delivery",
      "Out for Delivery": "Delivered",
    };

    const nextStatus =
      nextStatusMap[
        activeOrder.deliveryStatus
      ];

    if (!nextStatus) {
      return;
    }

    const updatedOrder = {
      ...activeOrder,
      deliveryStatus: nextStatus,
    };

    localStorage.setItem(
      "activeDeliveryOrder",
      JSON.stringify(updatedOrder)
    );

    if (nextStatus === "Delivered") {
      const existingHistory = JSON.parse(
        localStorage.getItem(
          "deliveryHistory"
        ) || "[]"
      );

      const updatedHistory = [
        updatedOrder,
        ...existingHistory.filter(
          (item) =>
            item.id !== updatedOrder.id
        ),
      ];

      localStorage.setItem(
        "deliveryHistory",
        JSON.stringify(updatedHistory)
      );

      localStorage.removeItem(
        "activeDeliveryOrder"
      );

      navigate("/delivery/history");
      return;
    }

    navigate("/delivery/dashboard", {
      replace: true,
      state: {
        order: updatedOrder,
      },
    });
  };

  const handleViewOrder = () => {
    navigate("/delivery/orders", {
      state: {
        order: activeOrder,
      },
    });
  };

  const handleTrackDelivery = () => {
    navigate("/delivery/tracking", {
      state: {
        order: activeOrder,
      },
    });
  };

  const openNotifications = () => {
    navigate("/delivery/notifications");
  };

  const handleLogout = async () => {
    localStorage.removeItem(
      "activeDeliveryOrder"
    );

    try {
      if (token) {
        await fetch(
          `${API_BASE_URL}/delivery/availability`,
          {
            method: "PATCH",
            headers: {
              "Content-Type":
                "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              availabilityStatus:
                "OFFLINE",
            }),
          }
        );
      }
    } catch (error) {
      console.error(
        "Set delivery partner offline error:",
        error
      );
    }

    logout();

    navigate("/delivery/login", {
      replace: true,
    });
  };

  const callCustomer = () => {
    window.alert(
      `Calling ${activeOrder.customer}`
    );
  };

  // ============================================
  // LOCATION STATUS UI
  // ============================================

  const getLocationStatusText = () => {
    if (locationStatus === "active") {
      return "Location Active";
    }

    if (locationStatus === "requesting") {
      return "Getting Location...";
    }

    if (locationStatus === "starting") {
      return "Starting GPS...";
    }

    if (locationStatus === "unavailable") {
      return "GPS Unavailable";
    }

    return "Location Error";
  };

  return (
    <div className="delivery-dashboard">
      <aside className="delivery-sidebar">
        <div className="delivery-sidebar-brand">
          <div className="delivery-sidebar-brand-icon">
            <Truck size={24} />
          </div>

          <div>
            <h2>Shop All Goods</h2>
            <span>Delivery Portal</span>
          </div>
        </div>

        <nav className="delivery-sidebar-nav">
          <button
            className="active"
            onClick={() =>
              navigate("/delivery/dashboard")
            }
          >
            <Package size={19} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() =>
              navigate("/delivery/orders")
            }
          >
            <Truck size={19} />
            <span>Assigned Orders</span>
          </button>

          <button
            onClick={() =>
              navigate("/delivery/tracking")
            }
          >
            <Target size={19} />
            <span>Live Tracking</span>
          </button>

          <button
            onClick={() =>
              navigate("/delivery/history")
            }
          >
            <Clock3 size={19} />
            <span>Delivery History</span>
          </button>

          <button
            onClick={() =>
              navigate("/delivery/profile")
            }
          >
            <User size={19} />
            <span>My Profile</span>
          </button>

          <button onClick={openNotifications}>
            <Bell size={19} />
            <span>Notifications</span>

            {unreadNotificationCount > 0 && (
              <span className="delivery-sidebar-notification-badge">
                {unreadNotificationCount}
              </span>
            )}
          </button>
        </nav>

        <div className="delivery-sidebar-bottom">
          <div className="delivery-sidebar-user">
            <div className="delivery-sidebar-avatar">
              RK
            </div>

            <div>
              <strong>Rahul Kumar</strong>
              <span>Delivery Partner</span>
            </div>
          </div>

          <button
            className="delivery-sidebar-logout"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="delivery-dashboard-main">
        <header className="delivery-dashboard-topbar">
          <div>
            <div className="delivery-dashboard-breadcrumb">
              Delivery Portal
              <ArrowRight size={14} />
              Dashboard
            </div>

            <h1>
              {greeting}, Rahul <span>👋</span>
            </h1>

            <p>
              Here's your delivery performance
              and today's progress.
            </p>
          </div>

          <div className="delivery-dashboard-top-actions">
            <button
              className="delivery-dashboard-notification-button"
              onClick={openNotifications}
              aria-label="Open notifications"
            >
              <Bell size={21} />

              {unreadNotificationCount > 0 && (
                <span>
                  {unreadNotificationCount}
                </span>
              )}
            </button>

            <div
              className={`delivery-dashboard-online ${
                locationStatus === "active"
                  ? "location-active"
                  : "location-inactive"
              }`}
              title={
                locationError ||
                "Delivery location status"
              }
            >
              <span>
                <MapPin size={13} />
              </span>

              {getLocationStatusText()}
            </div>
          </div>
        </header>

        {locationError && (
          <div className="delivery-location-alert">
            <MapPin size={18} />

            <div>
              <strong>
                Location update issue
              </strong>

              <span>{locationError}</span>
            </div>
          </div>
        )}

        {/* PRECISE LIVE LOCATION DETAILS */}
        <div className="delivery-precise-location-card">
          <div className="delivery-precise-location-header">
            <div className="delivery-precise-location-title">
              <MapPin size={20} />
              <h3>Precise Live Location Details</h3>
            </div>

            <span className="delivery-precise-location-tag">
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}></span>
              GPS & Street Geocoded
            </span>
          </div>

          <div className="delivery-precise-location-grid">
            <div className="delivery-precise-location-item">
              <label>Street / Road</label>
              <p>{currentAddressDetails?.street || "12th Main Road, Sector 4"}</p>
            </div>

            <div className="delivery-precise-location-item">
              <label>Area / Suburb</label>
              <p>{currentAddressDetails?.area || "HSR Layout"}</p>
            </div>

            <div className="delivery-precise-location-item">
              <label>City & Pincode</label>
              <p>
                {currentAddressDetails?.city || "Bengaluru"}
                {currentAddressDetails?.pincode ? ` - ${currentAddressDetails.pincode}` : " - 560102"}
              </p>
            </div>

            <div className="delivery-precise-location-item">
              <label>State & Country</label>
              <p>
                {currentAddressDetails?.state || "Karnataka"}
                {currentAddressDetails?.country ? `, ${currentAddressDetails.country}` : ", India"}
              </p>
            </div>
          </div>

          <div className="delivery-precise-location-item" style={{ marginTop: 12 }}>
            <label>Full Formatted Address Line</label>
            <p style={{ fontWeight: 500, fontSize: 13, color: '#475569' }}>
              {currentAddressDetails?.formattedAddress || "12th Main Road, Sector 4, HSR Layout, Bengaluru, Karnataka 560102"}
            </p>
          </div>
        </div>

        <section className="delivery-performance-grid">
          <article className="delivery-performance-card earnings">
            <div className="delivery-performance-icon">
              <IndianRupee size={21} />
            </div>

            <div>
              <span>Today's Earnings</span>
              <strong>₹1,240</strong>
              <small>
                +12.5% from yesterday
              </small>
            </div>
          </article>

          <article className="delivery-performance-card deliveries">
            <div className="delivery-performance-icon">
              <Package size={21} />
            </div>

            <div>
              <span>Completed Deliveries</span>
              <strong>8</strong>
              <small>
                10 deliveries assigned
              </small>
            </div>
          </article>

          <article className="delivery-performance-card success">
            <div className="delivery-performance-icon">
              <CheckCircle2 size={21} />
            </div>

            <div>
              <span>Success Rate</span>
              <strong>98%</strong>
              <small>
                Excellent delivery record
              </small>
            </div>
          </article>

          <article className="delivery-performance-card rating">
            <div className="delivery-performance-icon">
              <Star size={21} />
            </div>

            <div>
              <span>Customer Rating</span>
              <strong>4.8</strong>
              <small>
                Based on recent deliveries
              </small>
            </div>
          </article>
        </section>

        <section className="delivery-dashboard-grid">
          <div className="delivery-dashboard-left">
            <section className="delivery-panel delivery-progress-panel">
              <div className="delivery-panel-header">
                <div>
                  <span className="delivery-section-label">
                    TODAY'S PROGRESS
                  </span>

                  <h2>Delivery Progress</h2>
                </div>

                <div className="delivery-progress-number">
                  <strong>8</strong>
                  <span>/ 10</span>
                </div>
              </div>

              <div className="delivery-progress-bar">
                <div
                  className="delivery-progress-fill"
                  style={{ width: "80%" }}
                ></div>
              </div>

              <div className="delivery-progress-footer">
                <span>
                  80% completed
                </span>

                <strong>
                  2 deliveries remaining
                </strong>
              </div>
            </section>

            <section className="delivery-panel">
              <div className="delivery-panel-header">
                <div>
                  <span className="delivery-section-label">
                    EARNINGS OVERVIEW
                  </span>

                  <h2>Weekly Earnings</h2>
                </div>

                <div className="delivery-weekly-total">
                  ₹8,000
                </div>
              </div>

              <div className="delivery-earnings-chart">
                {weeklyEarnings.map(
                  (item) => {
                    const height =
                      Math.max(
                        22,
                        Math.round(
                          (item.amount /
                            1600) *
                            100
                        )
                      );

                    return (
                      <div
                        className="delivery-chart-column"
                        key={item.day}
                      >
                        <span className="delivery-chart-value">
                          ₹{item.amount}
                        </span>

                        <div className="delivery-chart-track">
                          <div
                            className="delivery-chart-bar"
                            style={{
                              height: `${height}%`,
                            }}
                          ></div>
                        </div>

                        <span className="delivery-chart-day">
                          {item.day}
                        </span>
                      </div>
                    );
                  }
                )}
              </div>
            </section>

            <section className="delivery-panel">
              <div className="delivery-panel-header">
                <div>
                  <span className="delivery-section-label">
                    PERFORMANCE
                  </span>

                  <h2>
                    Delivery Performance
                  </h2>
                </div>

                <div className="delivery-score-badge">
                  94 / 100
                </div>
              </div>

              <div className="delivery-performance-list">
                <div className="delivery-performance-row">
                  <div className="delivery-performance-row-title">
                    <span className="delivery-row-icon">
                      <Clock3 size={17} />
                    </span>

                    <div>
                      <strong>
                        On-time Rate
                      </strong>

                      <span>
                        Deliveries completed
                        on schedule
                      </span>
                    </div>
                  </div>

                  <div className="delivery-row-value">
                    <strong>96%</strong>

                    <div className="delivery-mini-progress">
                      <span
                        style={{
                          width: "96%",
                        }}
                      ></span>
                    </div>
                  </div>
                </div>

                <div className="delivery-performance-row">
                  <div className="delivery-performance-row-title">
                    <span className="delivery-row-icon">
                      <CheckCircle2
                        size={17}
                      />
                    </span>

                    <div>
                      <strong>
                        Success Rate
                      </strong>

                      <span>
                        Successful deliveries
                      </span>
                    </div>
                  </div>

                  <div className="delivery-row-value">
                    <strong>98%</strong>

                    <div className="delivery-mini-progress">
                      <span
                        style={{
                          width: "98%",
                        }}
                      ></span>
                    </div>
                  </div>
                </div>

                <div className="delivery-performance-row">
                  <div className="delivery-performance-row-title">
                    <span className="delivery-row-icon">
                      <Truck size={17} />
                    </span>

                    <div>
                      <strong>
                        Average Delivery Time
                      </strong>

                      <span>
                        Average time per delivery
                      </span>
                    </div>
                  </div>

                  <div className="delivery-row-value">
                    <strong>
                      28 min
                    </strong>

                    <div className="delivery-mini-progress">
                      <span
                        style={{
                          width: "82%",
                        }}
                      ></span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="delivery-dashboard-right">
            <section className="delivery-panel delivery-goal-panel">
              <div className="delivery-panel-header">
                <div>
                  <span className="delivery-section-label">
                    MONTHLY GOAL
                  </span>

                  <h2>
                    Delivery Target
                  </h2>
                </div>

                <Target size={21} />
              </div>

              <div className="delivery-goal-content">
                <div className="delivery-goal-ring">
                  <div>
                    <strong>82%</strong>
                    <span>completed</span>
                  </div>
                </div>

                <div className="delivery-goal-details">
                  <strong>
                    342 / 420
                  </strong>

                  <span>
                    deliveries completed
                  </span>

                  <small>
                    78 more deliveries to
                    reach your goal
                  </small>
                </div>
              </div>

              <div className="delivery-goal-bar">
                <span
                  style={{
                    width: "82%",
                  }}
                ></span>
              </div>
            </section>

            <section className="delivery-panel delivery-assignment-panel">
              <div className="delivery-panel-header">
                <div>
                  <span className="delivery-section-label">
                    CURRENT ASSIGNMENT
                  </span>

                  <h2>{activeOrder.id}</h2>
                </div>

                <span className="delivery-order-status">
                  {activeOrder.deliveryStatus}
                </span>
              </div>

              <div className="delivery-assignment-product">
                <div className="delivery-product-icon">
                  <Package size={24} />
                </div>

                <div>
                  <strong>
                    {activeOrder.product}
                  </strong>

                  <span>
                    SKU: {activeOrder.sku} · Qty{" "}
                    {activeOrder.quantity}
                  </span>
                </div>
              </div>

              <div className="delivery-assignment-info">
                <div>
                  <span>Customer</span>
                  <strong>
                    {activeOrder.customer}
                  </strong>
                </div>

                <div>
                  <span>Supplier</span>
                  <strong>
                    {activeOrder.supplier}
                  </strong>
                </div>

                <div>
                  <span>Amount</span>
                  <strong>
                    ₹{activeOrder.amount}
                  </strong>
                </div>

                <div>
                  <span>Payment</span>
                  <strong className="paid">
                    Paid
                  </strong>
                </div>
              </div>

              <div className="delivery-order-progress">
                {statusSteps.map(
                  (step, index) => (
                    <div
                      className={`delivery-order-step ${
                        index <=
                        currentStatusIndex
                          ? "completed"
                          : ""
                      }`}
                      key={step}
                    >
                      <div className="delivery-step-dot">
                        {index <=
                        currentStatusIndex ? (
                          <CheckCircle2
                            size={17}
                          />
                        ) : (
                          <span>
                            {index + 1}
                          </span>
                        )}
                      </div>

                      <span>{step}</span>
                    </div>
                  )
                )}
              </div>

              <div className="delivery-assignment-actions">
                <button
                  className="delivery-secondary-button"
                  onClick={
                    handleViewOrder
                  }
                >
                  View Order
                  <ArrowRight size={17} />
                </button>

                <button
                  className="delivery-primary-button"
                  onClick={
                    handleTrackDelivery
                  }
                >
                  <Target size={17} />
                  Track Delivery
                </button>
              </div>

              <button
                className="delivery-status-action"
                onClick={
                  updateOrderStatus
                }
                disabled={
                  activeOrder.deliveryStatus ===
                  "Delivered"
                }
              >
                {getNextAction()}
              </button>

              <button
                className="delivery-call-customer"
                onClick={callCustomer}
              >
                Call {activeOrder.customer}
              </button>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}

export default DeliveryDashboard;