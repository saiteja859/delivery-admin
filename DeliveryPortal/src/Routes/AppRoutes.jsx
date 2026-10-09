
import { Navigate, Route, Routes } from "react-router-dom";

import DeliveryLogin from "../Pages/Login/DeliveryLogin";
import DeliveryRegister from "../Pages/Register/DeliveryRegister";
import DeliveryDashboard from "../Pages/Dashboard/DeliveryDashboard";
import DeliveryOrders from "../Pages/Orders/DeliveryOrders";
import DeliveryTracking from "../Pages/Tracking/DeliveryTracking";
import DeliveryHistory from "../Pages/History/DeliveryHistory";
import DeliveryProfile from "../Pages/Profile/DeliveryProfile";
import DeliveryNotifications from "../Pages/Notifications/DeliveryNotification";
import DeliverySupplier from "../Pages/Supplier/SupplierAcceptance";

import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  return (
    <Routes>
      {/* Delivery Login */}
      <Route
        path="/delivery/login"
        element={<DeliveryLogin />}
      />

      {/* Delivery Partner Registration */}
      <Route
        path="/delivery/register"
        element={<DeliveryRegister />}
      />

      {/* Protected Delivery Portal */}
      <Route element={<ProtectedRoute />}>
        <Route
          path="/delivery/dashboard"
          element={<DeliveryDashboard />}
        />

        <Route
          path="/delivery/orders"
          element={<DeliveryOrders />}
        />

        <Route
          path="/delivery/tracking"
          element={<DeliveryTracking />}
        />

        <Route
          path="/delivery/history"
          element={<DeliveryHistory />}
        />

        <Route
          path="/delivery/profile"
          element={<DeliveryProfile />}
        />

        <Route
          path="/delivery/notifications"
          element={<DeliveryNotifications />}
        />

        <Route
          path="/delivery/supplier"
          element={<DeliverySupplier />}
        />
      </Route>

      {/* Default route */}
      <Route
        path="/"
        element={
          <Navigate
            to="/delivery/login"
            replace
          />
        }
      />

      {/* Unknown route */}
      <Route
        path="*"
        element={
          <Navigate
            to="/delivery/login"
            replace
          />
        }
      />
    </Routes>
  );
}

export default AppRoutes;
