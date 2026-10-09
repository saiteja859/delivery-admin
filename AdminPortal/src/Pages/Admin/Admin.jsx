
import {
  NavLink,
  Outlet,
  useNavigate,
} from "react-router-dom";

import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Truck,
  Users,
  UserRoundPlus,
  Star,
  Bike,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";

import "./Admin.css";

function getAdminUser() {
  const storedUser = localStorage.getItem("adminUser");

  if (!storedUser || storedUser === "undefined") {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch (error) {
    console.error(
      "Invalid admin user data in localStorage:",
      error
    );

    localStorage.removeItem("adminUser");

    return null;
  }
}

function Admin() {
  const navigate = useNavigate();
  const adminUser = getAdminUser();

  const handleLogout = () => {
    localStorage.removeItem("adminUser");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("token");

    navigate("/admin/login", {
      replace: true,
    });
  };

  return (
    <div className="admin-layout">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <h2>Shop All Goods</h2>
          <span>Admin Portal</span>
        </div>

        <nav className="admin-sidebar-nav">
          <NavLink to="/admin/dashboard">
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/admin/orders">
            <ShoppingCart size={18} />
            <span>Orders</span>
          </NavLink>

          <NavLink to="/admin/products">
            <Package size={18} />
            <span>Products</span>
          </NavLink>

          <NavLink to="/admin/suppliers">
            <Truck size={18} />
            <span>Suppliers</span>
          </NavLink>

          {/* Existing customer management page */}
          <NavLink to="/admin/customers">
            <Users size={18} />
            <span>Customers</span>
          </NavLink>

          {/* New customer registrations page */}
          <NavLink to="/admin/customer-registrations">
            <UserRoundPlus size={18} />
            <span>Customer Registrations</span>
          </NavLink>

          <NavLink to="/admin/delivery-boys">
            <Bike size={18} />
            <span>Delivery Boys</span>
          </NavLink>

          <NavLink to="/admin/reviews">
            <Star size={18} />
            <span>Reviews</span>
          </NavLink>

          <NavLink to="/admin/reports">
            <BarChart3 size={18} />
            <span>Reports</span>
          </NavLink>
        </nav>

        {/* SIDEBAR BOTTOM */}
        <div className="admin-sidebar-bottom">
          <NavLink to="/admin/settings">
            <Settings size={18} />
            <span>Settings</span>
          </NavLink>

          <button
            type="button"
            className="admin-logout-button"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className="admin-main">
        {/* HEADER */}
        <header className="admin-header">
          <div className="admin-header-title">
            <p>SHOP ALL GOODS</p>
            <h1>Admin Portal</h1>
            <span>Manage your ecommerce system</span>
          </div>

          {/* ADMIN USER */}
          <div className="admin-user">
            <div className="admin-avatar">
              {adminUser?.name
                ? adminUser.name.charAt(0).toUpperCase()
                : "A"}
            </div>

            <div className="admin-user-info">
              <strong>{adminUser?.name || "Admin"}</strong>
              <span>Administrator</span>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Admin;
