import { useEffect, useState } from "react";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Bike,
  ShieldCheck,
  CheckCircle2,
  CalendarDays,
  Pencil,
  LogOut,
  X,
  Save,
  Lock,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import "./DeliveryProfile.css";

const defaultProfile = {
  name: "Rahul Kumar",
  email: "rahul.kumar@shopallgoods.com",
  phone: "+91 98765 43210",
  location: "Hyderabad, Telangana",
};

function DeliveryProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(defaultProfile);
  const [formData, setFormData] = useState(defaultProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    const savedProfile = localStorage.getItem(
      "deliveryPartnerProfile"
    );

    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);

        setProfile(parsedProfile);
        setFormData(parsedProfile);
      } catch {
        localStorage.removeItem("deliveryPartnerProfile");
      }
    }
  }, []);

  const getInitials = (name) => {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  };

  const startEditing = () => {
    setFormData(profile);
    setIsEditing(true);
    setShowSaved(false);
  };

  const cancelEditing = () => {
    setFormData(profile);
    setIsEditing(false);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const saveProfile = (event) => {
    event.preventDefault();

    const updatedProfile = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      location: formData.location.trim(),
    };

    if (
      !updatedProfile.name ||
      !updatedProfile.email ||
      !updatedProfile.phone ||
      !updatedProfile.location
    ) {
      return;
    }

    localStorage.setItem(
      "deliveryPartnerProfile",
      JSON.stringify(updatedProfile)
    );

    setProfile(updatedProfile);
    setFormData(updatedProfile);
    setIsEditing(false);
    setShowSaved(true);

    setTimeout(() => {
      setShowSaved(false);
    }, 2500);
  };

  const logout = () => {
    navigate("/delivery/login");
  };

  return (
    <div className="delivery-profile-page">
      <div className="delivery-profile-heading">
        <div>
          <span className="delivery-profile-eyebrow">
            ACCOUNT SETTINGS
          </span>

          <h1>My Profile</h1>

          <p>
            Manage your delivery partner information and account.
          </p>
        </div>

        <div className="delivery-profile-status">
          <span></span>
          Online
        </div>
      </div>

      {showSaved && (
        <div className="delivery-profile-success">
          <CheckCircle2 size={17} />
          Profile updated successfully
        </div>
      )}

      <div className="delivery-profile-layout">
        <section className="delivery-profile-card delivery-profile-main">
          <div className="delivery-profile-cover">
            <div className="delivery-profile-cover-pattern"></div>
          </div>

          <div className="delivery-profile-identity">
            <div className="delivery-profile-avatar">
              {getInitials(profile.name)}
            </div>

            <div className="delivery-profile-name">
              <h2>{profile.name}</h2>

              <div className="delivery-profile-role">
                <Bike size={15} />
                Delivery Partner
              </div>

              <div className="delivery-profile-verified">
                <CheckCircle2 size={14} />
                Verified Account
              </div>
            </div>

            {!isEditing && (
              <button
                type="button"
                className="delivery-profile-edit"
                onClick={startEditing}
              >
                <Pencil size={15} />
                Edit Profile
              </button>
            )}
          </div>

          {isEditing ? (
            <form
              className="delivery-profile-edit-form"
              onSubmit={saveProfile}
            >
              <div className="delivery-profile-edit-heading">
                <div>
                  <span>EDIT PROFILE</span>

                  <h3>Update Your Information</h3>

                  <p>
                    Update your personal contact information
                    below.
                  </p>
                </div>

                <button
                  type="button"
                  className="delivery-profile-cancel-icon"
                  onClick={cancelEditing}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="delivery-profile-form-grid">
                <div className="delivery-profile-field">
                  <label htmlFor="name">
                    Full Name
                  </label>

                  <div className="delivery-profile-input">
                    <User size={17} />

                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div className="delivery-profile-field">
                  <label htmlFor="email">
                    Email Address
                  </label>

                  <div className="delivery-profile-input">
                    <Mail size={17} />

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="delivery-profile-field">
                  <label htmlFor="phone">
                    Phone Number
                  </label>

                  <div className="delivery-profile-input">
                    <Phone size={17} />

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <div className="delivery-profile-field">
                  <label htmlFor="location">
                    Base Location
                  </label>

                  <div className="delivery-profile-input">
                    <MapPin size={17} />

                    <input
                      id="location"
                      name="location"
                      type="text"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Enter your base location"
                    />
                  </div>
                </div>
              </div>

              <div className="delivery-profile-form-actions">
                <button
                  type="button"
                  className="delivery-profile-cancel"
                  onClick={cancelEditing}
                >
                  <X size={16} />
                  Cancel
                </button>

                <button
                  type="submit"
                  className="delivery-profile-save"
                >
                  <Save size={16} />
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="delivery-profile-divider"></div>

              <div className="delivery-profile-section">
                <div className="delivery-profile-section-heading">
                  <div>
                    <span>PERSONAL INFORMATION</span>

                    <h3>Contact Details</h3>
                  </div>
                </div>

                <div className="delivery-profile-info-grid">
                  <div className="delivery-profile-info-item">
                    <div className="delivery-profile-info-icon blue">
                      <User size={18} />
                    </div>

                    <div>
                      <span>FULL NAME</span>
                      <strong>{profile.name}</strong>
                    </div>
                  </div>

                  <div className="delivery-profile-info-item">
                    <div className="delivery-profile-info-icon purple">
                      <Mail size={18} />
                    </div>

                    <div>
                      <span>EMAIL ADDRESS</span>
                      <strong>{profile.email}</strong>
                    </div>
                  </div>

                  <div className="delivery-profile-info-item">
                    <div className="delivery-profile-info-icon mint">
                      <Phone size={18} />
                    </div>

                    <div>
                      <span>PHONE NUMBER</span>
                      <strong>{profile.phone}</strong>
                    </div>
                  </div>

                  <div className="delivery-profile-info-item">
                    <div className="delivery-profile-info-icon orange">
                      <MapPin size={18} />
                    </div>

                    <div>
                      <span>BASE LOCATION</span>
                      <strong>{profile.location}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="delivery-profile-divider"></div>

              <div className="delivery-profile-section">
                <div className="delivery-profile-section-heading">
                  <div>
                    <span>DELIVERY INFORMATION</span>

                    <h3>Partner Details</h3>
                  </div>
                </div>

                <div className="delivery-profile-info-grid">
                  <div className="delivery-profile-info-item">
                    <div className="delivery-profile-info-icon blue">
                      <Bike size={18} />
                    </div>

                    <div>
                      <span>PARTNER ID</span>
                      <strong>DLV-00428</strong>
                    </div>
                  </div>

                  <div className="delivery-profile-info-item">
                    <div className="delivery-profile-info-icon purple">
                      <CalendarDays size={18} />
                    </div>

                    <div>
                      <span>JOINED DATE</span>
                      <strong>15 March 2025</strong>
                    </div>
                  </div>

                  <div className="delivery-profile-info-item">
                    <div className="delivery-profile-info-icon mint">
                      <CheckCircle2 size={18} />
                    </div>

                    <div>
                      <span>DELIVERIES COMPLETED</span>
                      <strong>342 Deliveries</strong>
                    </div>
                  </div>

                  <div className="delivery-profile-info-item">
                    <div className="delivery-profile-info-icon orange">
                      <ShieldCheck size={18} />
                    </div>

                    <div>
                      <span>ACCOUNT STATUS</span>

                      <strong className="profile-active">
                        Active
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>

        <aside className="delivery-profile-side">
          <div className="delivery-profile-card delivery-profile-performance">
            <div className="profile-side-heading">
              <div className="profile-side-icon">
                <CheckCircle2 size={20} />
              </div>

              <div>
                <span>DELIVERY PERFORMANCE</span>
                <h3>Your Activity</h3>
              </div>
            </div>

            <div className="profile-performance-stat">
              <div>
                <span>Completed Deliveries</span>
                <strong>342</strong>
              </div>

              <div className="profile-performance-bar">
                <div
                  className="profile-performance-fill"
                  style={{ width: "94%" }}
                ></div>
              </div>
            </div>

            <div className="profile-performance-stat">
              <div>
                <span>Current Status</span>

                <strong className="online-text">
                  Online
                </strong>
              </div>
            </div>

            <div className="profile-performance-stat">
              <div>
                <span>Total Earnings</span>
                <strong>₹68,400</strong>
              </div>
            </div>
          </div>

          <div className="delivery-profile-card delivery-profile-security">
            <div className="profile-side-heading">
              <div className="profile-side-icon purple">
                <ShieldCheck size={20} />
              </div>

              <div>
                <span>ACCOUNT SECURITY</span>
                <h3>Secure Access</h3>
              </div>
            </div>

            <p>
              Your delivery partner account is protected
              with secure login credentials.
            </p>

            <div className="profile-security-status">
              <CheckCircle2 size={17} />
              <span>Account security is active</span>
            </div>

            <div className="profile-security-note">
              <Lock size={14} />
              Personal account information is private.
            </div>
          </div>

          <div className="delivery-profile-card delivery-profile-logout-card">
            <div>
              <span>ACCOUNT ACTION</span>

              <h3>Sign out of Delivery Portal</h3>

              <p>
                You can log back in anytime using your
                delivery partner credentials.
              </p>
            </div>

            <button
              type="button"
              onClick={logout}
              className="delivery-profile-logout"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default DeliveryProfile;