import { useState } from "react";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Users,
  UserCheck,
  ShoppingBag,
  Wallet,
  X,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
} from "lucide-react";

import "./Customers.css";


const initialCustomers = [
  {
    id: 1,
    name: "Rahul Sharma",
    email: "rahul.sharma@gmail.com",
    phone: "+91 98765 43210",
    location: "Hyderabad, Telangana",
    orders: 28,
    spending: 68450,
    lastOrder: "01 Oct 2026",
    joined: "12 Jan 2025",
    status: "Active",
    initials: "RS",
  },
  {
    id: 2,
    name: "Priya Reddy",
    email: "priya.reddy@gmail.com",
    phone: "+91 99887 12345",
    location: "Bengaluru, Karnataka",
    orders: 21,
    spending: 52780,
    lastOrder: "01 Oct 2026",
    joined: "24 Mar 2025",
    status: "Active",
    initials: "PR",
  },
  {
    id: 3,
    name: "Arjun Kumar",
    email: "arjun.kumar@gmail.com",
    phone: "+91 91234 56780",
    location: "Chennai, Tamil Nadu",
    orders: 19,
    spending: 46320,
    lastOrder: "30 Sep 2026",
    joined: "08 Apr 2025",
    status: "Active",
    initials: "AK",
  },
  {
    id: 4,
    name: "Sneha Patel",
    email: "sneha.patel@gmail.com",
    phone: "+91 97654 32100",
    location: "Mumbai, Maharashtra",
    orders: 16,
    spending: 38950,
    lastOrder: "30 Sep 2026",
    joined: "17 May 2025",
    status: "Active",
    initials: "SP",
  },
  {
    id: 5,
    name: "Vikram Singh",
    email: "vikram.singh@gmail.com",
    phone: "+91 94567 89012",
    location: "Delhi, Delhi",
    orders: 14,
    spending: 32400,
    lastOrder: "29 Sep 2026",
    joined: "02 Jun 2025",
    status: "Active",
    initials: "VS",
  },
  {
    id: 6,
    name: "Ananya Rao",
    email: "ananya.rao@gmail.com",
    phone: "+91 93456 78901",
    location: "Pune, Maharashtra",
    orders: 11,
    spending: 27650,
    lastOrder: "29 Sep 2026",
    joined: "19 Jul 2025",
    status: "Blocked",
    initials: "AR",
  },
  {
    id: 7,
    name: "Karan Mehta",
    email: "karan.mehta@gmail.com",
    phone: "+91 92345 67890",
    location: "Ahmedabad, Gujarat",
    orders: 9,
    spending: 21890,
    lastOrder: "28 Sep 2026",
    joined: "11 Aug 2025",
    status: "Active",
    initials: "KM",
  },
  {
    id: 8,
    name: "Meera Nair",
    email: "meera.nair@gmail.com",
    phone: "+91 98760 12345",
    location: "Kochi, Kerala",
    orders: 7,
    spending: 15480,
    lastOrder: "28 Sep 2026",
    joined: "05 Sep 2025",
    status: "Active",
    initials: "MN",
  },
];


function Customers() {

  const [customers, setCustomers] =
    useState(initialCustomers);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [selectedCustomer, setSelectedCustomer] =
    useState(null);

  const [editingCustomer, setEditingCustomer] =
    useState(null);

  const [showAddModal, setShowAddModal] =
    useState(false);


  const filteredCustomers = customers.filter(
    (customer) => {

      const searchValue =
        search.toLowerCase();

      const matchesSearch =
        customer.name
          .toLowerCase()
          .includes(searchValue) ||

        customer.email
          .toLowerCase()
          .includes(searchValue) ||

        customer.phone
          .toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        statusFilter === "All" ||
        customer.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    }
  );


  const formatPrice = (amount) => {
    return `₹${amount.toLocaleString("en-IN")}`;
  };


  const getStatusClass = (status) => {

    return status === "Active"
      ? "customer-active"
      : "customer-blocked";
  };


  const handleAddCustomer = (event) => {

    event.preventDefault();

    const form = event.target;

    const name = form.customerName.value;

    const newCustomer = {
      id: customers.length + 1,

      name,

      email: form.email.value,

      phone: form.phone.value,

      location: form.location.value,

      orders: 0,

      spending: 0,

      lastOrder: "No orders yet",

      joined: "01 Oct 2026",

      status: "Active",

      initials: name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    };


    setCustomers([
      newCustomer,
      ...customers,
    ]);

    setShowAddModal(false);
  };


  const handleEditCustomer = (event) => {

    event.preventDefault();

    const form = event.target;

    const updatedCustomer = {
      ...editingCustomer,

      name: form.customerName.value,

      email: form.email.value,

      phone: form.phone.value,

      location: form.location.value,

      initials: form.customerName.value
        .split(" ")
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase(),
    };


    setCustomers(
      customers.map((customer) =>
        customer.id === editingCustomer.id
          ? updatedCustomer
          : customer
      )
    );

    setEditingCustomer(null);
  };


  return (
    <div className="customers-page">

      {/* PAGE HEADER */}

      <div className="customers-page-header">

        <div>

          <p className="customers-eyebrow">
            CUSTOMER MANAGEMENT
          </p>

          <h2>Customers</h2>

          <p className="customers-subtitle">
            Manage customer accounts, orders and
            spending activity.
          </p>

        </div>


        <button
          className="add-customer-button"
          onClick={() =>
            setShowAddModal(true)
          }
        >
          <Plus size={18} />

          <span>Add Customer</span>
        </button>

      </div>


      {/* STATS */}

      <div className="customer-stats">

        <div className="customer-stat-card">

          <div className="customer-stat-icon blue">
            <Users size={20} />
          </div>

          <div>

            <span>Total Customers</span>

            <strong>3,842</strong>

          </div>

        </div>


        <div className="customer-stat-card">

          <div className="customer-stat-icon green">
            <UserCheck size={20} />
          </div>

          <div>

            <span>Active Customers</span>

            <strong>3,716</strong>

          </div>

        </div>


        <div className="customer-stat-card">

          <div className="customer-stat-icon purple">
            <ShoppingBag size={20} />
          </div>

          <div>

            <span>Total Orders</span>

            <strong>1,284</strong>

          </div>

        </div>


        <div className="customer-stat-card">

          <div className="customer-stat-icon mint">
            <Wallet size={20} />
          </div>

          <div>

            <span>Total Spending</span>

            <strong>₹8.42L</strong>

          </div>

        </div>

      </div>


      {/* FILTER BAR */}

      <div className="customers-filter-bar">

        <div className="customers-search">

          <Search size={18} />

          <input
            type="text"
            placeholder="Search name, email or phone..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          {search && (

            <button
              className="customer-clear-search"
              onClick={() => setSearch("")}
            >
              <X size={15} />
            </button>

          )}

        </div>


        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
        >

          <option value="All">
            All Status
          </option>

          <option value="Active">
            Active
          </option>

          <option value="Blocked">
            Blocked
          </option>

        </select>

      </div>


      {/* CUSTOMER TABLE */}

      <div className="customers-table-card">

        <div className="customers-table-top">

          <div>

            <h3>Customer Directory</h3>

            <p>
              Showing {filteredCustomers.length} customers
            </p>

          </div>

        </div>


        <div className="customers-table-wrapper">

          <table>

            <thead>

              <tr>

                <th>CUSTOMER</th>

                <th>CONTACT</th>

                <th>LOCATION</th>

                <th>ORDERS</th>

                <th>SPENDING</th>

                <th>LAST ORDER</th>

                <th>STATUS</th>

                <th>ACTION</th>

              </tr>

            </thead>


            <tbody>

              {filteredCustomers.map(
                (customer) => (

                  <tr key={customer.id}>

                    {/* CUSTOMER */}

                    <td>

                      <div className="customer-info">

                        <div className="customer-avatar">
                          {customer.initials}
                        </div>

                        <div>

                          <strong>
                            {customer.name}
                          </strong>

                          <span>
                            Customer #{String(
                              customer.id
                            ).padStart(4, "0")}
                          </span>

                        </div>

                      </div>

                    </td>


                    {/* CONTACT */}

                    <td>

                      <div className="customer-contact">

                        <span>
                          <Mail size={12} />
                          {customer.email}
                        </span>

                        <span>
                          <Phone size={12} />
                          {customer.phone}
                        </span>

                      </div>

                    </td>


                    {/* LOCATION */}

                    <td>

                      <span className="customer-location">

                        <MapPin size={13} />

                        {customer.location}

                      </span>

                    </td>


                    {/* ORDERS */}

                    <td>

                      <strong className="customer-orders">
                        {customer.orders}
                      </strong>

                    </td>


                    {/* SPENDING */}

                    <td>

                      <strong className="customer-spending">
                        {formatPrice(
                          customer.spending
                        )}
                      </strong>

                    </td>


                    {/* LAST ORDER */}

                    <td>

                      <span className="last-order">
                        {customer.lastOrder}
                      </span>

                    </td>


                    {/* STATUS */}

                    <td>

                      <span
                        className={`customer-status ${getStatusClass(
                          customer.status
                        )}`}
                      >

                        <span></span>

                        {customer.status}

                      </span>

                    </td>


                    {/* ACTION */}

                    <td>

                      <div className="customer-actions">

                        <button
                          title="View customer"
                          onClick={() =>
                            setSelectedCustomer(
                              customer
                            )
                          }
                        >
                          <Eye size={17} />
                        </button>


                        <button
                          title="Edit customer"
                          onClick={() =>
                            setEditingCustomer(
                              customer
                            )
                          }
                        >
                          <Pencil size={17} />
                        </button>

                      </div>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>


          {filteredCustomers.length === 0 && (

            <div className="customers-empty">

              <Users size={38} />

              <h3>No customers found</h3>

              <p>
                Try changing your search or filter.
              </p>

            </div>

          )}

        </div>

      </div>


      {/* VIEW CUSTOMER MODAL */}

      {selectedCustomer && (

        <div
          className="customer-modal-overlay"
          onClick={() =>
            setSelectedCustomer(null)
          }
        >

          <div
            className="customer-view-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <button
              className="customer-modal-close"
              onClick={() =>
                setSelectedCustomer(null)
              }
            >
              <X size={20} />
            </button>


            <div className="customer-profile-heading">

              <div className="customer-large-avatar">
                {selectedCustomer.initials}
              </div>

              <div>

                <p>CUSTOMER PROFILE</p>

                <h3>
                  {selectedCustomer.name}
                </h3>

                <span>
                  Customer #{String(
                    selectedCustomer.id
                  ).padStart(4, "0")}
                </span>

              </div>

            </div>


            <div className="customer-detail-list">

              <div>

                <Mail size={17} />

                <div>

                  <span>Email Address</span>

                  <strong>
                    {selectedCustomer.email}
                  </strong>

                </div>

              </div>


              <div>

                <Phone size={17} />

                <div>

                  <span>Phone Number</span>

                  <strong>
                    {selectedCustomer.phone}
                  </strong>

                </div>

              </div>


              <div>

                <MapPin size={17} />

                <div>

                  <span>Location</span>

                  <strong>
                    {selectedCustomer.location}
                  </strong>

                </div>

              </div>


              <div>

                <CalendarDays size={17} />

                <div>

                  <span>Joined</span>

                  <strong>
                    {selectedCustomer.joined}
                  </strong>

                </div>

              </div>

            </div>


            <div className="customer-profile-stats">

              <div>
                <span>Total Orders</span>
                <strong>
                  {selectedCustomer.orders}
                </strong>
              </div>

              <div>
                <span>Total Spending</span>
                <strong>
                  {formatPrice(
                    selectedCustomer.spending
                  )}
                </strong>
              </div>

              <div>
                <span>Status</span>
                <strong>
                  {selectedCustomer.status}
                </strong>
              </div>

            </div>

          </div>

        </div>

      )}


      {/* ADD CUSTOMER MODAL */}

      {showAddModal && (

        <div
          className="customer-modal-overlay"
          onClick={() =>
            setShowAddModal(false)
          }
        >

          <div
            className="customer-form-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="customer-modal-heading">

              <div>

                <p>CUSTOMER MANAGEMENT</p>

                <h3>Add New Customer</h3>

              </div>

              <button
                onClick={() =>
                  setShowAddModal(false)
                }
              >
                <X size={20} />
              </button>

            </div>


            <form onSubmit={handleAddCustomer}>

              <div className="customer-form-grid">

                <div className="customer-form-group">

                  <label>Customer Name</label>

                  <input
                    name="customerName"
                    placeholder="Enter customer name"
                    required
                  />

                </div>


                <div className="customer-form-group">

                  <label>Email Address</label>

                  <input
                    name="email"
                    type="email"
                    placeholder="customer@example.com"
                    required
                  />

                </div>


                <div className="customer-form-group">

                  <label>Phone Number</label>

                  <input
                    name="phone"
                    placeholder="+91 XXXXX XXXXX"
                    required
                  />

                </div>


                <div className="customer-form-group">

                  <label>Location</label>

                  <input
                    name="location"
                    placeholder="City, State"
                    required
                  />

                </div>

              </div>


              <div className="customer-form-actions">

                <button
                  type="button"
                  className="customer-cancel-button"
                  onClick={() =>
                    setShowAddModal(false)
                  }
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="save-customer-button"
                >
                  <Plus size={17} />
                  Add Customer
                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* EDIT CUSTOMER MODAL */}

      {editingCustomer && (

        <div
          className="customer-modal-overlay"
          onClick={() =>
            setEditingCustomer(null)
          }
        >

          <div
            className="customer-form-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="customer-modal-heading">

              <div>

                <p>CUSTOMER MANAGEMENT</p>

                <h3>Edit Customer</h3>

              </div>

              <button
                onClick={() =>
                  setEditingCustomer(null)
                }
              >
                <X size={20} />
              </button>

            </div>


            <form onSubmit={handleEditCustomer}>

              <div className="customer-form-grid">

                <div className="customer-form-group">

                  <label>Customer Name</label>

                  <input
                    name="customerName"
                    defaultValue={
                      editingCustomer.name
                    }
                    required
                  />

                </div>


                <div className="customer-form-group">

                  <label>Email Address</label>

                  <input
                    name="email"
                    type="email"
                    defaultValue={
                      editingCustomer.email
                    }
                    required
                  />

                </div>


                <div className="customer-form-group">

                  <label>Phone Number</label>

                  <input
                    name="phone"
                    defaultValue={
                      editingCustomer.phone
                    }
                    required
                  />

                </div>


                <div className="customer-form-group">

                  <label>Location</label>

                  <input
                    name="location"
                    defaultValue={
                      editingCustomer.location
                    }
                    required
                  />

                </div>

              </div>


              <div className="customer-form-actions">

                <button
                  type="button"
                  className="customer-cancel-button"
                  onClick={() =>
                    setEditingCustomer(null)
                  }
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="save-customer-button"
                >
                  <Pencil size={17} />
                  Save Changes
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}


export default Customers;