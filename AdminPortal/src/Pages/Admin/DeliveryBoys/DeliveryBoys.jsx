import { useEffect, useMemo, useState } from "react";
import {
  X,
  Eye,
  CheckCircle,
  XCircle,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  CalendarDays,
  AlertCircle,
  Loader2,
  ChevronDown,
  Filter,
} from "lucide-react";

import "./DeliveryBoys.css";

const API_BASE_URL = "http://localhost:5000/api";

const DeliveryBoys = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [pageError, setPageError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [selectedRegistration, setSelectedRegistration] =
    useState(null);

  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const [actionLoadingId, setActionLoadingId] =
    useState(null);

  const [statusFilter, setStatusFilter] =
    useState("ALL");

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const getToken = () => {
    return localStorage.getItem("adminToken");
  };

  /* =====================================================
     NORMALIZE BACKEND DATA
     ===================================================== */

  const normalizeRegistration = (item) => {
    const backendStatus =
      item.registration_status ??
      item.registrationStatus ??
      item.status ??
      "PENDING";

    return {
      ...item,

      id: item.id,

      full_name:
        item.full_name ??
        item.fullName ??
        item.name ??
        "",

      email: item.email ?? "",

      phone: item.phone ?? "",

      license_number:
        item.license_number ??
        item.licenseNumber ??
        "",

      address: item.address ?? "",

      city: item.city ?? "",

      state: item.state ?? "",

      pincode: item.pincode ?? "",

      registration_status:
        String(backendStatus).trim().toUpperCase(),

      rejection_reason:
        item.rejection_reason ??
        item.rejectionReason ??
        "",

      created_at:
        item.created_at ??
        item.createdAt ??
        null,

      updated_at:
        item.updated_at ??
        item.updatedAt ??
        null,
    };
  };

  /* =====================================================
     FETCH REGISTRATIONS
     ===================================================== */

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      setPageError("");

      const token = getToken();

      if (!token) {
        throw new Error(
          "Admin authentication token is missing."
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/delivery-registrations`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to load delivery applications"
        );
      }

      const rawRegistrations =
        data?.registrations ||
        data?.applications ||
        data?.data ||
        [];

      const normalizedRegistrations =
        rawRegistrations.map(
          normalizeRegistration
        );

      console.log(
        "FINAL REGISTRATIONS:",
        normalizedRegistrations
      );

      setRegistrations(normalizedRegistrations);
    } catch (error) {
      console.error(
        "Failed to fetch registrations:",
        error
      );

      setPageError(
        error.message ||
          "Failed to load delivery applications"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     STATUS HELPER
     ===================================================== */

  const getStatus = (registration) => {
    const status =
      registration?.registration_status ??
      registration?.registrationStatus ??
      registration?.status ??
      "PENDING";

    return String(status)
      .trim()
      .toUpperCase();
  };

  /* =====================================================
     FILTER
     ===================================================== */

  const filteredRegistrations = useMemo(() => {
    console.log(
      "FILTER:",
      statusFilter
    );

    console.log(
      "ALL REGISTRATIONS:",
      registrations
    );

    if (statusFilter === "ALL") {
      return registrations;
    }

    return registrations.filter(
      (registration) => {
        const status =
          getStatus(registration);

        console.log(
          "COMPARING:",
          status,
          "===",
          statusFilter
        );

        return status === statusFilter;
      }
    );
  }, [registrations, statusFilter]);

  /* =====================================================
     STATUS COUNTS
     ===================================================== */

  const statusCounts = useMemo(() => {
    const counts = {
      ALL: registrations.length,
      PENDING: 0,
      APPROVED: 0,
      REJECTED: 0,
    };

    registrations.forEach(
      (registration) => {
        const status =
          getStatus(registration);

        if (
          Object.prototype.hasOwnProperty.call(
            counts,
            status
          )
        ) {
          counts[status] += 1;
        }
      }
    );

    return counts;
  }, [registrations]);

  /* =====================================================
     HELPERS
     ===================================================== */

  const getApplicationNumber = (registration) => {
    if (!registration?.id) {
      return "—";
    }

    const ids = registrations
      .map((item) => Number(item.id))
      .filter((id) => Number.isFinite(id));

    if (ids.length === 0) {
      return "—";
    }

    const firstId = Math.min(...ids);

    return (
      Number(registration.id) -
      firstId +
      1
    );
  };

  const getInitials = (name) => {
    const cleanName =
      String(name || "").trim();

    if (!cleanName) {
      return "?";
    }

    const parts = cleanName
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length === 1) {
      return parts[0]
        .charAt(0)
        .toUpperCase();
    }

    return (
      parts[0].charAt(0) +
      parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "—";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "APPROVED":
        return "delivery-status-approved";

      case "REJECTED":
        return "delivery-status-rejected";

      default:
        return "delivery-status-pending";
    }
  };

  /* =====================================================
     VIEW MODAL
     ===================================================== */

  const handleView = (registration) => {
    setSelectedRegistration(
      normalizeRegistration(registration)
    );

    setIsRejecting(false);
    setRejectionReason("");
    setPageError("");
  };

  const closePopup = () => {
    if (actionLoadingId) {
      return;
    }

    setSelectedRegistration(null);
    setIsRejecting(false);
    setRejectionReason("");
  };

  /* =====================================================
     APPROVE
     ===================================================== */

  const handleApprove = async (
    registration
  ) => {
    if (!registration?.id) {
      return;
    }

    try {
      setActionLoadingId(registration.id);
      setPageError("");
      setSuccessMessage("");

      const token = getToken();

      if (!token) {
        throw new Error(
          "Admin authentication token is missing."
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/delivery-registrations/${registration.id}/approve`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to approve application"
        );
      }

      setRegistrations(
        (current) =>
          current.map((item) =>
            item.id === registration.id
              ? {
                  ...item,
                  registration_status:
                    "APPROVED",
                }
              : item
          )
      );

      setSuccessMessage(
        "Delivery application approved successfully."
      );

      setSelectedRegistration(null);
      setIsRejecting(false);
      setRejectionReason("");
    } catch (error) {
      console.error(
        "Approval error:",
        error
      );

      setPageError(
        error.message ||
          "Failed to approve application"
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  /* =====================================================
     REJECT
     ===================================================== */

  const openReject = () => {
    setIsRejecting(true);
    setRejectionReason("");
    setPageError("");
  };

  const cancelReject = () => {
    setIsRejecting(false);
    setRejectionReason("");
    setPageError("");
  };

  const handleReject = async () => {
    if (!selectedRegistration?.id) {
      return;
    }

    const reason =
      rejectionReason.trim();

    if (!reason) {
      setPageError(
        "Please enter a rejection reason."
      );
      return;
    }

    try {
      setActionLoadingId(
        selectedRegistration.id
      );

      setPageError("");
      setSuccessMessage("");

      const token = getToken();

      if (!token) {
        throw new Error(
          "Admin authentication token is missing."
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/delivery-registrations/${selectedRegistration.id}/reject`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rejectionReason: reason,
          }),
        }
      );

      const responseText =
        await response.text();

      let data = null;

      try {
        data = JSON.parse(
          responseText
        );
      } catch (error) {
        console.error(
          "Invalid JSON response:",
          error
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            `Reject request failed with status ${response.status}`
        );
      }

      setRegistrations(
        (current) =>
          current.map((item) =>
            item.id ===
            selectedRegistration.id
              ? {
                  ...item,
                  registration_status:
                    "REJECTED",
                  rejection_reason:
                    reason,
                }
              : item
          )
      );

      setSuccessMessage(
        "Delivery application rejected successfully."
      );

      setSelectedRegistration(null);
      setIsRejecting(false);
      setRejectionReason("");
    } catch (error) {
      console.error(
        "Rejection error:",
        error
      );

      setPageError(
        error.message ||
          "Failed to reject application"
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  /* =====================================================
     LOADING
     ===================================================== */

  if (loading) {
    return (
      <div className="delivery-page">
        <div className="delivery-loading">
          <Loader2
            size={28}
            className="delivery-spinner"
          />

          <span>
            Loading delivery applications...
          </span>
        </div>
      </div>
    );
  }

  /* =====================================================
     PAGE
     ===================================================== */

  return (
    <div className="delivery-page">

      {/* HEADER */}

      <div className="delivery-page-header">

        <div>
          <h1>
            Delivery Applications
          </h1>

          <p>
            Review and manage delivery
            partner applications.
          </p>
        </div>

        <div className="delivery-header-right">

          <div className="delivery-total">
            {registrations.length}
            {" "}
            Applications
          </div>

          {/* FILTER */}

          <div className="delivery-filter-wrapper">

            <Filter size={17} />

            <select
              value={statusFilter}
              onChange={(event) => {
                const value =
                  event.target.value;

                console.log(
                  "SELECTED FILTER:",
                  value
                );

                setStatusFilter(value);
              }}
              className="delivery-status-filter"
            >

              <option value="ALL">
                All ({statusCounts.ALL})
              </option>

              <option value="PENDING">
                Pending ({statusCounts.PENDING})
              </option>

              <option value="APPROVED">
                Approved ({statusCounts.APPROVED})
              </option>

              <option value="REJECTED">
                Rejected ({statusCounts.REJECTED})
              </option>

            </select>

            <ChevronDown
              size={16}
              className="delivery-filter-chevron"
            />

          </div>

        </div>

      </div>

      {/* ERROR */}

      {pageError && (
        <div className="delivery-alert delivery-alert-error">

          <AlertCircle size={18} />

          <span>
            {pageError}
          </span>

          <button
            type="button"
            onClick={() =>
              setPageError("")
            }
          >
            <X size={16} />
          </button>

        </div>
      )}

      {/* SUCCESS */}

      {successMessage && (
        <div className="delivery-alert delivery-alert-success">

          <CheckCircle size={18} />

          <span>
            {successMessage}
          </span>

          <button
            type="button"
            onClick={() =>
              setSuccessMessage("")
            }
          >
            <X size={16} />
          </button>

        </div>
      )}

      {/* APPLICATIONS */}

      {filteredRegistrations.length ===
      0 ? (

        <div className="delivery-empty">

          <div className="delivery-empty-icon">
            <User size={28} />
          </div>

          <h3>
            {registrations.length === 0
              ? "No applications found"
              : "No matching applications"}
          </h3>

          <p>
            {registrations.length === 0
              ? "There are currently no delivery partner applications."
              : `There are no ${statusFilter.toLowerCase()} applications.`}
          </p>

        </div>

      ) : (

        <div className="delivery-applications-list">

          {filteredRegistrations.map(
            (registration) => {

              const status =
                getStatus(
                  registration
                );

              const personName =
                registration.full_name ||
                "Unknown Applicant";

              return (
                <div
                  className="delivery-application-card"
                  key={registration.id}
                >

                  <div className="delivery-card-person">

                    <div className="delivery-card-avatar">
                      {getInitials(
                        personName
                      )}
                    </div>

                    <div className="delivery-card-person-info">

                      <h3>
                        {personName}
                      </h3>

                      <p>
                        Application #
                        {getApplicationNumber(
                          registration
                        )}
                      </p>

                    </div>

                  </div>

                  <div className="delivery-card-status">

                    <span
                      className={`delivery-status ${getStatusClass(
                        status
                      )}`}
                    >
                      {status}
                    </span>

                  </div>

                  <div className="delivery-card-date">
                    {formatDate(
                      registration.created_at
                    )}
                  </div>

                  <button
                    type="button"
                    className="delivery-view-button"
                    onClick={() =>
                      handleView(
                        registration
                      )
                    }
                  >
                    <Eye size={17} />
                    View
                  </button>

                </div>
              );
            }
          )}

        </div>
      )}

      {/* =================================================
          MODAL
          ================================================= */}

      {selectedRegistration && (

        <div
          className="delivery-modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
                event.currentTarget &&
              !actionLoadingId
            ) {
              closePopup();
            }

          }}
        >

          <div
            className="delivery-modal"
            role="dialog"
            aria-modal="true"
          >

            <div className="delivery-modal-header">

              <div>

                <span className="delivery-modal-eyebrow">

                  APPLICATION #
                  {getApplicationNumber(
                    selectedRegistration
                  )}

                </span>

                <h2>
                  Delivery Partner Application
                </h2>

              </div>

              <button
                type="button"
                className="delivery-modal-close"
                onClick={closePopup}
                disabled={Boolean(
                  actionLoadingId
                )}
              >
                <X size={20} />
              </button>

            </div>

            <div className="delivery-modal-content">

              <div className="delivery-modal-profile">

                <div className="delivery-modal-avatar">

                  {getInitials(
                    selectedRegistration.full_name
                  )}

                </div>

                <div>

                  <h3>
                    {selectedRegistration.full_name ||
                      "Unknown Applicant"}
                  </h3>

                  <p>
                    {selectedRegistration.email ||
                      "No email available"}
                  </p>

                </div>

                <span
                  className={`delivery-status ${getStatusClass(
                    getStatus(
                      selectedRegistration
                    )
                  )}`}
                >
                  {getStatus(
                    selectedRegistration
                  )}
                </span>

              </div>

              <div className="delivery-modal-section">

                <h4>
                  Personal Information
                </h4>

                <div className="delivery-details-grid">

                  <div className="delivery-detail-item">
                    <User size={18} />

                    <div>
                      <span>
                        Full Name
                      </span>

                      <strong>
                        {selectedRegistration.full_name ||
                          "—"}
                      </strong>
                    </div>
                  </div>

                  <div className="delivery-detail-item">
                    <Mail size={18} />

                    <div>
                      <span>
                        Email
                      </span>

                      <strong>
                        {selectedRegistration.email ||
                          "—"}
                      </strong>
                    </div>
                  </div>

                  <div className="delivery-detail-item">
                    <Phone size={18} />

                    <div>
                      <span>
                        Phone
                      </span>

                      <strong>
                        {selectedRegistration.phone ||
                          "—"}
                      </strong>
                    </div>
                  </div>

                  <div className="delivery-detail-item">
                    <CreditCard size={18} />

                    <div>
                      <span>
                        License Number
                      </span>

                      <strong>
                        {selectedRegistration.license_number ||
                          "—"}
                      </strong>
                    </div>
                  </div>

                  <div className="delivery-detail-item delivery-detail-wide">
                    <MapPin size={18} />

                    <div>
                      <span>
                        Address
                      </span>

                      <strong>
                        {selectedRegistration.address ||
                          "—"}
                      </strong>
                    </div>
                  </div>

                  <div className="delivery-detail-item">
                    <MapPin size={18} />

                    <div>
                      <span>
                        City
                      </span>

                      <strong>
                        {selectedRegistration.city ||
                          "—"}
                      </strong>
                    </div>
                  </div>

                  <div className="delivery-detail-item">
                    <MapPin size={18} />

                    <div>
                      <span>
                        State
                      </span>

                      <strong>
                        {selectedRegistration.state ||
                          "—"}
                      </strong>
                    </div>
                  </div>

                  <div className="delivery-detail-item">
                    <MapPin size={18} />

                    <div>
                      <span>
                        Pincode
                      </span>

                      <strong>
                        {selectedRegistration.pincode ||
                          "—"}
                      </strong>
                    </div>
                  </div>

                  <div className="delivery-detail-item">
                    <CalendarDays size={18} />

                    <div>
                      <span>
                        Applied On
                      </span>

                      <strong>
                        {formatDate(
                          selectedRegistration.created_at
                        )}
                      </strong>
                    </div>
                  </div>

                </div>

              </div>

              {getStatus(
                selectedRegistration
              ) === "REJECTED" && (

                <div className="delivery-rejection-box">

                  <div className="delivery-rejection-heading">

                    <XCircle size={19} />

                    <div>

                      <h4>
                        Rejection Reason
                      </h4>

                      <p>
                        {selectedRegistration.rejection_reason ||
                          "No rejection reason provided."}
                      </p>

                    </div>

                  </div>

                </div>
              )}

              {isRejecting && (

                <div className="delivery-rejection-box">

                  <div className="delivery-rejection-heading">

                    <XCircle size={19} />

                    <div>

                      <h4>
                        Reject Application
                      </h4>

                      <p>
                        Please provide a reason
                        for rejecting this
                        application.
                      </p>

                    </div>

                  </div>

                  <textarea
                    value={rejectionReason}
                    onChange={(event) =>
                      setRejectionReason(
                        event.target.value
                      )
                    }
                    placeholder="Enter rejection reason..."
                    maxLength={1000}
                  />

                  <div className="delivery-character-count">
                    {rejectionReason.length}/1000
                  </div>

                </div>
              )}

            </div>

            {getStatus(
              selectedRegistration
            ) === "PENDING" && (

              <div className="delivery-modal-footer">

                {!isRejecting ? (

                  <>

                    <button
                      type="button"
                      className="delivery-reject-button"
                      onClick={openReject}
                      disabled={Boolean(
                        actionLoadingId
                      )}
                    >
                      <XCircle size={18} />
                      Reject
                    </button>

                    <button
                      type="button"
                      className="delivery-approve-button"
                      onClick={() =>
                        handleApprove(
                          selectedRegistration
                        )
                      }
                      disabled={Boolean(
                        actionLoadingId
                      )}
                    >

                      {actionLoadingId ===
                      selectedRegistration.id ? (

                        <>
                          <Loader2
                            size={18}
                            className="delivery-spinner"
                          />
                          Processing...
                        </>

                      ) : (

                        <>
                          <CheckCircle size={18} />
                          Approve
                        </>

                      )}

                    </button>

                  </>

                ) : (

                  <>

                    <button
                      type="button"
                      className="delivery-cancel-button"
                      onClick={cancelReject}
                      disabled={Boolean(
                        actionLoadingId
                      )}
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      className="delivery-confirm-reject-button"
                      onClick={handleReject}
                      disabled={
                        !rejectionReason.trim() ||
                        Boolean(actionLoadingId)
                      }
                    >

                      {actionLoadingId ===
                      selectedRegistration.id ? (

                        <>
                          <Loader2
                            size={18}
                            className="delivery-spinner"
                          />
                          Rejecting...
                        </>

                      ) : (

                        <>
                          <XCircle size={18} />
                          Confirm Rejection
                        </>

                      )}

                    </button>

                  </>

                )}

              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
};

export default DeliveryBoys;