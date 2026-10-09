
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "../Admin/Login/Login";
import Admin from "../Admin/Admin";
import Dashboard from "../Admin/Dashboard";

import Orders from "../Admin/Orders/Orders";
import OrderDetails from "../Admin/Orders/OrderDetails/OrderDetails";

import Products from "../Admin/Products/Products";
import Suppliers from "../Admin/Suppliers/Suppliers";
import Customers from "../Admin/Customers/Customers";
import CustomerRegistrations from "../Admin/CustomerRegistrations/CustomerRegistrations";
import DeliveryBoys from "../Admin/DeliveryBoys/DeliveryBoys";
import Reviews from "../Admin/Reviews/Reviews";
import Reports from "../Admin/Reports/Reports";
import Settings from "../Admin/Settings/Settings";

import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  return (
    <Routes>
      {/* ADMIN LOGIN */}
      <Route
        path="/admin/login"
        element={<Login />}
      />

      {/* PROTECTED ADMIN PORTAL */}
      <Route element={<ProtectedRoute />}>
        <Route
          path="/admin"
          element={<Admin />}
        >
          <Route
            index
            element={
              <Navigate
                to="dashboard"
                replace
              />
            }
          />

          <Route
            path="dashboard"
            element={<Dashboard />}
          />

          <Route
            path="orders"
            element={<Orders />}
          />

          <Route
            path="orders/:orderId"
            element={<OrderDetails />}
          />

          <Route
            path="products"
            element={<Products />}
          />

          <Route
            path="suppliers"
            element={<Suppliers />}
          />

          {/* Existing customer management page */}
          <Route
            path="customers"
            element={<Customers />}
          />

          {/* New customer registration page */}
          <Route
            path="customer-registrations"
            element={<CustomerRegistrations />}
          />

          <Route
            path="delivery-boys"
            element={<DeliveryBoys />}
          />

          <Route
            path="reviews"
            element={<Reviews />}
          />

          <Route
            path="reports"
            element={<Reports />}
          />

          <Route
            path="settings"
            element={<Settings />}
          />
        </Route>
      </Route>

      {/* DEFAULT ROUTE */}
      <Route
        path="/"
        element={
          <Navigate
            to="/admin/login"
            replace
          />
        }
      />

      {/* UNKNOWN ROUTES */}
      <Route
        path="*"
        element={
          <Navigate
            to="/admin/login"
            replace
          />
        }
      />
    </Routes>
  );
}

export default AppRoutes;
