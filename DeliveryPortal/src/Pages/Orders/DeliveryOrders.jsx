import { useMemo, useState } from "react";
import {
  Search,
  Package,
  MapPin,
  Phone,
  Clock3,
  CheckCircle2,
  Truck,
  Navigation,
  ChevronRight,
  Filter,
  IndianRupee,
  User,
  Store,
  ArrowUpRight,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import "./DeliveryOrders.css";

const assignedOrders = [
  {
    id: "SAG-10283",
    customer: "Priya Reddy",
    phone: "+91 99887 12345",
    address: "Madhapur, Hyderabad, Telangana",
    product: "Smart Watch Pro",
    quantity: 1,
    supplier: "Digital Hub",
    amount: 4299,
    payment: "Paid",
    status: "Ready for Pickup",
    acceptedAt: "01 Oct 2026, 1:42 PM",
  },
  {
    id: "SAG-10281",
    customer: "Sneha Patel",
    phone: "+91 97654 32100",
    address: "Andheri West, Mumbai, Maharashtra",
    product: "Bluetooth Speaker",
    quantity: 1,
    supplier: "SoundMax Distributors",
    amount: 1299,
    payment: "Paid",
    status: "Picked Up",
    acceptedAt: "30 Sep 2026, 4:18 PM",
  },
  {
    id: "SAG-10278",
    customer: "Meera Nair",
    phone: "+91 98760 12345",
    address: "Kakkanad, Kochi, Kerala",
    product: "Ceramic Coffee Mug",
    quantity: 3,
    supplier: "HomeNest Traders",
    amount: 897,
    payment: "Paid",
    status: "Out for Delivery",
    acceptedAt: "28 Sep 2026, 11:26 AM",
  },
  {
    id: "SAG-10274",
    customer: "Karan Mehta",
    phone: "+91 92345 67890",
    address: "Vastrapur, Ahmedabad, Gujarat",
    product: "Mechanical Keyboard",
    quantity: 1,
    supplier: "TechWorld Supplies",
    amount: 3199,
    payment: "Paid",
    status: "Delivered",
    acceptedAt: "27 Sep 2026, 9:15 AM",
  },
  {
    id: "SAG-10271",
    customer: "Arjun Kumar",
    phone: "+91 91234 56780",
    address: "Velachery, Chennai, Tamil Nadu",
    product: "Running Shoes",
    quantity: 2,
    supplier: "Urban Footwear",
    amount: 3798,
    payment: "Paid",
    status: "Delivered",
    acceptedAt: "26 Sep 2026, 3:40 PM",
  },
];

function DeliveryOrders() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredOrders = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return assignedOrders.filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(searchValue) ||
        order.customer.toLowerCase().includes(searchValue) ||
        order.product.toLowerCase().includes(searchValue) ||
        order.supplier.toLowerCase().includes(searchValue) ||
        order.address.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "All" ||
        order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const readyOrders = assignedOrders.filter(
    (order) => order.status === "Ready for Pickup"
  ).length;

  const pickedUpOrders = assignedOrders.filter(
    (order) => order.status === "Picked Up"
  ).length;

  const outForDeliveryOrders = assignedOrders.filter(
    (order) => order.status === "Out for Delivery"
  ).length;

  const completedOrders = assignedOrders.filter(
    (order) => order.status === "Delivered"
  ).length;

  const getStatusClass = (status) => {
    if (status === "Ready for Pickup") {
      return "ready";
    }

    if (status === "Picked Up") {
      return "picked";
    }

    if (status === "Out for Delivery") {
      return "out";
    }

    return "delivered";
  };

  const getStatusIcon = (status) => {
    if (status === "Delivered") {
      return <CheckCircle2 size={15} />;
    }

    if (status === "Out for Delivery") {
      return <Truck size={15} />;
    }

    if (status === "Picked Up") {
      return <Navigation size={15} />;
    }

    return <Package size={15} />;
  };

  const openOrder = (order) => {
    const formattedOrder = {
      id: order.id,
      customer: order.customer,
      phone: order.phone,
      address: order.address,
      product: order.product,
      quantity: order.quantity,
      supplier: order.supplier,
      amount: order.amount,
      payment: order.payment,
      acceptedAt: order.acceptedAt,
      supplierStatus: "Accepted",
      deliveryStatus: order.status,
    };

    localStorage.setItem(
      "activeDeliveryOrder",
      JSON.stringify(formattedOrder)
    );

    navigate("/delivery/dashboard", {
      state: {
        order: formattedOrder,
      },
    });
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All");
  };

  return (
    <div className="delivery-orders-page">
      <header className="delivery-orders-header">
        <div className="delivery-orders-breadcrumb">
          Delivery Portal
          <ChevronRight size={14} />
          Assigned Orders
        </div>

        <div className="delivery-orders-heading">
          <div>
            <span className="delivery-orders-eyebrow">
              DELIVERY OPERATIONS
            </span>

            <h1>Assigned Orders</h1>

            <p>
              Manage your assigned deliveries and keep track of
              every order.
            </p>
          </div>

          <div className="delivery-orders-total-card">
            <div className="delivery-orders-total-icon">
              <Package size={21} />
            </div>

            <div>
              <strong>{assignedOrders.length}</strong>
              <span>Total Orders</span>
            </div>
          </div>
        </div>
      </header>

      <section className="delivery-order-summary">
        <article className="order-summary-item assigned">
          <div className="summary-icon">
            <Package size={20} />
          </div>

          <div className="summary-content">
            <span>Assigned</span>
            <strong>{assignedOrders.length}</strong>
            <small>All orders</small>
          </div>

          <ArrowUpRight className="summary-arrow" size={18} />
        </article>

        <article className="order-summary-item ready">
          <div className="summary-icon">
            <Navigation size={20} />
          </div>

          <div className="summary-content">
            <span>Ready for Pickup</span>
            <strong>{readyOrders}</strong>
            <small>Waiting for pickup</small>
          </div>

          <ArrowUpRight className="summary-arrow" size={18} />
        </article>

        <article className="order-summary-item progress">
          <div className="summary-icon">
            <Truck size={20} />
          </div>

          <div className="summary-content">
            <span>In Delivery</span>
            <strong>
              {pickedUpOrders + outForDeliveryOrders}
            </strong>
            <small>Currently active</small>
          </div>

          <ArrowUpRight className="summary-arrow" size={18} />
        </article>

        <article className="order-summary-item completed">
          <div className="summary-icon">
            <CheckCircle2 size={20} />
          </div>

          <div className="summary-content">
            <span>Completed</span>
            <strong>{completedOrders}</strong>
            <small>Successfully delivered</small>
          </div>

          <ArrowUpRight className="summary-arrow" size={18} />
        </article>
      </section>

      <section className="delivery-orders-panel">
        <div className="delivery-orders-panel-header">
          <div>
            <span className="delivery-orders-panel-label">
              YOUR ORDERS
            </span>

            <h2>
              {filteredOrders.length}{" "}
              {filteredOrders.length === 1
                ? "Order"
                : "Orders"}
            </h2>
          </div>

          <div className="delivery-orders-result">
            Showing {filteredOrders.length} of{" "}
            {assignedOrders.length}
          </div>
        </div>

        <div className="delivery-orders-toolbar">
          <div className="delivery-orders-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search by order, customer, product or supplier..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

            {search && (
              <button
                className="delivery-orders-search-clear"
                onClick={() => setSearch("")}
              >
                ×
              </button>
            )}
          </div>

          <div className="delivery-orders-filter">
            <Filter size={17} />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="All">All Status</option>

              <option value="Ready for Pickup">
                Ready for Pickup
              </option>

              <option value="Picked Up">
                Picked Up
              </option>

              <option value="Out for Delivery">
                Out for Delivery
              </option>

              <option value="Delivered">
                Delivered
              </option>
            </select>
          </div>
        </div>

        <div className="delivery-orders-list">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order, index) => (
              <article
                className="delivery-order-item"
                key={order.id}
                style={{
                  animationDelay: `${index * 70}ms`,
                }}
              >
                <div className="delivery-order-top">
                  <div className="delivery-order-id-section">
                    <div className="order-product-icon">
                      <Package size={22} />
                    </div>

                    <div>
                      <div className="delivery-order-id-row">
                        <strong>{order.id}</strong>

                        <span
                          className={`order-status ${getStatusClass(
                            order.status
                          )}`}
                        >
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                      </div>

                      <h2>{order.product}</h2>

                      <span className="delivery-order-quantity">
                        Quantity: {order.quantity}
                      </span>
                    </div>
                  </div>

                  <div className="delivery-order-price">
                    <span>ORDER VALUE</span>

                    <strong>
                      ₹{order.amount.toLocaleString("en-IN")}
                    </strong>

                    <small>
                      <CheckCircle2 size={13} />
                      {order.payment}
                    </small>
                  </div>
                </div>

                <div className="delivery-order-details">
                  <div className="delivery-order-detail customer">
                    <div className="delivery-detail-icon">
                      <User size={17} />
                    </div>

                    <div>
                      <span>CUSTOMER</span>
                      <strong>{order.customer}</strong>

                      <p>
                        <MapPin size={13} />
                        {order.address}
                      </p>
                    </div>
                  </div>

                  <div className="delivery-order-detail supplier">
                    <div className="delivery-detail-icon">
                      <Store size={17} />
                    </div>

                    <div>
                      <span>SUPPLIER</span>
                      <strong>{order.supplier}</strong>

                      <p>
                        <Phone size={13} />
                        {order.phone}
                      </p>
                    </div>
                  </div>

                  <div className="delivery-order-detail accepted">
                    <div className="delivery-detail-icon">
                      <Clock3 size={17} />
                    </div>

                    <div>
                      <span>ACCEPTED</span>
                      <strong>{order.acceptedAt}</strong>
                      <p>Order assigned to you</p>
                    </div>
                  </div>
                </div>

                <div className="delivery-order-bottom">
                  <div className="delivery-order-progress-mini">
                    <div
                      className={`mini-step ${
                        order.status === "Ready for Pickup" ||
                        order.status === "Picked Up" ||
                        order.status === "Out for Delivery" ||
                        order.status === "Delivered"
                          ? "active"
                          : ""
                      }`}
                    >
                      <span></span>
                      Pickup
                    </div>

                    <div
                      className={`mini-line ${
                        order.status === "Picked Up" ||
                        order.status === "Out for Delivery" ||
                        order.status === "Delivered"
                          ? "active"
                          : ""
                      }`}
                    ></div>

                    <div
                      className={`mini-step ${
                        order.status === "Picked Up" ||
                        order.status === "Out for Delivery" ||
                        order.status === "Delivered"
                          ? "active"
                          : ""
                      }`}
                    >
                      <span></span>
                      Picked Up
                    </div>

                    <div
                      className={`mini-line ${
                        order.status === "Out for Delivery" ||
                        order.status === "Delivered"
                          ? "active"
                          : ""
                      }`}
                    ></div>

                    <div
                      className={`mini-step ${
                        order.status === "Out for Delivery" ||
                        order.status === "Delivered"
                          ? "active"
                          : ""
                      }`}
                    >
                      <span></span>
                      Delivery
                    </div>

                    <div
                      className={`mini-line ${
                        order.status === "Delivered"
                          ? "active"
                          : ""
                      }`}
                    ></div>

                    <div
                      className={`mini-step ${
                        order.status === "Delivered"
                          ? "active"
                          : ""
                      }`}
                    >
                      <span></span>
                      Delivered
                    </div>
                  </div>

                  <button
                    className="order-view-button"
                    onClick={() => openOrder(order)}
                  >
                    View Order
                    <ChevronRight size={16} />
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="delivery-orders-empty">
              <div className="delivery-empty-icon">
                <Search size={27} />
              </div>

              <h2>No orders found</h2>

              <p>
                We couldn't find any orders matching your
                search or selected filter.
              </p>

              <button onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default DeliveryOrders;