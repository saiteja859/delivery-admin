import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ShoppingCart,
  IndianRupee,
  Users,
  Truck,
  ArrowUpRight,
  Package,
  Clock3,
  UserPlus,
  Plus,
  RefreshCw,
} from "lucide-react";

import "./Dashboard.css";


function Dashboard() {

  const navigate = useNavigate();


  // ============================================
  // DASHBOARD STATE
  // ============================================

  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    pendingDeliveries: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState("");


  // ============================================
  // FETCH DASHBOARD DATA
  // ============================================

  const fetchDashboardData = async () => {

    try {

      setIsLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/dashboard"
      );

      const data = await response.json();


      if (!response.ok || !data.success) {

        throw new Error(
          data.message ||
          "Failed to load dashboard data"
        );

      }


      setStats({
        totalOrders:
          Number(data.stats?.totalOrders) || 0,

        totalRevenue:
          Number(data.stats?.totalRevenue) || 0,

        totalCustomers:
          Number(data.stats?.totalCustomers) || 0,

        pendingDeliveries:
          Number(data.stats?.pendingDeliveries) || 0,
      });


      setRecentOrders(
        Array.isArray(data.recentOrders)
          ? data.recentOrders
          : []
      );

    } catch (error) {

      console.error(
        "Dashboard request failed:",
        error
      );

      setError(
        "Unable to load dashboard data. Please make sure the admin backend is running."
      );

    } finally {

      setIsLoading(false);

    }
  };


  // ============================================
  // LOAD DASHBOARD
  // ============================================

  useEffect(() => {

    fetchDashboardData();

  }, []);


  // ============================================
  // FORMAT CURRENCY
  // ============================================

  const formatCurrency = (amount) => {

    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }
    ).format(amount);

  };


  // ============================================
  // FORMAT ORDER STATUS
  // ============================================

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
  // STATUS CLASS
  // ============================================

  const getStatusClass = (status) => {

    if (!status) {
      return "unknown";
    }

    return status
      .toLowerCase()
      .replace(/_/g, "-");

  };


  // ============================================
  // DASHBOARD STATS
  // ============================================

  const statCards = [
    {
      title: "Total Orders",

      value: stats.totalOrders.toLocaleString(
        "en-IN"
      ),

      change: "Live",

      description: "from database",

      icon: ShoppingCart,

      type: "blue",
    },

    {
      title: "Total Revenue",

      value: formatCurrency(
        stats.totalRevenue
      ),

      change: "Live",

      description: "from orders",

      icon: IndianRupee,

      type: "purple",
    },

    {
      title: "Customers",

      value: stats.totalCustomers.toLocaleString(
        "en-IN"
      ),

      change: "Live",

      description: "registered customers",

      icon: Users,

      type: "mint",
    },

    {
      title: "Pending Delivery",

      value: stats.pendingDeliveries.toLocaleString(
        "en-IN"
      ),

      change: "Live",

      description: "need attention",

      icon: Truck,

      type: "orange",
    },
  ];


  // ============================================
  // RENDER
  // ============================================

  return (

    <div className="dashboard-page">


      {/* ========================================
          HERO
      ======================================== */}

      <section className="dashboard-hero">

        <div className="dashboard-hero-content">

          <p className="dashboard-eyebrow">
            ADMIN DASHBOARD
          </p>

          <h2>
            Good morning,
            <span> Admin.</span>
          </h2>

          <p>
            Here's what's happening with your
            store today. Keep everything moving
            smoothly.
          </p>

        </div>


        <div className="dashboard-orbit">

          <div className="orbit-circle orbit-one"></div>

          <div className="orbit-circle orbit-two"></div>

          <div className="orbit-center">
            SAG
          </div>

          <div className="orbit-dot"></div>

        </div>

      </section>


      {/* ========================================
          ERROR MESSAGE
      ======================================== */}

      {error && (

        <div className="dashboard-error">

          <div>
            <strong>
              Dashboard data unavailable
            </strong>

            <p>
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={fetchDashboardData}
          >
            <RefreshCw size={16} />
            Retry
          </button>

        </div>

      )}


      {/* ========================================
          STAT CARDS
      ======================================== */}

      <section className="dashboard-stats">

        {statCards.map((stat) => {

          const Icon = stat.icon;

          return (

            <div
              className={`stat-card stat-${stat.type}`}
              key={stat.title}
            >

              <div className="stat-top">

                <div className="stat-icon">

                  <Icon size={21} />

                </div>

                <ArrowUpRight
                  className="stat-arrow"
                  size={18}
                />

              </div>


              <div className="stat-info">

                <span>
                  {stat.title}
                </span>


                <h3>

                  {isLoading
                    ? "—"
                    : stat.value}

                </h3>


                <p>

                  <strong>
                    {isLoading
                      ? "Loading"
                      : stat.change}
                  </strong>{" "}

                  {stat.description}

                </p>

              </div>

            </div>

          );

        })}

      </section>


      {/* ========================================
          MAIN GRID
      ======================================== */}

      <section className="dashboard-main-grid">


        {/* ======================================
            RECENT ORDERS
        ====================================== */}

        <div className="dashboard-card recent-orders-card">

          <div className="card-heading">

            <div>

              <p className="card-label">
                ACTIVITY
              </p>

              <h3>
                Recent Orders
              </h3>

            </div>


            <button
              type="button"
              className="view-all-button"
              onClick={() =>
                navigate("/admin/orders")
              }
            >

              View all

              <ArrowUpRight size={16} />

            </button>

          </div>


          <div className="orders-table-wrapper">

            <table className="orders-table">

              <thead>

                <tr>

                  <th>
                    Order
                  </th>

                  <th>
                    Customer
                  </th>

                  <th>
                    Product
                  </th>

                  <th>
                    Amount
                  </th>

                  <th>
                    Status
                  </th>

                </tr>

              </thead>


              <tbody>


                {/* LOADING */}

                {isLoading && (

                  <tr>

                    <td
                      colSpan="5"
                      className="dashboard-empty-state"
                    >
                      Loading recent orders...
                    </td>

                  </tr>

                )}


                {/* NO ORDERS */}

                {!isLoading &&
                  !error &&
                  recentOrders.length === 0 && (

                    <tr>

                      <td
                        colSpan="5"
                        className="dashboard-empty-state"
                      >

                        No orders found yet.

                      </td>

                    </tr>

                  )}


                {/* ORDERS */}

                {!isLoading &&
                  recentOrders.map((order) => (

                    <tr
                      key={order.id}
                      onClick={() =>
                        navigate(
                          `/admin/orders/${order.id}`
                        )
                      }
                      className="dashboard-order-row"
                    >

                      <td>

                        <strong className="order-id">

                          {order.orderNumber ||
                            `#${order.id}`}

                        </strong>

                      </td>


                      <td>

                        <span className="customer-name">

                          {order.customer ||
                            "Unknown customer"}

                        </span>

                      </td>


                      <td>

                        <span className="product-name">

                          {order.product ||
                            "Multiple products"}

                        </span>

                      </td>


                      <td>

                        <strong>

                          {formatCurrency(
                            order.amount
                          )}

                        </strong>

                      </td>


                      <td>

                        <span
                          className={`order-status status-${getStatusClass(
                            order.status
                          )}`}
                        >

                          <span></span>

                          {formatStatus(
                            order.status
                          )}

                        </span>

                      </td>

                    </tr>

                  ))}

              </tbody>

            </table>

          </div>

        </div>


        {/* ======================================
            QUICK ACTIONS
        ====================================== */}

        <div className="dashboard-card quick-actions-card">

          <div className="card-heading">

            <div>

              <p className="card-label">
                SHORTCUTS
              </p>

              <h3>
                Quick Actions
              </h3>

            </div>

          </div>


          <div className="quick-actions">


            {/* MANAGE PRODUCTS */}

            <button
              type="button"
              className="quick-action"
              onClick={() =>
                navigate("/admin/products")
              }
            >

              <div className="quick-icon gradient-icon">

                <Package size={20} />

              </div>


              <div>

                <strong>
                  Manage Products
                </strong>

                <span>
                  Add or update products
                </span>

              </div>


              <ArrowUpRight size={17} />

            </button>


            {/* DELIVERY ORDERS */}

            <button
              type="button"
              className="quick-action"
              onClick={() =>
                navigate("/admin/delivery-boys")
              }
            >

              <div className="quick-icon">

                <Truck size={20} />

              </div>


              <div>

                <strong>
                  Delivery Orders
                </strong>

                <span>
                  View pending deliveries
                </span>

              </div>


              <ArrowUpRight size={17} />

            </button>


            {/* CUSTOMERS */}

            <button
              type="button"
              className="quick-action"
              onClick={() =>
                navigate("/admin/customers")
              }
            >

              <div className="quick-icon">

                <UserPlus size={20} />

              </div>


              <div>

                <strong>
                  Customers
                </strong>

                <span>
                  Manage customer accounts
                </span>

              </div>


              <ArrowUpRight size={17} />

            </button>


            {/* REVIEWS */}

            <button
              type="button"
              className="quick-action"
              onClick={() =>
                navigate("/admin/reviews")
              }
            >

              <div className="quick-icon">

                <Clock3 size={20} />

              </div>


              <div>

                <strong>
                  Pending Reviews
                </strong>

                <span>
                  Check customer feedback
                </span>

              </div>


              <ArrowUpRight size={17} />

            </button>

          </div>


          {/* CREATE PRODUCT */}

          <button
            type="button"
            className="dashboard-add-button"
            onClick={() =>
              navigate("/admin/products")
            }
          >

            <Plus size={18} />

            Create New Product

          </button>

        </div>

      </section>

    </div>

  );
}


export default Dashboard;