import {
  History,
  Package,
  User,
  Store,
  IndianRupee,
  CheckCircle2,
  Search,
  Filter,
  ArrowRight,
  CalendarDays,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./DeliveryHistory.css";

const dummyHistoryOrders = [
  {
    id: "SAG-10274",
    customer: {
      name: "Karan Mehta",
      phone: "+91 92345 67890",
      address: "Vastrapur, Ahmedabad, Gujarat",
    },
    product: {
      name: "Mechanical Keyboard",
      sku: "SAG-MK-014",
      quantity: 1,
    },
    supplier: {
      name: "TechWorld Supplies",
      phone: "+91 98765 11223",
      address: "SG Highway, Ahmedabad, Gujarat",
    },
    amount: 3199,
    payment: "Paid",
    deliveryStatus: "Delivered",
    deliveredAt: "27 Sep 2026, 9:15 AM",
    acceptedAt: "27 Sep 2026, 7:42 AM",
  },
  {
    id: "SAG-10271",
    customer: {
      name: "Arjun Kumar",
      phone: "+91 91234 56780",
      address: "Velachery, Chennai, Tamil Nadu",
    },
    product: {
      name: "Running Shoes",
      sku: "SAG-RS-018",
      quantity: 2,
    },
    supplier: {
      name: "Urban Footwear",
      phone: "+91 98876 54321",
      address: "T Nagar, Chennai, Tamil Nadu",
    },
    amount: 3798,
    payment: "Paid",
    deliveryStatus: "Delivered",
    deliveredAt: "26 Sep 2026, 3:40 PM",
    acceptedAt: "26 Sep 2026, 1:10 PM",
  },
  {
    id: "SAG-10268",
    customer: {
      name: "Ananya Sharma",
      phone: "+91 98765 45678",
      address: "Indiranagar, Bengaluru, Karnataka",
    },
    product: {
      name: "Wireless Earbuds",
      sku: "SAG-WE-009",
      quantity: 1,
    },
    supplier: {
      name: "AudioZone",
      phone: "+91 97654 32109",
      address: "Koramangala, Bengaluru, Karnataka",
    },
    amount: 2499,
    payment: "Paid",
    deliveryStatus: "Delivered",
    deliveredAt: "24 Sep 2026, 6:20 PM",
    acceptedAt: "24 Sep 2026, 3:05 PM",
  },
  {
    id: "SAG-10264",
    customer: {
      name: "Vivek Singh",
      phone: "+91 99887 65432",
      address: "Gurugram, Haryana",
    },
    product: {
      name: "Laptop Backpack",
      sku: "SAG-LB-021",
      quantity: 1,
    },
    supplier: {
      name: "TravelGear India",
      phone: "+91 96543 21098",
      address: "Sector 18, Gurugram, Haryana",
    },
    amount: 1599,
    payment: "Paid",
    deliveryStatus: "Delivered",
    deliveredAt: "22 Sep 2026, 1:35 PM",
    acceptedAt: "22 Sep 2026, 10:22 AM",
  },
  {
    id: "SAG-10259",
    customer: {
      name: "Neha Verma",
      phone: "+91 98712 34567",
      address: "Salt Lake, Kolkata, West Bengal",
    },
    product: {
      name: "LED Desk Lamp",
      sku: "SAG-LD-031",
      quantity: 1,
    },
    supplier: {
      name: "HomeNest Traders",
      phone: "+91 98123 45678",
      address: "New Town, Kolkata, West Bengal",
    },
    amount: 1798,
    payment: "Paid",
    deliveryStatus: "Delivered",
    deliveredAt: "20 Sep 2026, 11:10 AM",
    acceptedAt: "20 Sep 2026, 8:55 AM",
  },
  {
    id: "SAG-10254",
    customer: {
      name: "Rohit Das",
      phone: "+91 91234 56789",
      address: "Banjara Hills, Hyderabad, Telangana",
    },
    product: {
      name: "Gaming Mouse",
      sku: "SAG-GM-011",
      quantity: 1,
    },
    supplier: {
      name: "TechWorld Supplies",
      phone: "+91 98765 11223",
      address: "Electronic City, Bengaluru, Karnataka",
    },
    amount: 1299,
    payment: "Paid",
    deliveryStatus: "Delivered",
    deliveredAt: "18 Sep 2026, 4:45 PM",
    acceptedAt: "18 Sep 2026, 2:15 PM",
  },
];

function DeliveryHistory() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");

  useEffect(() => {
    const loadHistory = () => {
      const savedOrders = JSON.parse(
        localStorage.getItem("deliveryHistory") || "[]"
      );

      const savedIds = new Set(
        savedOrders.map((order) => order.id)
      );

      const combinedOrders = [
        ...savedOrders,
        ...dummyHistoryOrders.filter(
          (order) => !savedIds.has(order.id)
        ),
      ];

      setOrders(combinedOrders);
    };

    loadHistory();

    window.addEventListener(
      "storage",
      loadHistory
    );

    return () => {
      window.removeEventListener(
        "storage",
        loadHistory
      );
    };
  }, []);

  const filteredOrders = orders.filter((order) => {
    const searchValue = search.toLowerCase();

    const matchesSearch =
      order.id.toLowerCase().includes(searchValue) ||
      order.customer.name
        .toLowerCase()
        .includes(searchValue) ||
      order.product.name
        .toLowerCase()
        .includes(searchValue) ||
      order.supplier.name
        .toLowerCase()
        .includes(searchValue);

    const matchesStatus =
      status === "All" ||
      order.deliveryStatus === status;

    const matchesDate =
      dateFilter === "All" ||
      order.deliveredAt.includes(dateFilter);

    return (
      matchesSearch &&
      matchesStatus &&
      matchesDate
    );
  });

  const totalEarnings = orders.reduce(
    (total, order) => total + order.amount,
    0
  );

  const viewDetails = (order) => {
    navigate("/delivery/dashboard", {
      state: {
        order,
      },
    });
  };

  return (
    <div className="delivery-history-page">
      <div className="delivery-history-heading">
        <div>
          <span>DELIVERY OPERATIONS</span>

          <h1>Delivery History</h1>

          <p>
            Review your completed delivery records and
            earnings.
          </p>
        </div>

        <div className="delivery-history-total">
          <div>
            <History size={22} />
          </div>

          <div>
            <span>TOTAL DELIVERIES</span>

            <strong>{orders.length}</strong>
          </div>
        </div>
      </div>

      <div className="delivery-history-stats">
        <div className="delivery-history-stat">
          <div className="delivery-history-stat-icon blue">
            <Package size={19} />
          </div>

          <div>
            <span>Total Deliveries</span>
            <strong>{orders.length}</strong>
          </div>
        </div>

        <div className="delivery-history-stat">
          <div className="delivery-history-stat-icon purple">
            <CalendarDays size={19} />
          </div>

          <div>
            <span>This Month</span>

            <strong>
              {
                orders.filter((order) =>
                  order.deliveredAt.includes("Oct 2026")
                ).length
              }
            </strong>
          </div>
        </div>

        <div className="delivery-history-stat">
          <div className="delivery-history-stat-icon mint">
            <CheckCircle2 size={19} />
          </div>

          <div>
            <span>Successful</span>
            <strong>{orders.length}</strong>
          </div>
        </div>

        <div className="delivery-history-stat">
          <div className="delivery-history-stat-icon orange">
            <IndianRupee size={19} />
          </div>

          <div>
            <span>Total Earnings</span>

            <strong>
              ₹{totalEarnings.toLocaleString("en-IN")}
            </strong>
          </div>
        </div>
      </div>

      <section className="delivery-history-card">
        <div className="delivery-history-toolbar">
          <div className="delivery-history-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search order, customer, product..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

          <div className="delivery-history-filters">
            <div className="delivery-history-filter">
              <Filter size={15} />

              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value)
                }
              >
                <option value="All">All Status</option>

                <option value="Delivered">
                  Delivered
                </option>
              </select>
            </div>

            <div className="delivery-history-filter">
              <CalendarDays size={15} />

              <select
                value={dateFilter}
                onChange={(event) =>
                  setDateFilter(event.target.value)
                }
              >
                <option value="All">All Dates</option>

                <option value="Oct 2026">
                  October 2026
                </option>

                <option value="Sep 2026">
                  September 2026
                </option>
              </select>
            </div>
          </div>
        </div>

        <div className="delivery-history-list">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <div
                className="delivery-history-item"
                key={order.id}
              >
                <div className="delivery-history-item-top">
                  <div className="delivery-history-order-id">
                    <div className="delivery-history-order-icon">
                      <Package size={18} />
                    </div>

                    <div>
                      <span>ORDER</span>

                      <h3>{order.id}</h3>
                    </div>
                  </div>

                  <div className="delivery-history-status">
                    <CheckCircle2 size={14} />

                    Delivered
                  </div>
                </div>

                <div className="delivery-history-item-grid">
                  <div>
                    <span>CUSTOMER</span>

                    <strong>
                      <User size={14} />

                      {order.customer.name}
                    </strong>

                    <p>
                      {order.customer.address}
                    </p>
                  </div>

                  <div>
                    <span>PRODUCT</span>

                    <strong>
                      <Package size={14} />

                      {order.product.name}
                    </strong>

                    <p>
                      Quantity: {order.product.quantity}
                    </p>
                  </div>

                  <div>
                    <span>SUPPLIER</span>

                    <strong>
                      <Store size={14} />

                      {order.supplier.name}
                    </strong>

                    <p>
                      {order.supplier.address}
                    </p>
                  </div>

                  <div>
                    <span>AMOUNT</span>

                    <strong>
                      ₹{order.amount.toLocaleString("en-IN")}
                    </strong>

                    <p>{order.payment}</p>
                  </div>
                </div>

                <div className="delivery-history-item-bottom">
                  <div>
                    <span>DELIVERED ON</span>

                    <strong>
                      {order.deliveredAt}
                    </strong>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      viewDetails(order)
                    }
                  >
                    View Details

                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="delivery-history-empty">
              <div>
                <Search size={25} />
              </div>

              <h3>No deliveries found</h3>

              <p>
                Try changing your search or filter.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default DeliveryHistory;