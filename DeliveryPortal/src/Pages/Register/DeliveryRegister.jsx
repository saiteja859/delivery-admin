import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Truck,
  User,
  Mail,
  Phone,
  Lock,
  CreditCard,
  MapPin,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  LoaderCircle,
  Search,
  Clock3,
  CheckCircle2,
  XCircle,
  RotateCcw,
  FileText,
} from "lucide-react";

import "./DeliveryRegister.css";

const API_BASE_URL = "http://localhost:5001/api";

function DeliveryRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    licenseNumber: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] =
    useState(false);

  // Application status state
  const [statusEmail, setStatusEmail] =
    useState("");

  const [application, setApplication] =
    useState(null);

  const [statusError, setStatusError] =
    useState("");

  const [isCheckingStatus, setIsCheckingStatus] =
    useState(false);

  const [showStatus, setShowStatus] =
    useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const handleStatusEmailChange = (event) => {
    setStatusEmail(event.target.value);
    setStatusError("");
  };

  const handleCheckStatus = async (event) => {
    event.preventDefault();

    const email = statusEmail.trim().toLowerCase();

    if (!email) {
      setStatusError(
        "Please enter the email address used during registration."
      );
      return;
    }

    setIsCheckingStatus(true);
    setStatusError("");
    setApplication(null);
    setShowStatus(false);

    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/registration-status?email=${encodeURIComponent(
          email
        )}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setStatusError(
          data.message ||
            "Unable to find your application."
        );

        return;
      }

      setApplication(data.application);
      setShowStatus(true);
    } catch (error) {
      console.error(
        "Delivery application status error:",
        error
      );

      setStatusError(
        "Unable to connect to the Delivery Portal. Please try again."
      );
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleReapply = () => {
    if (!application) {
      return;
    }

    setFormData({
      fullName: application.fullName || "",
      email: application.email || "",
      phone: "",
      password: "",
      confirmPassword: "",
      licenseNumber: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
    });

    setApplication(null);
    setShowStatus(false);
    setStatusError("");
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 8) {
      setError(
        "Password must be at least 8 characters long."
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName:
              formData.fullName.trim(),

            email:
              formData.email.trim(),

            phone:
              formData.phone.trim(),

            password:
              formData.password,

            licenseNumber:
              formData.licenseNumber.trim() ||
              null,

            address:
              formData.address.trim(),

            city:
              formData.city.trim(),

            state:
              formData.state.trim(),

            pincode:
              formData.pincode.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(
          data.message ||
            "Registration failed. Please try again."
        );

        return;
      }

      /*
       * Keep the submitted email available so
       * the success screen can display it.
       */
      if (data.application?.email) {
        setFormData((previous) => ({
          ...previous,
          email: data.application.email,
        }));
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error(
        "Delivery registration error:",
        error
      );

      setError(
        "Unable to connect to the Delivery Portal. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  /*
   * ------------------------------------------------------
   * APPLICATION STATUS CARD
   * ------------------------------------------------------
   */

  const renderApplicationStatus = () => {
    if (!application) {
      return null;
    }

    const status =
      application.status?.toUpperCase();

    if (status === "PENDING") {
      return (
        <div className="delivery-register-status-card delivery-register-status-pending">
          <div className="delivery-register-status-icon">
            <Clock3 size={27} />
          </div>

          <div className="delivery-register-status-content">
            <div className="delivery-register-status-top">
              <span className="delivery-register-status-label">
                APPLICATION #{application.id}
              </span>

              <span className="delivery-register-status-badge">
                PENDING
              </span>
            </div>

            <h3>
              Your application is under review
            </h3>

            <p>
              Our administration team is currently
              reviewing your delivery partner
              application. You will be able to log in
              after your application is approved.
            </p>

            <div className="delivery-register-status-meta">
              <div>
                <span>Name</span>
                <strong>
                  {application.fullName}
                </strong>
              </div>

              <div>
                <span>Email</span>
                <strong>
                  {application.email}
                </strong>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (status === "APPROVED") {
      return (
        <div className="delivery-register-status-card delivery-register-status-approved">
          <div className="delivery-register-status-icon">
            <CheckCircle2 size={27} />
          </div>

          <div className="delivery-register-status-content">
            <div className="delivery-register-status-top">
              <span className="delivery-register-status-label">
                APPLICATION #{application.id}
              </span>

              <span className="delivery-register-status-badge">
                APPROVED
              </span>
            </div>

            <h3>
              Your application has been approved
            </h3>

            <p>
              Great news! The Shop All Goods
              administration team has approved your
              delivery partner application.
            </p>

            <div className="delivery-register-status-meta">
              <div>
                <span>Name</span>
                <strong>
                  {application.fullName}
                </strong>
              </div>

              <div>
                <span>Email</span>
                <strong>
                  {application.email}
                </strong>
              </div>
            </div>

            <button
              type="button"
              className="delivery-register-status-action delivery-register-status-login"
              onClick={() =>
                navigate("/delivery/login")
              }
            >
              <span>Go to Delivery Login</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      );
    }

    if (status === "REJECTED") {
      return (
        <div className="delivery-register-status-card delivery-register-status-rejected">
          <div className="delivery-register-status-icon">
            <XCircle size={27} />
          </div>

          <div className="delivery-register-status-content">
            <div className="delivery-register-status-top">
              <span className="delivery-register-status-label">
                APPLICATION #{application.id}
              </span>

              <span className="delivery-register-status-badge">
                REJECTED
              </span>
            </div>

            <h3>
              Your application was not approved
            </h3>

            <p>
              The administration team reviewed your
              application and did not approve it at
              this time.
            </p>

            <div className="delivery-register-rejection-box">
              <div className="delivery-register-rejection-heading">
                <FileText size={17} />

                <span>
                  Administrator's Reason
                </span>
              </div>

              <p>
                {application.rejectionReason ||
                  "No rejection reason was provided."}
              </p>
            </div>

            <div className="delivery-register-status-meta">
              <div>
                <span>Name</span>
                <strong>
                  {application.fullName}
                </strong>
              </div>

              <div>
                <span>Email</span>
                <strong>
                  {application.email}
                </strong>
              </div>
            </div>

            <button
              type="button"
              className="delivery-register-status-action delivery-register-status-reapply"
              onClick={handleReapply}
            >
              <RotateCcw size={18} />

              <span>
                Reapply as Delivery Partner
              </span>
            </button>

            <p className="delivery-register-reapply-note">
              Your previous application will remain in
              our records. Reapplying creates a new
              application for administrator review.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="delivery-register-status-card delivery-register-status-pending">
        <div className="delivery-register-status-icon">
          <FileText size={27} />
        </div>

        <div className="delivery-register-status-content">
          <div className="delivery-register-status-top">
            <span className="delivery-register-status-label">
              APPLICATION #{application.id}
            </span>

            <span className="delivery-register-status-badge">
              {status || "UNKNOWN"}
            </span>
          </div>

          <h3>
            Application status unavailable
          </h3>

          <p>
            We found your application, but its current
            status could not be displayed correctly.
          </p>
        </div>
      </div>
    );
  };

  /*
   * ------------------------------------------------------
   * SUBMITTED SUCCESS SCREEN
   * ------------------------------------------------------
   */

  if (isSubmitted) {
    return (
      <div className="delivery-register-page">
        <div className="delivery-register-decoration">
          <span></span>
          <span></span>
          <span></span>
        </div>

        <div className="delivery-register-card delivery-register-success-card">
          <div className="delivery-register-brand">
            <div className="delivery-register-logo">
              <Truck size={27} />
            </div>

            <div>
              <h1>
                Shop <span>All</span> Goods
              </h1>

              <p>DELIVERY PORTAL</p>
            </div>
          </div>

          <div className="delivery-register-success">
            <div className="delivery-register-success-icon">
              <ShieldCheck size={34} />
            </div>

            <span className="delivery-register-success-label">
              APPLICATION SUBMITTED
            </span>

            <h2>
              Your application is
              <strong> under review.</strong>
            </h2>

            <p>
              Your delivery partner registration has
              been submitted successfully. An
              administrator will review your
              application.
            </p>

            <div className="delivery-register-success-box">
              <div>
                <span>Application Status</span>

                <strong>
                  Pending Approval
                </strong>
              </div>

              <div>
                <span>Application Number</span>

                <strong>
                  #
                  {application?.id ||
                    "Submitted"}
                </strong>
              </div>

              <div>
                <span>Email</span>

                <strong>
                  {formData.email}
                </strong>
              </div>
            </div>

            <p className="delivery-register-success-note">
              You can check your application status
              using your email address below.
            </p>

            <button
              type="button"
              className="delivery-register-login-button"
              onClick={() => {
                setIsSubmitted(false);
                setStatusEmail(
                  formData.email
                );
                setShowStatus(false);
                setApplication(null);
              }}
            >
              <Search size={18} />

              <span>
                Check Application Status
              </span>
            </button>

            <button
              type="button"
              className="delivery-register-secondary-button"
              onClick={() =>
                navigate("/delivery/login")
              }
            >
              <span>Back to Login</span>

              <ArrowRight size={18} />
            </button>
          </div>

          <div className="delivery-register-footer">
            <span></span>

            <p>
              Shop All Goods Delivery Network
            </p>
          </div>
        </div>
      </div>
    );
  }

  /*
   * ------------------------------------------------------
   * MAIN REGISTRATION PAGE
   * ------------------------------------------------------
   */

  return (
    <div className="delivery-register-page">
      <div className="delivery-register-decoration">
        <span></span>
        <span></span>
        <span></span>
      </div>

      <div className="delivery-register-card">
        <button
          type="button"
          className="delivery-register-back"
          onClick={() =>
            navigate("/delivery/login")
          }
        >
          <ArrowLeft size={17} />

          <span>Back to Login</span>
        </button>

        <div className="delivery-register-brand">
          <div className="delivery-register-logo">
            <Truck size={27} />
          </div>

          <div>
            <h1>
              Shop <span>All</span> Goods
            </h1>

            <p>DELIVERY PORTAL</p>
          </div>
        </div>

        <div className="delivery-register-heading">
          <span>JOIN OUR DELIVERY NETWORK</span>

          <h2>
            Become a delivery
            <br />
            <strong>
              partner with us.
            </strong>
          </h2>

          <p>
            Submit your details to join the Shop All
            Goods delivery network. Your application
            will be reviewed by our administration
            team.
          </p>
        </div>

        {/* ------------------------------------------------
            APPLICATION STATUS LOOKUP
        ------------------------------------------------- */}

        <div className="delivery-register-status-lookup">
          <div className="delivery-register-status-lookup-heading">
            <div className="delivery-register-status-lookup-icon">
              <Search size={18} />
            </div>

            <div>
              <h3>
                Already submitted an application?
              </h3>

              <p>
                Check your latest application status
                using your registered email.
              </p>
            </div>
          </div>

          <form
            className="delivery-register-status-form"
            onSubmit={handleCheckStatus}
          >
            <div className="delivery-register-status-email">
              <Mail size={17} />

              <input
                type="email"
                value={statusEmail}
                placeholder="Enter your registered email"
                onChange={
                  handleStatusEmailChange
                }
                disabled={isCheckingStatus}
              />
            </div>

            <button
              type="submit"
              className="delivery-register-status-check-button"
              disabled={isCheckingStatus}
            >
              {isCheckingStatus ? (
                <>
                  <LoaderCircle
                    size={17}
                    className="delivery-register-spinner"
                  />

                  <span>
                    Checking...
                  </span>
                </>
              ) : (
                <>
                  <Search size={17} />

                  <span>
                    Check Status
                  </span>
                </>
              )}
            </button>
          </form>

          {statusError && (
            <div className="delivery-register-status-error">
              <span>!</span>

              <p>{statusError}</p>
            </div>
          )}

          {showStatus &&
            renderApplicationStatus()}
        </div>

        <div className="delivery-register-divider">
          <span></span>

          <p>
            {showStatus
              ? "NEW APPLICATION"
              : "NEW DELIVERY PARTNER"}
          </p>

          <span></span>
        </div>

        <div className="delivery-register-heading delivery-register-form-heading">
          <span>
            {application?.status ===
            "REJECTED"
              ? "REAPPLY FOR DELIVERY PARTNER ACCESS"
              : "JOIN OUR DELIVERY NETWORK"}
          </span>

          <h2>
            {application?.status ===
            "REJECTED" ? (
              <>
                Submit a new
                <br />
                <strong>
                  application.
                </strong>
              </>
            ) : (
              <>
                Become a delivery
                <br />
                <strong>
                  partner with us.
                </strong>
              </>
            )}
          </h2>

          <p>
            {application?.status ===
            "REJECTED"
              ? "Update your details and submit a new application for administrator review."
              : "Submit your details to join the Shop All Goods delivery network. Your application will be reviewed by our administration team."}
          </p>
        </div>

        <form
          className="delivery-register-form"
          onSubmit={handleSubmit}
        >
          {/* PERSONAL INFORMATION */}

          <div className="delivery-register-section">
            <div className="delivery-register-section-heading">
              <div>
                <User size={17} />
              </div>

              <div>
                <h3>
                  Personal Information
                </h3>

                <p>
                  Tell us about yourself
                </p>
              </div>
            </div>

            <div className="delivery-register-grid">
              <div className="delivery-register-field delivery-register-field-full">
                <label>
                  Full Name
                </label>

                <div className="delivery-register-input">
                  <User size={17} />

                  <input
                    type="text"
                    name="fullName"
                    value={
                      formData.fullName
                    }
                    placeholder="Enter your full name"
                    onChange={
                      handleChange
                    }
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="delivery-register-field">
                <label>
                  Email Address
                </label>

                <div className="delivery-register-input">
                  <Mail size={17} />

                  <input
                    type="email"
                    name="email"
                    value={
                      formData.email
                    }
                    placeholder="you@example.com"
                    onChange={
                      handleChange
                    }
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="delivery-register-field">
                <label>
                  Phone Number
                </label>

                <div className="delivery-register-input">
                  <Phone size={17} />

                  <input
                    type="tel"
                    name="phone"
                    value={
                      formData.phone
                    }
                    placeholder="Enter phone number"
                    onChange={
                      handleChange
                    }
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ACCOUNT SECURITY */}

          <div className="delivery-register-section">
            <div className="delivery-register-section-heading">
              <div>
                <Lock size={17} />
              </div>

              <div>
                <h3>
                  Account Security
                </h3>

                <p>
                  Create your secure login
                  credentials
                </p>
              </div>
            </div>

            <div className="delivery-register-grid">
              <div className="delivery-register-field">
                <label>
                  Password
                </label>

                <div className="delivery-register-input">
                  <Lock size={17} />

                  <input
                    type="password"
                    name="password"
                    value={
                      formData.password
                    }
                    placeholder="Minimum 8 characters"
                    onChange={
                      handleChange
                    }
                    disabled={isLoading}
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <div className="delivery-register-field">
                <label>
                  Confirm Password
                </label>

                <div className="delivery-register-input">
                  <Lock size={17} />

                  <input
                    type="password"
                    name="confirmPassword"
                    value={
                      formData.confirmPassword
                    }
                    placeholder="Re-enter your password"
                    onChange={
                      handleChange
                    }
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* DELIVERY INFORMATION */}

          <div className="delivery-register-section">
            <div className="delivery-register-section-heading">
              <div>
                <CreditCard size={17} />
              </div>

              <div>
                <h3>
                  Delivery Information
                </h3>

                <p>
                  Provide your delivery
                  credentials
                </p>
              </div>
            </div>

            <div className="delivery-register-grid">
              <div className="delivery-register-field delivery-register-field-full">
                <label>
                  Driving License Number
                  <span>
                    Optional
                  </span>
                </label>

                <div className="delivery-register-input">
                  <CreditCard size={17} />

                  <input
                    type="text"
                    name="licenseNumber"
                    value={
                      formData.licenseNumber
                    }
                    placeholder="Enter your license number"
                    onChange={
                      handleChange
                    }
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ADDRESS INFORMATION */}

          <div className="delivery-register-section">
            <div className="delivery-register-section-heading">
              <div>
                <MapPin size={17} />
              </div>

              <div>
                <h3>
                  Address Information
                </h3>

                <p>
                  Where can we reach you?
                </p>
              </div>
            </div>

            <div className="delivery-register-grid">
              <div className="delivery-register-field delivery-register-field-full">
                <label>
                  Address
                </label>

                <div className="delivery-register-input delivery-register-textarea-wrapper">
                  <MapPin size={17} />

                  <textarea
                    name="address"
                    value={
                      formData.address
                    }
                    placeholder="Enter your complete address"
                    onChange={
                      handleChange
                    }
                    disabled={isLoading}
                    required
                    rows={3}
                  />
                </div>
              </div>

              <div className="delivery-register-field">
                <label>
                  City
                </label>

                <div className="delivery-register-input">
                  <MapPin size={17} />

                  <input
                    type="text"
                    name="city"
                    value={
                      formData.city
                    }
                    placeholder="Enter city"
                    onChange={
                      handleChange
                    }
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="delivery-register-field">
                <label>
                  State
                </label>

                <div className="delivery-register-input">
                  <MapPin size={17} />

                  <input
                    type="text"
                    name="state"
                    value={
                      formData.state
                    }
                    placeholder="Enter state"
                    onChange={
                      handleChange
                    }
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="delivery-register-field">
                <label>
                  Pincode
                </label>

                <div className="delivery-register-input">
                  <MapPin size={17} />

                  <input
                    type="text"
                    name="pincode"
                    value={
                      formData.pincode
                    }
                    placeholder="Enter pincode"
                    onChange={
                      handleChange
                    }
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="delivery-register-error">
              <span>!</span>

              <p>{error}</p>
            </div>
          )}

          <div className="delivery-register-submit-area">
            <div className="delivery-register-security-note">
              <ShieldCheck size={17} />

              <p>
                Your information is securely
                submitted for administrator
                review.
              </p>
            </div>

            <button
              type="submit"
              className="delivery-register-submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <LoaderCircle
                    size={18}
                    className="delivery-register-spinner"
                  />

                  <span>
                    Submitting Application...
                  </span>
                </>
              ) : (
                <>
                  <span>
                    {application?.status ===
                    "REJECTED"
                      ? "Submit Reapplication"
                      : "Submit Registration"}
                  </span>

                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="delivery-register-footer">
          <span></span>

          <p>
            Shop All Goods Delivery Network
          </p>
        </div>
      </div>
    </div>
  );
}

export default DeliveryRegister;