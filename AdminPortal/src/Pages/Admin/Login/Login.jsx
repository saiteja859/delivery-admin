
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      let data = null;

      try {
        data = await response.json();
      } catch (error) {
        data = null;
      }

      if (!response.ok || !data?.success) {
        setError(
          data?.message ||
            "Invalid email or password. Please try again."
        );
        return;
      }

      if (!data.token || !data.user) {
        setError(
          "Login response is missing authentication information."
        );
        return;
      }

      // Store the JWT token used by protected Admin APIs
      localStorage.setItem(
        "adminToken",
        data.token
      );

      // Store the authenticated Admin user
      localStorage.setItem(
        "adminUser",
        JSON.stringify(data.user)
      );

      navigate("/admin/dashboard", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Login request failed:",
        error
      );

      setError(
        "Unable to connect to the server. Please make sure the admin backend is running."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="brand-mark">
            <span>S</span>
          </div>

          <h1>
            Shop <span>All</span> Goods
          </h1>

          <div className="brand-line">
            <span></span>
            <p>ADMIN PORTAL</p>
            <span></span>
          </div>
        </div>

        <div className="login-header">
          <p className="welcome-label">
            WELCOME BACK
          </p>

          <h2>
            Your store,
            <br />
            <span>your control.</span>
          </h2>

          <p className="login-description">
            Manage your store, orders, suppliers and
            customers from one powerful workspace.
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">
              Email Address
            </label>

            <input
              id="email"
              type="email"
              placeholder="admin@shopallgoods.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError("");
              }}
              disabled={isLoading}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError("");
              }}
              disabled={isLoading}
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div className="login-error">
              <span>!</span>
              <p>{error}</p>
            </div>
          )}

          <div className="login-options">
            <label className="remember-me">
              <input
                type="checkbox"
                disabled={isLoading}
              />

              <span>Remember me</span>
            </label>

            <button
              type="button"
              className="forgot-password"
              disabled={isLoading}
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={isLoading}
          >
            <span>
              {isLoading
                ? "Signing in..."
                : "Enter Admin Portal"}
            </span>

            <span className="button-arrow">
              {isLoading ? "..." : "→"}
            </span>
          </button>
        </form>

        <div className="login-footer">
          <span className="footer-dot"></span>

          <p>
            Secure Shop All Goods management
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
