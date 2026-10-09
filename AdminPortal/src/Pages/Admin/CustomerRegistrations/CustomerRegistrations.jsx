
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Users,
  UserRound,
  Mail,
  Phone,
  CalendarDays,
  Search,
  RefreshCw,
  UserCheck,
  Clock,
  AlertCircle,
} from "lucide-react";

import "./CustomerRegistrations.css";

const API_URL = "http://localhost:5000/api/notifications";

const CustomerRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const result = await response.json();

      if (!result.success || !Array.isArray(result.data)) {
        throw new Error("Unexpected response from the notifications API.");
      }

      // Keep only customer registration notifications.
      const customerNotifications = result.data.filter(
        (notification) =>
          notification.notification_type === "CUSTOMER_REGISTRATION"
      );

      setRegistrations(customerNotifications);
    } catch (err) {
      console.error("Failed to fetch customer registrations:", err);
      setError(
        "Unable to load customer registrations. Check that the Admin backend is running on port 5000."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const getCustomerDetails = (notification) => {
    const details = {
      name: "",
      email: "",
      phone: "",
    };

    const lines = (notification.message || "").split(/\r?\n/);

    lines.forEach((line) => {
      const separatorIndex = line.indexOf(":");

      if (separatorIndex === -1) return;

      const label = line.slice(0, separatorIndex).trim().toLowerCase();
      const value = line.slice(separatorIndex + 1).trim();

      if (label === "name") details.name = value;
      if (label === "email") details.email = value;
      if (label === "phone") details.phone = value;
    });

    // Fall back to the notification title when a name is unavailable.
    if (!details.name) {
      details.name = "Customer";
    }

    return details;
  };

  const filteredRegistrations = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) return registrations;

    return registrations.filter((notification) => {
      const customer = getCustomerDetails(notification);

      return (
        customer.name.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        customer.phone.toLowerCase().includes(query)
      );
    });
  }, [registrations, searchTerm]);

  const formatDate = (dateValue) => {
    if (!dateValue) return "—";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (name) => {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase();
  };

  return (
    <div className="customer-registrations-page">
      <div className="cr-page-header">
        <div>
          <p className="cr-eyebrow">CUSTOMER MANAGEMENT</p>
          <h2>Customer Registrations</h2>
          <p className="cr-subtitle">
            View customers who have registered with Shop All Goods.
          </p>
        </div>

        <button
          type="button"
          className="cr-refresh-button"
          onClick={fetchRegistrations}
          disabled={loading}
        >
          <RefreshCw
            size={17}
            className={loading ? "cr-spinning" : ""}
          />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="cr-stats">
        <div className="cr-stat-card">
          <div className="cr-stat-icon blue">
            <Users size={21} />
          </div>
          <div>
            <span>Total Registrations</span>
            <strong>{registrations.length}</strong>
          </div>
        </div>

        <div className="cr-stat-card">
          <div className="cr-stat-icon green">
            <UserCheck size={21} />
          </div>
          <div>
            <span>Matching Results</span>
            <strong>{filteredRegistrations.length}</strong>
          </div>
        </div>

        <div className="cr-stat-card">
          <div className="cr-stat-icon purple">
            <CalendarDays size={21} />
          </div>
          <div>
            <span>Latest Registration</span>
            <strong className="cr-latest-value">
              {registrations.length > 0
                ? formatDate(
                    registrations.reduce((latest, current) =>
                      new Date(current.created_at) >
                      new Date(latest.created_at)
                        ? current
                        : latest
                    ).created_at
                  )
                : "—"}
            </strong>
          </div>
        </div>
      </div>

      <div className="cr-filter-bar">
        <div className="cr-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by customer name, email, or phone..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            aria-label="Search customer registrations"
          />
          {searchTerm && (
            <button
              type="button"
              className="cr-clear-search"
              onClick={() => setSearchTerm("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className="cr-table-card">
        <div className="cr-table-top">
          <div>
            <h3>Registered Customers</h3>
            <p>
              Registration records received from the customer registration
              system.
            </p>
          </div>
          <span className="cr-record-count">
            {filteredRegistrations.length} records
          </span>
        </div>

        {error && (
          <div className="cr-error">
            <AlertCircle size={19} />
            <span>{error}</span>
            <button type="button" onClick={fetchRegistrations}>
              Try again
            </button>
          </div>
        )}

        {loading && registrations.length === 0 ? (
          <div className="cr-state">
            <RefreshCw size={28} className="cr-spinning" />
            <h3>Loading registrations</h3>
            <p>Please wait while we retrieve customer records.</p>
          </div>
        ) : !error && filteredRegistrations.length === 0 ? (
          <div className="cr-state">
            <UserRound size={38} />
            <h3>
              {searchTerm
                ? "No matching customers"
                : "No registrations yet"}
            </h3>
            <p>
              {searchTerm
                ? "Try a different name, email address, or phone number."
                : "New customer registrations will appear here."}
            </p>
          </div>
        ) : (
          <div className="cr-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>CUSTOMER</th>
                  <th>EMAIL ADDRESS</th>
                  <th>PHONE NUMBER</th>
                  <th>REGISTRATION DATE</th>
                  <th>STATUS</th>
                </tr>
              </thead>

              <tbody>
                {filteredRegistrations.map((notification) => {
                  const customer = getCustomerDetails(notification);

                  return (
                    <tr key={notification.id}>
                      <td>
                        <div className="cr-customer-info">
                          <div className="cr-avatar">
                            {getInitials(customer.name) || "CU"}
                          </div>
                          <div>
                            <strong>{customer.name}</strong>
                            <span>Customer ID: #{notification.id}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="cr-contact">
                          <Mail size={15} />
                          <span>{customer.email || "Not provided"}</span>
                        </div>
                      </td>

                      <td>
                        <div className="cr-contact">
                          <Phone size={15} />
                          <span>{customer.phone || "Not provided"}</span>
                        </div>
                      </td>

                      <td>
                        <div className="cr-date">
                          <CalendarDays size={15} />
                          <span>{formatDate(notification.created_at)}</span>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`cr-status ${
                            Number(notification.is_read) === 1
                              ? "cr-status-reviewed"
                              : "cr-status-new"
                          }`}
                        >
                          <span />
                          {Number(notification.is_read) === 1
                            ? "Reviewed"
                            : "New"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="cr-footer-note">
        <Clock size={14} />
        Registration dates are based on when the Admin system received each
        registration notification.
      </p>
    </div>
  );
};

export default CustomerRegistrations;