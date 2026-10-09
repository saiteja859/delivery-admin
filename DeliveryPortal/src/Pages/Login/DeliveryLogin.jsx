
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Truck,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  MapPin,
  LoaderCircle,
  UserPlus,
} from "lucide-react";

import { useAuth } from "../../Context/AuthContext";

import "./DeliveryLogin.css";

function DeliveryLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

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
        "http://localhost:5001/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(
          data.message ||
            "Invalid email or password. Please try again."
        );

        return;
      }

      // Store authentication through AuthContext
      login(data.token, data.user);

      // Clear password from React state
      setPassword("");

      navigate("/delivery/dashboard");
    } catch (error) {
      console.error("Delivery login error:", error);

      setError(
        "Unable to connect to the Delivery Portal. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    navigate("/delivery/register");
  };

  return (
    <div className="delivery-login-page">
      <div className="delivery-login-decoration">
        <span></span>
        <span></span>
        <span></span>
      </div>

      <div className="delivery-login-card">
        <div className="delivery-login-brand">
          <div className="delivery-login-logo">
            <Truck size={27} />
          </div>

          <div>
            <h1>
              Shop <span>All</span> Goods
            </h1>

            <p>DELIVERY PORTAL</p>
          </div>
        </div>

        <div className="delivery-login-heading">
          <span>DELIVERY OPERATIONS</span>

          <h2>
            Move orders.
            <br />
            <strong>Deliver with ease.</strong>
          </h2>

          <p>
            Manage assigned deliveries, pickup information,
            customer details and supplier information from
            one place.
          </p>
        </div>

        <form
          className="delivery-login-form"
          onSubmit={handleLogin}
        >
          <div className="delivery-login-field">
            <label>Email Address</label>

            <div className="delivery-login-input">
              <Mail size={17} />

              <input
                type="email"
                value={email}
                placeholder="ravi.kumar@shopallgoods.com"
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                }}
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div className="delivery-login-field">
            <label>Password</label>

            <div className="delivery-login-input">
              <Lock size={17} />

              <input
                type="password"
                value={password}
                placeholder="Enter your password"
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
                disabled={isLoading}
                required
              />
            </div>
          </div>

          {error && (
            <div className="delivery-login-error">
              <span>!</span>
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="delivery-login-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <LoaderCircle
                  size={18}
                  className="delivery-login-spinner"
                />

                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Enter Delivery Portal</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="delivery-login-register">
          <div className="delivery-login-register-line">
            <span></span>
            <p>NEW DELIVERY PARTNER?</p>
            <span></span>
          </div>

          <button
            type="button"
            className="delivery-login-register-button"
            onClick={handleRegister}
            disabled={isLoading}
          >
            <UserPlus size={17} />
            <span>Create Delivery Partner Account</span>
          </button>

          <p className="delivery-login-register-note">
            Register first and wait for administrator
            approval before logging in.
          </p>
        </div>

        <div className="delivery-login-features">
          <div>
            <ShieldCheck size={16} />
            <span>Secure Access</span>
          </div>

          <div>
            <MapPin size={16} />
            <span>Delivery Tracking</span>
          </div>
        </div>

        <div className="delivery-login-footer">
          <span></span>
          <p>Shop All Goods Delivery Network</p>
        </div>
      </div>
    </div>
  );
}

export default DeliveryLogin;