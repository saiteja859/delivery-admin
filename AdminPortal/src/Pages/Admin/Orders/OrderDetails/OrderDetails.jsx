import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  Truck,
  CreditCard,
  CheckCircle2,
  Clock3,
  Building2,
  Phone,
  Mail,
  CalendarDays,
  IndianRupee,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import "./OrderDetails.css";


function OrderDetails() {

  const navigate = useNavigate();

  const { orderId } = useParams();


  // ============================================
  // STATE
  // ============================================

  const [order, setOrder] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  // ============================================
  // LOAD ORDER
  // ============================================

  const fetchOrder = async () => {

    try {

      setLoading(true);

      setError("");


      const response = await fetch(
        `http://localhost:5000/api/orders/${orderId}`
      );


      const data = await response.json();


      if (!response.ok || !data.success) {

        throw new Error(
          data.message ||
          "Failed to load order"
        );

      }


      setOrder(data.order);

    } catch (error) {

      console.error(
        "Order details loading error:",
        error
      );


      setError(
        error.message ||
        "Unable to load order"
      );

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    fetchOrder();

  }, [orderId]);


  // ============================================
  // FORMAT HELPERS
  // ============================================

  const formatAmount = (amount) => {

    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }
    ).format(amount || 0);

  };


  const formatDate = (date) => {

    if (!date) {
      return "—";
    }


    return new Intl.DateTimeFormat(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    ).format(new Date(date));

  };


  const formatDateTime = (date) => {

    if (!date) {
      return "Date unavailable";
    }


    return new Intl.DateTimeFormat(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    ).format(new Date(date));

  };


  const formatStatus = (status) => {

    if (!status) {
      return "Unknown";
    }


    return status
      .toLowerCase()
      .split("_")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(" ");

  };


  // ============================================
  // LOADING STATE
  // ============================================

  if (loading) {

    return (
      <div className="order-details-page">

        <div className="order-details-header">

          <button
            className="back-orders-button"
            onClick={() =>
              navigate("/admin/orders")
            }
          >
            <ArrowLeft size={17} />
            Back to Orders
          </button>

        </div>


        <div className="details-card">

          <div className="orders-loading">

            <RefreshCw
              size={28}
              className="orders-loading-icon"
            />

            <strong>
              Loading order details...
            </strong>

            <span>
              Fetching order information
              from the server.
            </span>

          </div>

        </div>

      </div>
    );

  }


  // ============================================
  // ERROR STATE
  // ============================================

  if (error || !order) {

    return (
      <div className="order-details-page">

        <div className="order-details-header">

          <button
            className="back-orders-button"
            onClick={() =>
              navigate("/admin/orders")
            }
          >
            <ArrowLeft size={17} />
            Back to Orders
          </button>

        </div>


        <div className="details-card">

          <div className="orders-error">

            <AlertCircle size={32} />

            <strong>
              Unable to load order
            </strong>

            <span>
              {error || "Order not found"}
            </span>

            <button
              type="button"
              onClick={fetchOrder}
            >
              <RefreshCw size={15} />
              Try Again
            </button>

          </div>

        </div>

      </div>
    );

  }


  // ============================================
  // CALCULATIONS
  // ============================================

  const subtotal =
    order.totalAmount || 0;

  const deliveryFee = 0;

  const total =
    subtotal + deliveryFee;


  const isDelivered =
    order.orderStatus === "DELIVERED";


  const isCancelled =
    order.orderStatus === "CANCELLED";


  const paymentSuccessful =
    order.paymentStatus === "PAID";


  return (
    <div className="order-details-page">


      {/* HEADER */}

      <div className="order-details-header">

        <button
          className="back-orders-button"
          onClick={() =>
            navigate("/admin/orders")
          }
        >
          <ArrowLeft size={17} />
          Back to Orders
        </button>


        <div className="order-details-heading">

          <div>

            <p className="details-eyebrow">
              ORDER DETAILS
            </p>

            <h2>
              #{order.orderNumber}
            </h2>

            <p>
              Placed on{" "}
              {formatDateTime(
                order.createdAt
              )}
            </p>

          </div>


          <span
            className={
              isCancelled
                ? "details-cancelled-badge"
                : isDelivered
                  ? "details-delivered-badge"
                  : "details-processing-badge"
            }
          >

            {isCancelled ? (
              <AlertCircle size={15} />
            ) : isDelivered ? (
              <CheckCircle2 size={15} />
            ) : (
              <Clock3 size={15} />
            )}

            {formatStatus(
              order.orderStatus
            )}

          </span>

        </div>

      </div>


      {/* TOP GRID */}

      <div className="order-details-grid">


        {/* PRODUCT */}

        <section className="details-card product-details-card">

          <div className="details-card-header">

            <div>

              <p className="details-card-label">
                PURCHASE
              </p>

              <h3>
                Product Information
              </h3>

            </div>

            <Package size={20} />

          </div>


          <div className="details-product">

            <div className="details-product-image">
              <Package size={34} />
            </div>


            <div className="details-product-info">

              <h4>
                Product information
              </h4>

              <p>
                Product details will be
                displayed here.
              </p>

              <span>
                Order #{order.orderNumber}
              </span>

            </div>

          </div>


          <div className="product-total-row">

            <span>
              Order Total
            </span>

            <strong>
              {formatAmount(
                order.totalAmount
              )}
            </strong>

          </div>

        </section>


        {/* CUSTOMER */}

        <section className="details-card">

          <div className="details-card-header">

            <div>

              <p className="details-card-label">
                CUSTOMER
              </p>

              <h3>
                Customer Information
              </h3>

            </div>

            <User size={20} />

          </div>


          <div className="customer-details-profile">

            <div className="large-customer-avatar">

              {order.customer
                ?.charAt(0)
                .toUpperCase() || "C"}

            </div>


            <div>

              <h4>
                {order.customer ||
                  "Unknown Customer"}
              </h4>

              <span>
                Customer
              </span>

            </div>

          </div>


          <div className="contact-details">

            <div>

              <Mail size={15} />

              <span>
                {order.customerEmail ||
                  "No email available"}
              </span>

            </div>


            <div>

              <Phone size={15} />

              <span>
                {order.customerPhone ||
                  "No phone available"}
              </span>

            </div>

          </div>

        </section>


        {/* SUPPLIER */}

        <section className="details-card">

          <div className="details-card-header">

            <div>

              <p className="details-card-label">
                SOURCE
              </p>

              <h3>
                Supplier Information
              </h3>

            </div>

            <Building2 size={20} />

          </div>


          <div className="supplier-details-profile">

            <div className="supplier-logo">
              {order.supplierId
                ? "SP"
                : "—"}
            </div>


            <div>

              <h4>
                {order.supplierId
                  ? `Supplier #${order.supplierId}`
                  : "Not assigned"}
              </h4>

              <span>
                {order.supplierId
                  ? "Assigned Supplier"
                  : "No supplier assigned"}
              </span>

            </div>

          </div>


          <div className="contact-details">

            <div>

              <Building2 size={15} />

              <span>
                {order.supplierId
                  ? `Supplier ID: ${order.supplierId}`
                  : "Supplier information unavailable"}
              </span>

            </div>

          </div>

        </section>


        {/* DELIVERY */}

        <section className="details-card">

          <div className="details-card-header">

            <div>

              <p className="details-card-label">
                DELIVERY
              </p>

              <h3>
                Delivery Address
              </h3>

            </div>

            <MapPin size={20} />

          </div>


          <div className="delivery-address">

            <div className="address-icon">

              <MapPin size={18} />

            </div>


            <p>
              {order.shippingAddress ||
                "No shipping address available"}
            </p>

          </div>

        </section>

      </div>


      {/* BOTTOM GRID */}

      <div className="order-bottom-grid">


        {/* TIMELINE */}

        <section className="details-card timeline-card">

          <div className="details-card-header">

            <div>

              <p className="details-card-label">
                ORDER JOURNEY
              </p>

              <h3>
                Delivery Timeline
              </h3>

            </div>

            <Truck size={20} />

          </div>


          <div className="delivery-timeline">


            <div className="timeline-item completed">

              <div className="timeline-icon">
                <CheckCircle2 size={16} />
              </div>

              <div>

                <strong>
                  Order Placed
                </strong>

                <span>
                  {formatDateTime(
                    order.createdAt
                  )}
                </span>

              </div>

            </div>


            <div className="timeline-line"></div>


            <div
              className={
                paymentSuccessful
                  ? "timeline-item completed"
                  : "timeline-item"
              }
            >

              <div className="timeline-icon">

                {paymentSuccessful ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <Clock3 size={16} />
                )}

              </div>

              <div>

                <strong>
                  Payment{" "}
                  {paymentSuccessful
                    ? "Confirmed"
                    : "Pending"}
                </strong>

                <span>
                  {formatStatus(
                    order.paymentStatus
                  )}
                </span>

              </div>

            </div>


            <div className="timeline-line"></div>


            <div
              className={
                [
                  "PICKED_UP",
                  "OUT_FOR_DELIVERY",
                  "DELIVERED",
                ].includes(
                  order.orderStatus
                )
                  ? "timeline-item completed"
                  : "timeline-item"
              }
            >

              <div className="timeline-icon">

                {[
                  "PICKED_UP",
                  "OUT_FOR_DELIVERY",
                  "DELIVERED",
                ].includes(
                  order.orderStatus
                ) ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <Clock3 size={16} />
                )}

              </div>

              <div>

                <strong>
                  Order Shipped
                </strong>

                <span>
                  {formatStatus(
                    order.orderStatus
                  )}
                </span>

              </div>

            </div>


            <div className="timeline-line"></div>


            <div
              className={
                isDelivered
                  ? "timeline-item completed"
                  : "timeline-item"
              }
            >

              <div className="timeline-icon">

                {isDelivered ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <Clock3 size={16} />
                )}

              </div>

              <div>

                <strong>
                  Delivered
                </strong>

                <span>
                  {isDelivered
                    ? formatDateTime(
                        order.updatedAt
                      )
                    : "Not delivered yet"}
                </span>

              </div>

            </div>

          </div>

        </section>


        {/* PAYMENT */}

        <section className="details-card payment-card">

          <div className="details-card-header">

            <div>

              <p className="details-card-label">
                PAYMENT
              </p>

              <h3>
                Payment Summary
              </h3>

            </div>

            <CreditCard size={20} />

          </div>


          <div className="payment-method">

            <div className="payment-method-icon">
              <IndianRupee size={18} />
            </div>


            <div>

              <strong>
                Payment
              </strong>

              <span>
                {formatStatus(
                  order.paymentStatus
                )}
              </span>

            </div>


            {paymentSuccessful && (
              <CheckCircle2
                className="payment-success"
                size={18}
              />
            )}

          </div>


          <div className="payment-breakdown">

            <div>

              <span>
                Subtotal
              </span>

              <strong>
                {formatAmount(subtotal)}
              </strong>

            </div>


            <div>

              <span>
                Delivery Fee
              </span>

              <strong>
                {deliveryFee === 0
                  ? "FREE"
                  : formatAmount(
                      deliveryFee
                    )}
              </strong>

            </div>


            <div className="payment-total">

              <span>
                Total Amount
              </span>

              <strong>
                {formatAmount(total)}
              </strong>

            </div>

          </div>

        </section>

      </div>


      {/* DELIVERY SUMMARY */}

      <section className="order-status-banner">

        <div className="status-banner-icon">
          <Truck size={21} />
        </div>


        <div>

          <strong>

            {isCancelled
              ? "Order cancelled"
              : isDelivered
                ? "Order successfully delivered"
                : `Order ${formatStatus(
                    order.orderStatus
                  )}`}

          </strong>


          <span>

            {isCancelled
              ? "This order has been cancelled."
              : isDelivered
                ? `This order was delivered to the customer on ${formatDateTime(
                    order.updatedAt
                  )}.`
                : `Current order status: ${formatStatus(
                    order.orderStatus
                  )}.`}

          </span>

        </div>


        <CalendarDays size={18} />

      </section>

    </div>
  );
}


export default OrderDetails;