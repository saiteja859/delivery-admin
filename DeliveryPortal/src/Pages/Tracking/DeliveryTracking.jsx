import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  MapPin,
  Navigation,
  Package,
  Phone,
  Truck,
  User,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import "./DeliveryTracking.css";

function DeliveryTracking() {
  const navigate = useNavigate();
  const location = useLocation();

  const orderFromState = location.state?.order;

  let storedOrder = null;

  try {
    const savedOrder = localStorage.getItem("activeDeliveryOrder");
    storedOrder = savedOrder ? JSON.parse(savedOrder) : null;
  } catch {
    storedOrder = null;
  }

  const activeOrder = orderFromState || storedOrder;

  const activeStatuses = [
    "Ready for Pickup",
    "Picked Up",
    "Out for Delivery",
  ];

  const hasActiveAcceptedOrder =
    activeOrder &&
    activeOrder.supplierStatus === "Accepted" &&
    activeStatuses.includes(activeOrder.deliveryStatus);

  if (!hasActiveAcceptedOrder) {
    return (
      <div className="delivery-tracking-page">
        <header className="delivery-tracking-topbar">
          <button
            className="delivery-tracking-back"
            onClick={() => navigate("/delivery/dashboard")}
          >
            <ArrowLeft size={19} />
            Dashboard
          </button>

          <div className="delivery-tracking-brand">
            <div className="delivery-tracking-brand-icon">
              <Truck size={21} />
            </div>

            <div>
              <strong>Shop All Goods</strong>
              <span>Live Tracking</span>
            </div>
          </div>
        </header>

        <main className="delivery-tracking-locked">
          <div className="delivery-tracking-locked-card">
            <div className="delivery-tracking-locked-icon">
              <Navigation size={38} />
            </div>

            <span className="delivery-tracking-label">
              LIVE TRACKING
            </span>

            <h1>Tracking will be available after you accept an order.</h1>

            <p>
              Once an order is accepted and becomes an active delivery,
              your live delivery map and order location will appear here.
            </p>

            <div className="delivery-tracking-locked-info">
              <div>
                <CheckCircle2 size={18} />
                <span>Accept an assigned order</span>
              </div>

              <div>
                <MapPin size={18} />
                <span>Live tracking becomes available</span>
              </div>

              <div>
                <Truck size={18} />
                <span>Track your delivery progress</span>
              </div>
            </div>

            <button
              className="delivery-tracking-primary-button"
              onClick={() => navigate("/delivery/orders")}
            >
              View Assigned Orders
            </button>
          </div>
        </main>
      </div>
    );
  }

  const statusSteps = [
    "Ready for Pickup",
    "Picked Up",
    "Out for Delivery",
  ];

  const currentStep = statusSteps.indexOf(
    activeOrder.deliveryStatus
  );

  const customerLat = 17.4485;
  const customerLng = 78.3908;

  const deliveryLat = 17.435,
    deliveryLng = 78.401;

  const pickupLat = 17.4622;
  const pickupLng = 78.3657;

  const getStatusMessage = () => {
    if (activeOrder.deliveryStatus === "Ready for Pickup") {
      return "Head to the supplier to pick up this order.";
    }

    if (activeOrder.deliveryStatus === "Picked Up") {
      return "Order picked up. Start heading toward the customer.";
    }

    return "You are currently on the way to the customer.";
  };

  const callCustomer = () => {
    window.alert(`Calling ${activeOrder.customer}`);
  };

  const handleStatusUpdate = () => {
    const nextStatusMap = {
      "Ready for Pickup": "Picked Up",
      "Picked Up": "Out for Delivery",
      "Out for Delivery": "Delivered",
    };

    const nextStatus =
      nextStatusMap[activeOrder.deliveryStatus];

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
        localStorage.getItem("deliveryHistory") || "[]"
      );

      const updatedHistory = [
        updatedOrder,
        ...existingHistory.filter(
          (item) => item.id !== updatedOrder.id
        ),
      ];

      localStorage.setItem(
        "deliveryHistory",
        JSON.stringify(updatedHistory)
      );

      localStorage.removeItem("activeDeliveryOrder");

      navigate("/delivery/history");
      return;
    }

    navigate("/delivery/tracking", {
      replace: true,
      state: {
        order: updatedOrder,
      },
    });
  };

  const nextAction =
    activeOrder.deliveryStatus === "Ready for Pickup"
      ? "Confirm Pickup"
      : activeOrder.deliveryStatus === "Picked Up"
        ? "Start Delivery"
        : "Mark Delivered";

  return (
    <div className="delivery-tracking-page">
      <header className="delivery-tracking-topbar">
        <button
          className="delivery-tracking-back"
          onClick={() => navigate("/delivery/dashboard")}
        >
          <ArrowLeft size={19} />
          Dashboard
        </button>

        <div className="delivery-tracking-brand">
          <div className="delivery-tracking-brand-icon">
            <Truck size={21} />
          </div>

          <div>
            <strong>Shop All Goods</strong>
            <span>Live Tracking</span>
          </div>
        </div>

        <div className="delivery-tracking-live">
          <span></span>
          Live
        </div>
      </header>

      <main className="delivery-tracking-main">
        <section className="delivery-tracking-heading">
          <div>
            <span className="delivery-tracking-label">
              ACTIVE DELIVERY
            </span>

            <h1>Track Delivery</h1>

            <p>{getStatusMessage()}</p>
          </div>

          <div className="delivery-tracking-order-id">
            <Package size={18} />
            {activeOrder.id}
          </div>
        </section>

        <section className="delivery-tracking-layout">
          <div className="delivery-map-card">
            <div className="delivery-map-header">
              <div>
                <strong>Live Delivery Map</strong>
                <span>Driver location updates automatically</span>
              </div>

              <div className="delivery-map-status">
                <span></span>
                Live location
              </div>
            </div>

            <div className="delivery-map">
              <div className="map-grid"></div>

              <div className="map-road map-road-one"></div>
              <div className="map-road map-road-two"></div>
              <div className="map-road map-road-three"></div>
              <div className="map-road map-road-four"></div>

              <div className="map-area map-area-one">
                Madhapur
              </div>

              <div className="map-area map-area-two">
                Kondapur
              </div>

              <div className="map-area map-area-three">
                Hitech City
              </div>

              <div
                className="map-route"
                style={{
                  left: "23%",
                  top: "68%",
                  width: "58%",
                  transform: "rotate(-18deg)",
                }}
              ></div>

              <div
                className="map-route map-route-secondary"
                style={{
                  left: "48%",
                  top: "45%",
                  width: "28%",
                  transform: "rotate(34deg)",
                }}
              ></div>

              <div
                className="map-marker pickup-marker"
                style={{
                  left: "22%",
                  top: "70%",
                }}
              >
                <div className="map-marker-icon">
                  <Package size={17} />
                </div>

                <span>Pickup</span>
              </div>

              <div
                className="map-marker driver-marker"
                style={{
                  left: "51%",
                  top: "50%",
                }}
              >
                <div className="driver-marker-pulse"></div>

                <div className="map-driver-icon">
                  <Navigation size={20} />
                </div>

                <span>You</span>
              </div>

              <div
                className="map-marker customer-marker"
                style={{
                  left: "79%",
                  top: "28%",
                }}
              >
                <div className="map-marker-icon">
                  <MapPin size={18} />
                </div>

                <span>Customer</span>
              </div>

              <div className="delivery-map-distance">
                <strong>3.8 km</strong>
                <span>estimated remaining distance</span>
              </div>

              <div className="delivery-map-coordinates">
                {deliveryLat.toFixed(4)}, {deliveryLng.toFixed(4)}
              </div>
            </div>
          </div>

          <aside className="delivery-tracking-sidebar">
            <section className="delivery-tracking-card">
              <div className="delivery-tracking-card-title">
                <div>
                  <span className="delivery-tracking-label">
                    DELIVERY STATUS
                  </span>
                  <h2>{activeOrder.deliveryStatus}</h2>
                </div>

                <Clock3 size={20} />
              </div>

              <div className="delivery-tracking-steps">
                {statusSteps.map((step, index) => (
                  <div
                    className={`delivery-tracking-step ${
                      index <= currentStep ? "active" : ""
                    }`}
                    key={step}
                  >
                    <div className="delivery-tracking-step-line">
                      <div className="delivery-tracking-step-dot">
                        {index <= currentStep ? (
                          <CheckCircle2 size={17} />
                        ) : (
                          <span>{index + 1}</span>
                        )}
                      </div>

                      {index !== statusSteps.length - 1 && (
                        <div className="delivery-tracking-step-connector"></div>
                      )}
                    </div>

                    <div>
                      <strong>{step}</strong>

                      <span>
                        {index < currentStep
                          ? "Completed"
                          : index === currentStep
                            ? "Current status"
                            : "Upcoming"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                className="delivery-tracking-status-button"
                onClick={handleStatusUpdate}
              >
                {nextAction}
              </button>
            </section>

            <section className="delivery-tracking-card">
              <div className="delivery-tracking-card-title">
                <div>
                  <span className="delivery-tracking-label">
                    CUSTOMER
                  </span>
                  <h2>{activeOrder.customer}</h2>
                </div>

                <div className="delivery-customer-avatar">
                  <User size={19} />
                </div>
              </div>

              <div className="delivery-customer-details">
                <div>
                  <MapPin size={18} />
                  <span>{activeOrder.address}</span>
                </div>

                <div>
                  <Phone size={18} />
                  <span>{activeOrder.phone}</span>
                </div>
              </div>

              <button
                className="delivery-call-button"
                onClick={callCustomer}
              >
                <Phone size={17} />
                Call Customer
              </button>
            </section>

            <section className="delivery-tracking-card delivery-order-summary">
              <div className="delivery-tracking-card-title">
                <div>
                  <span className="delivery-tracking-label">
                    ORDER SUMMARY
                  </span>
                  <h2>{activeOrder.product}</h2>
                </div>

                <Package size={20} />
              </div>

              <div className="delivery-summary-row">
                <span>Quantity</span>
                <strong>{activeOrder.quantity}</strong>
              </div>

              <div className="delivery-summary-row">
                <span>Supplier</span>
                <strong>{activeOrder.supplier}</strong>
              </div>

              <div className="delivery-summary-row">
                <span>Payment</span>
                <strong className="delivery-paid">Paid</strong>
              </div>

              <div className="delivery-summary-row total">
                <span>Total</span>
                <strong>₹{activeOrder.amount}</strong>
              </div>
            </section>
          </aside>
        </section>

        <section className="delivery-location-info">
          <div>
            <MapPin size={19} />
            <div>
              <strong>Customer Location</strong>
              <span>
                {customerLat.toFixed(4)}, {customerLng.toFixed(4)}
              </span>
            </div>
          </div>

          <div>
            <Navigation size={19} />
            <div>
              <strong>Current Location</strong>
              <span>
                {deliveryLat.toFixed(4)}, {deliveryLng.toFixed(4)}
              </span>
            </div>
          </div>

          <div>
            <Truck size={19} />
            <div>
              <strong>Pickup Location</strong>
              <span>
                {pickupLat.toFixed(4)}, {pickupLng.toFixed(4)}
              </span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default DeliveryTracking;