import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../Context/AuthContext";

function ProtectedRoute() {
  const {
    isAuthenticated,
    isCheckingAuth,
  } = useAuth();

  if (isCheckingAuth) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F7F9FC",
          color: "#172033",
          fontSize: "15px",
          fontWeight: 600,
        }}
      >
        Checking secure access...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/delivery/login"
        replace
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;