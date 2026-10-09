import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Search,
  SlidersHorizontal,
  Eye,
  ChevronDown,
  Package,
  Truck,
  CheckCircle2,
  Clock3,
  XCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import "./Orders.css";


function Orders() {

  const navigate = useNavigate();


  // ============================================
  // STATE
  // ============================================

  const [orders, setOrders] = useState([]);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  // ============================================
  // LOAD ORDERS
  // ============================================

  const fetchOrders = async () => {

    try {

      setLoading(true);

      setError("");

      const response = await fetch(
        "http://localhost:5000/api/orders"
      );

      const data = await response.json();


      if (!response.ok || !data.success) {

        throw new Error(
          data.message ||
          "Failed to load orders"
        );
      }


      setOrders(data.orders || []);

    } catch (error) {

      console.error(
        "Orders loading error:",
        error
      );

      setError(
        error.message ||
        "Unable to load orders"
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {

    fetchOrders();

  }, []);


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
  // FILTER OPTIONS
  // ============================================

  const statusOptions = [
    "All",
    "PLACED",
    "CONFIRMED",
    "READY_FOR_PICKUP",
    "PICKED_UP",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELLED",
  ];


  // ============================================
  // FILTER ORDERS
  // ============================================

  const filteredOrders = useMemo(() => {

    return orders.filter((order) => {

      const searchText =
        search.toLowerCase().trim();


      const matchesSearch =
        order.orderNumber
          ?.toLowerCase()
          .includes(searchText) ||

        order.customer
          ?.toLowerCase()
          .includes(searchText) ||

        order.customerEmail
          ?.toLowerCase()
          .includes(searchText) ||

        order.shippingAddress
          ?.toLowerCase()
          .includes(searchText);


      const matchesStatus =
        statusFilter === "All" ||
        order.orderStatus === statusFilter;


      return (
        matchesSearch &&
        matchesStatus
      );

    });

  }, [
    orders,
    search,
    statusFilter,
  ]);


  // ============================================
  // ORDER SUMMARY
  // ============================================

  const orderStats = useMemo(() => {

    const delivered = orders.filter(
      (order) =>
        order.orderStatus === "DELIVERED"
    ).length;


    const inTransit = orders.filter(
      (order) =>
        [
          "PICKED_UP",
          "OUT_FOR_DELIVERY",
        ].includes(order.orderStatus)
    ).length;


    const pending = orders.filter(
      (order) =>
        [
          "PLACED",
          "CONFIRMED",
          "READY_FOR_PICKUP",
        ].includes(order.orderStatus)
    ).length;


    return {
      total: orders.length,
      delivered,
      inTransit,
      pending,
    };

  }, [orders]);


  // ============================================
  // PAYMENT BADGE
  // ============================================

  const renderPaymentBadge = (
    paymentStatus
  ) => {

    const status =
      paymentStatus || "PENDING";


    const isPaid =
      status === "PAID";


    const isFailed =
      status === "FAILED";


    return (
      <span
        className={`payment-badge payment-${status.toLowerCase()}`}
      >

        {isPaid && (
          <CheckCircle2 size={13} />
        )}

        {isFailed && (
          <XCircle size={13} />
        )}

        {!isPaid && !isFailed && (
          <Clock3 size={13} />
        )}

        {formatStatus(status)}

      </span>
    );

  };


  // ============================================
  // DELIVERY BADGE
  // ============================================

  const renderDeliveryBadge = (
    orderStatus
  ) => {

    const status =
      orderStatus || "PLACED";


    let icon = (
      <Clock3 size={13} />
    );


    if (status === "DELIVERED") {

      icon = (
        <CheckCircle2 size={13} />
      );

    } else if (
      [
        "PICKED_UP",
        "OUT_FOR_DELIVERY",
      ].includes(status)
    ) {

      icon = (
        <Truck size={13} />
      );

    } else if (
      status === "CANCELLED"
    ) {

      icon = (
        <XCircle size={13} />
      );

    }


    return (
      <span
        className={`delivery-badge delivery-${status.toLowerCase()}`}
      >

        {icon}

        {formatStatus(status)}

      </span>
    );

  };


  // ============================================
  // LOADING STATE
  // ============================================

  if (loading) {

    return (
      <div className="orders-page">

        <div className="orders-page-header">

          <div>
            <p className="orders-eyebrow">
              STORE OPERATIONS
            </p>

            <h2>Orders</h2>

            <p>
              Track purchases, payments,
              suppliers and deliveries
              from one place.
            </p>
          </div>

        </div>


        <div className="orders-content-card">

          <div className="orders-loading">

            <RefreshCw
              size={28}
              className="orders-loading-icon"
            />

            <strong>
              Loading orders...
            </strong>

            <span>
              Fetching the latest orders
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

  if (error) {

    return (
      <div className="orders-page">

        <div className="orders-page-header">

          <div>
            <p className="orders-eyebrow">
              STORE OPERATIONS
            </p>

            <h2>Orders</h2>

            <p>
              Track purchases, payments,
              suppliers and deliveries
              from one place.
            </p>
          </div>

        </div>


        <div className="orders-content-card">

          <div className="orders-error">

            <AlertCircle size={32} />

            <strong>
              Unable to load orders
            </strong>

            <span>
              {error}
            </span>

            <button
              type="button"
              onClick={fetchOrders}
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
  // MAIN PAGE
  // ============================================

  return (
    <div className="orders-page">


      {/* PAGE HEADER */}

      <div className="orders-page-header">

        <div>

          <p className="orders-eyebrow">
            STORE OPERATIONS
          </p>

          <h2>Orders</h2>

          <p>
            Track purchases, payments,
            suppliers and deliveries
            from one place.
          </p>

        </div>


        <div className="orders-summary-pill">

          <Package size={17} />

          <span>
            {orders.length} Total Orders
          </span>

        </div>

      </div>


      {/* ORDER SUMMARY */}

      <div className="order-mini-stats">


        <div className="order-mini-card">

          <div className="mini-icon blue">
            <Package size={18} />
          </div>

          <div>

            <span>
              Total Orders
            </span>

            <strong>
              {orderStats.total}
            </strong>

          </div>

        </div>


        <div className="order-mini-card">

          <div className="mini-icon green">
            <CheckCircle2 size={18} />
          </div>

          <div>

            <span>
              Delivered
            </span>

            <strong>
              {orderStats.delivered}
            </strong>

          </div>

        </div>


        <div className="order-mini-card">

          <div className="mini-icon purple">
            <Truck size={18} />
          </div>

          <div>

            <span>
              In Transit
            </span>

            <strong>
              {orderStats.inTransit}
            </strong>

          </div>

        </div>


        <div className="order-mini-card">

          <div className="mini-icon orange">
            <Clock3 size={18} />
          </div>

          <div>

            <span>
              Pending
            </span>

            <strong>
              {orderStats.pending}
            </strong>

          </div>

        </div>

      </div>


      {/* ORDERS CARD */}

      <div className="orders-content-card">


        {/* TOOLBAR */}

        <div className="orders-toolbar">


          <div className="orders-search">

            <Search size={18} />

            <input
              type="text"
              placeholder="Search order, customer..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

          </div>


          <div className="orders-filters">

            <div className="status-filter">

              <SlidersHorizontal size={16} />

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
              >

                {statusOptions.map(
                  (status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {status === "All"
                        ? "All Status"
                        : formatStatus(status)}
                    </option>
                  )
                )}

              </select>

              <ChevronDown size={15} />

            </div>

          </div>

        </div>


        {/* TABLE */}

        <div className="orders-table-container">

          <table className="admin-orders-table">

            <thead>

              <tr>

                <th>Order</th>

                <th>Customer</th>

                <th>Product</th>

                <th>Supplier</th>

                <th>Amount</th>

                <th>Payment</th>

                <th>Delivery</th>

                <th>Date</th>

                <th></th>

              </tr>

            </thead>


            <tbody>


              {filteredOrders.map(
                (order) => (

                  <tr key={order.id}>


                    {/* ORDER */}

                    <td>

                      <button
                        className="order-number"
                        onClick={() =>
                          navigate(
                            `/admin/orders/${order.id}`
                          )
                        }
                      >
                        #{order.orderNumber}
                      </button>

                    </td>


                    {/* CUSTOMER */}

                    <td>

                      <div className="customer-cell">

                        <div className="customer-avatar">

                          {order.customer
                            ?.charAt(0)
                            .toUpperCase() || "C"}

                        </div>

                        <div>

                          <strong>
                            {order.customer ||
                              "Unknown Customer"}
                          </strong>

                          <span>
                            {order.customerEmail ||
                              "No email"}
                          </span>

                        </div>

                      </div>

                    </td>


                    {/* PRODUCT */}

                    <td>

                      <div className="product-cell">

                        <div className="product-placeholder">

                          <Package size={17} />

                        </div>

                        <div>

                          <strong>
                            Order #{order.orderNumber}
                          </strong>

                          <span>
                            View order details
                          </span>

                        </div>

                      </div>

                    </td>


                    {/* SUPPLIER */}

                    <td>

                      <span className="supplier-name">

                        {order.supplierId
                          ? `Supplier #${order.supplierId}`
                          : "Not assigned"}

                      </span>

                    </td>


                    {/* AMOUNT */}

                    <td>

                      <strong className="order-amount">

                        {formatAmount(
                          order.totalAmount
                        )}

                      </strong>

                    </td>


                    {/* PAYMENT */}

                    <td>

                      {renderPaymentBadge(
                        order.paymentStatus
                      )}

                    </td>


                    {/* DELIVERY */}

                    <td>

                      {renderDeliveryBadge(
                        order.orderStatus
                      )}

                    </td>


                    {/* DATE */}

                    <td>

                      <span className="order-date">

                        {formatDate(
                          order.createdAt
                        )}

                      </span>

                    </td>


                    {/* VIEW */}

                    <td>

                      <button
                        className="view-order-button"
                        onClick={() =>
                          navigate(
                            `/admin/orders/${order.id}`
                          )
                        }
                        title="View order"
                      >

                        <Eye size={17} />

                      </button>

                    </td>

                  </tr>

                )
              )}


              {/* EMPTY */}

              {filteredOrders.length === 0 && (

                <tr>

                  <td
                    colSpan="9"
                    className="no-orders"
                  >

                    <Package size={28} />

                    <strong>
                      No orders found
                    </strong>

                    <span>
                      Try changing your search
                      or filter.
                    </span>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>


        {/* FOOTER */}

        <div className="orders-table-footer">

          <span>

            Showing{" "}

            <strong>
              {filteredOrders.length}
            </strong>{" "}

            of{" "}

            <strong>
              {orders.length}
            </strong>{" "}

            orders

          </span>


          <div className="pagination">

            <button disabled>
              ←
            </button>

            <button className="active-page">
              1
            </button>

            <button disabled>
              2
            </button>

            <button disabled>
              3
            </button>

            <button disabled>
              →
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}


export default Orders;