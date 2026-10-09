import { useEffect, useMemo, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  Eye,
  Package,
  ShoppingCart,
  Star,
  AlertTriangle,
  CheckCircle2,
  Ban,
  X,
  Building2,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

import "./Suppliers.css";

function Suppliers() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showSuspendModal, setShowSuspendModal] = useState(false);

  const [suspendReason, setSuspendReason] = useState("");
  const [suspendNotes, setSuspendNotes] = useState("");

  // ============================================
  // LOAD SUPPLIERS
  // ============================================

  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:5000/api/suppliers"
        );

        if (!response.ok) {
          throw new Error("Failed to load suppliers");
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(
            data.message || "Failed to load suppliers"
          );
        }

        const formattedSuppliers = (data.suppliers || []).map(
          (supplier) => ({
            id: supplier.id,
            name:
              supplier.businessName ||
              supplier.name ||
              "Unnamed Supplier",

            initials: (
              supplier.businessName ||
              supplier.name ||
              "SU"
            )
              .split(" ")
              .map((word) => word.charAt(0))
              .join("")
              .slice(0, 2)
              .toUpperCase(),

            email: supplier.email || "No email",
            phone: supplier.phone || "No phone",

            location: [
              supplier.city,
              supplier.state,
            ]
              .filter(Boolean)
              .join(", ") || "Location not available",

            products: 0,
            orders: 0,
            revenue: 0,
            rating: 0,
            complaints: 0,

            status:
              supplier.status === "ACTIVE"
                ? "Active"
                : supplier.status === "BLOCKED"
                ? "Blocked"
                : supplier.status || "Active",

            address: supplier.address || "",
            pincode: supplier.pincode || "",
            userId: supplier.userId,
            createdAt: supplier.createdAt,
          })
        );

        setSuppliers(formattedSuppliers);
      } catch (err) {
        console.error("Load suppliers error:", err);

        setError(
          err.message || "Unable to load suppliers"
        );
      } finally {
        setLoading(false);
      }
    };

    loadSuppliers();
  }, []);

  // ============================================
  // FILTER SUPPLIERS
  // ============================================

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((supplier) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        supplier.name.toLowerCase().includes(searchText) ||
        supplier.email.toLowerCase().includes(searchText) ||
        supplier.location.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "All" ||
        supplier.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [suppliers, search, statusFilter]);

  // ============================================
  // SUPPLIER STATS
  // ============================================

  const totalSuppliers = suppliers.length;

  const activeSuppliers = suppliers.filter(
    (supplier) => supplier.status === "Active"
  ).length;

  const totalProducts = suppliers.reduce(
    (total, supplier) => total + supplier.products,
    0
  );

  const totalComplaints = suppliers.reduce(
    (total, supplier) => total + supplier.complaints,
    0
  );

  // ============================================
  // SUSPEND MODAL
  // ============================================

  const openSuspendModal = (supplier) => {
    setSelectedSupplier(supplier);
    setSuspendReason("");
    setSuspendNotes("");
    setShowSuspendModal(true);
  };

  const closeSuspendModal = () => {
    setShowSuspendModal(false);
    setSelectedSupplier(null);
    setSuspendReason("");
    setSuspendNotes("");
  };

  const handleSuspend = () => {
    if (!suspendReason) {
      return;
    }

    closeSuspendModal();
  };

  // ============================================
  // LOADING STATE
  // ============================================

  if (loading) {
    return (
      <div className="suppliers-page">
        <div className="suppliers-header">
          <div>
            <p className="suppliers-eyebrow">
              PARTNER MANAGEMENT
            </p>

            <h2>Suppliers</h2>

            <p>
              Manage supplier relationships, performance,
              products and complaints.
            </p>
          </div>
        </div>

        <div className="suppliers-card">
          <div className="suppliers-empty">
            <Building2 size={28} />
            <strong>Loading suppliers...</strong>
            <span>
              Fetching supplier information from the server.
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
      <div className="suppliers-page">
        <div className="suppliers-header">
          <div>
            <p className="suppliers-eyebrow">
              PARTNER MANAGEMENT
            </p>

            <h2>Suppliers</h2>

            <p>
              Manage supplier relationships, performance,
              products and complaints.
            </p>
          </div>
        </div>

        <div className="suppliers-card">
          <div className="suppliers-empty">
            <AlertTriangle size={28} />

            <strong>
              Unable to load suppliers
            </strong>

            <span>
              {error}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="suppliers-page">

      {/* PAGE HEADER */}

      <div className="suppliers-header">

        <div>
          <p className="suppliers-eyebrow">
            PARTNER MANAGEMENT
          </p>

          <h2>Suppliers</h2>

          <p>
            Manage supplier relationships, performance,
            products and complaints.
          </p>
        </div>

        <button className="add-supplier-button">
          <Building2 size={17} />
          Add Supplier
        </button>

      </div>


      {/* SUMMARY */}

      <div className="supplier-stats">

        <div className="supplier-stat-card">

          <div className="supplier-stat-icon blue">
            <Building2 size={19} />
          </div>

          <div>
            <span>Total Suppliers</span>
            <strong>{totalSuppliers}</strong>
          </div>

        </div>


        <div className="supplier-stat-card">

          <div className="supplier-stat-icon green">
            <CheckCircle2 size={19} />
          </div>

          <div>
            <span>Active Suppliers</span>
            <strong>{activeSuppliers}</strong>
          </div>

        </div>


        <div className="supplier-stat-card">

          <div className="supplier-stat-icon purple">
            <Package size={19} />
          </div>

          <div>
            <span>Products Supplied</span>
            <strong>
              {totalProducts.toLocaleString("en-IN")}
            </strong>
          </div>

        </div>


        <div className="supplier-stat-card">

          <div className="supplier-stat-icon orange">
            <AlertTriangle size={19} />
          </div>

          <div>
            <span>Open Complaints</span>
            <strong>{totalComplaints}</strong>
          </div>

        </div>

      </div>


      {/* MAIN CARD */}

      <div className="suppliers-card">

        {/* TOOLBAR */}

        <div className="suppliers-toolbar">

          <div className="supplier-search">

            <Search size={18} />

            <input
              type="text"
              placeholder="Search supplier, email, location..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

          </div>


          <div className="supplier-filter">

            <SlidersHorizontal size={15} />

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

            <ChevronDown size={14} />

          </div>

        </div>


        {/* TABLE */}

        <div className="suppliers-table-wrapper">

          <table className="suppliers-table">

            <thead>

              <tr>
                <th>Supplier</th>
                <th>Products</th>
                <th>Orders</th>
                <th>Revenue</th>
                <th>Rating</th>
                <th>Complaints</th>
                <th>Status</th>
                <th>Action</th>
              </tr>

            </thead>


            <tbody>

              {filteredSuppliers.map((supplier) => (

                <tr key={supplier.id}>

                  {/* SUPPLIER */}

                  <td>

                    <div className="supplier-cell">

                      <div className="supplier-avatar">
                        {supplier.initials}
                      </div>

                      <div>

                        <strong>
                          {supplier.name}
                        </strong>

                        <span>
                          {supplier.location}
                        </span>

                      </div>

                    </div>

                  </td>


                  {/* PRODUCTS */}

                  <td>

                    <div className="supplier-number">

                      <Package size={14} />

                      {supplier.products}

                    </div>

                  </td>


                  {/* ORDERS */}

                  <td>

                    <div className="supplier-number">

                      <ShoppingCart size={14} />

                      {supplier.orders}

                    </div>

                  </td>


                  {/* REVENUE */}

                  <td>

                    <strong className="supplier-revenue">
                      ₹{supplier.revenue.toLocaleString("en-IN")}
                    </strong>

                  </td>


                  {/* RATING */}

                  <td>

                    <div className="supplier-rating">

                      <Star
                        size={14}
                        fill="currentColor"
                      />

                      <strong>
                        {supplier.rating || "—"}
                      </strong>

                    </div>

                  </td>


                  {/* COMPLAINTS */}

                  <td>

                    <span
                      className={
                        supplier.complaints >= 8
                          ? "complaints-high"
                          : "complaints-normal"
                      }
                    >
                      {supplier.complaints}
                    </span>

                  </td>


                  {/* STATUS */}

                  <td>

                    <span
                      className={`supplier-status supplier-status-${supplier.status.toLowerCase()}`}
                    >
                      <span></span>
                      {supplier.status}
                    </span>

                  </td>


                  {/* ACTION */}

                  <td>

                    <div className="supplier-actions">

                      <button
                        className="supplier-view-button"
                        title="View supplier"
                        onClick={() =>
                          setSelectedSupplier(supplier)
                        }
                      >
                        <Eye size={16} />
                      </button>


                      {supplier.status === "Active" && (

                        <button
                          className="supplier-suspend-button"
                          title="Suspend supplier"
                          onClick={() =>
                            openSuspendModal(supplier)
                          }
                        >
                          <Ban size={15} />
                        </button>

                      )}

                    </div>

                  </td>

                </tr>

              ))}


              {filteredSuppliers.length === 0 && (

                <tr>

                  <td
                    colSpan="8"
                    className="suppliers-empty"
                  >

                    <Building2 size={28} />

                    <strong>
                      No suppliers found
                    </strong>

                    <span>
                      {suppliers.length === 0
                        ? "No suppliers are registered yet."
                        : "Try changing your search or filter."}
                    </span>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>


        {/* FOOTER */}

        <div className="suppliers-footer">

          Showing{" "}
          <strong>
            {filteredSuppliers.length}
          </strong>{" "}
          of{" "}
          <strong>
            {suppliers.length}
          </strong>{" "}
          suppliers

        </div>

      </div>


      {/* SUPPLIER QUICK VIEW */}

      {selectedSupplier && !showSuspendModal && (

        <div
          className="supplier-overlay"
          onClick={() => setSelectedSupplier(null)}
        >

          <div
            className="supplier-drawer"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="drawer-header">

              <div>

                <p>
                  SUPPLIER PROFILE
                </p>

                <h3>
                  {selectedSupplier.name}
                </h3>

              </div>

              <button
                onClick={() =>
                  setSelectedSupplier(null)
                }
              >
                <X size={19} />
              </button>

            </div>


            <div className="drawer-profile">

              <div className="drawer-avatar">
                {selectedSupplier.initials}
              </div>

              <div>

                <strong>
                  {selectedSupplier.name}
                </strong>

                <span>
                  {selectedSupplier.location}
                </span>

              </div>

            </div>


            <div className="drawer-contact">

              <div>
                <Mail size={15} />
                {selectedSupplier.email}
              </div>

              <div>
                <Phone size={15} />
                {selectedSupplier.phone}
              </div>

              <div>
                <MapPin size={15} />
                {selectedSupplier.location}
              </div>

              {selectedSupplier.address && (
                <div>
                  <MapPin size={15} />
                  {selectedSupplier.address}
                  {selectedSupplier.pincode
                    ? ` - ${selectedSupplier.pincode}`
                    : ""}
                </div>
              )}

            </div>


            <div className="drawer-metrics">

              <div>
                <span>Products</span>
                <strong>
                  {selectedSupplier.products}
                </strong>
              </div>

              <div>
                <span>Orders</span>
                <strong>
                  {selectedSupplier.orders}
                </strong>
              </div>

              <div>
                <span>Rating</span>
                <strong>
                  {selectedSupplier.rating || "—"}
                </strong>
              </div>

              <div>
                <span>Complaints</span>
                <strong>
                  {selectedSupplier.complaints}
                </strong>
              </div>

            </div>


            {selectedSupplier.status === "Active" && (

              <button
                className="drawer-suspend-button"
                onClick={() =>
                  openSuspendModal(selectedSupplier)
                }
              >
                <Ban size={17} />
                Suspend Supplier
              </button>

            )}

          </div>

        </div>

      )}


      {/* SUSPEND MODAL */}

      {showSuspendModal && selectedSupplier && (

        <div className="supplier-overlay">

          <div className="suspend-modal">

            <div className="suspend-modal-icon">
              <AlertTriangle size={22} />
            </div>


            <button
              className="suspend-close"
              onClick={closeSuspendModal}
            >
              <X size={18} />
            </button>


            <h3>
              Suspend Supplier?
            </h3>

            <p>
              You are about to suspend{" "}
              <strong>
                {selectedSupplier.name}
              </strong>
              . This should only be done when there
              is a valid business reason.
            </p>


            <div className="suspend-form">

              <label>
                Reason
              </label>

              <select
                value={suspendReason}
                onChange={(event) =>
                  setSuspendReason(event.target.value)
                }
              >

                <option value="">
                  Select a reason
                </option>

                <option value="Repeated complaints">
                  Repeated customer complaints
                </option>

                <option value="Poor product quality">
                  Poor product quality
                </option>

                <option value="Order issues">
                  Repeated order issues
                </option>

                <option value="Policy violation">
                  Policy violation
                </option>

                <option value="Other">
                  Other
                </option>

              </select>


              <label>
                Admin Notes
              </label>

              <textarea
                rows="4"
                placeholder="Add additional notes..."
                value={suspendNotes}
                onChange={(event) =>
                  setSuspendNotes(event.target.value)
                }
              />

            </div>


            <div className="suspend-actions">

              <button
                className="cancel-suspend"
                onClick={closeSuspendModal}
              >
                Cancel
              </button>

              <button
                className="confirm-suspend"
                disabled={!suspendReason}
                onClick={handleSuspend}
              >
                <Ban size={16} />
                Suspend Supplier
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Suppliers;