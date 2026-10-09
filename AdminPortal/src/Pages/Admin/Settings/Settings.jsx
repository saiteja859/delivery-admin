import { useState } from "react";

import {
  User,
  Store,
  Bell,
  ShieldCheck,
  Palette,
  Save,
  Mail,
  Phone,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  Check,
  Smartphone,
  PackageCheck,
  MessageSquare,
} from "lucide-react";

import "./Settings.css";


function Settings() {

  const [activeSection, setActiveSection] = useState("profile");

  const [showPassword, setShowPassword] = useState(false);

  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    name: "Admin",
    email: "admin@shopallgoods.com",
    phone: "+91 98765 43210",
    role: "Administrator",
  });

  const [store, setStore] = useState({
    name: "Shop All Goods",
    email: "support@shopallgoods.com",
    phone: "+91 98765 43210",
    address: "Visakhapatnam, Andhra Pradesh",
    currency: "Indian Rupee (₹)",
  });

  const [notifications, setNotifications] = useState({
    orders: true,
    deliveries: true,
    reviews: true,
    customers: false,
    reports: true,
  });

  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    twoFactor: false,
  });


  const handleSave = () => {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };


  const updateProfile = (field, value) => {
    setProfile((previous) => ({
      ...previous,
      [field]: value,
    }));
  };


  const updateStore = (field, value) => {
    setStore((previous) => ({
      ...previous,
      [field]: value,
    }));
  };


  const updateSecurity = (field, value) => {
    setSecurity((previous) => ({
      ...previous,
      [field]: value,
    }));
  };


  const toggleNotification = (field) => {
    setNotifications((previous) => ({
      ...previous,
      [field]: !previous[field],
    }));
  };


  const sections = [
    {
      id: "profile",
      label: "Admin Profile",
      description: "Your account information",
      icon: User,
    },
    {
      id: "store",
      label: "Store Information",
      description: "Manage store details",
      icon: Store,
    },
    {
      id: "notifications",
      label: "Notifications",
      description: "Control your alerts",
      icon: Bell,
    },
    {
      id: "security",
      label: "Security",
      description: "Password and protection",
      icon: ShieldCheck,
    },
    {
      id: "appearance",
      label: "Appearance",
      description: "Customize your workspace",
      icon: Palette,
    },
  ];


  return (
    <div className="settings-page">

      <div className="settings-header">

        <div>

          <div className="settings-eyebrow">
            <ShieldCheck size={15} />
            <span>ADMIN CONFIGURATION</span>
          </div>

          <h2>Settings</h2>

          <p>
            Manage your account, store preferences and
            admin workspace.
          </p>

        </div>


        <button
          className="settings-save-button"
          onClick={handleSave}
        >

          {saved ? (
            <>
              <Check size={17} />
              Saved
            </>
          ) : (
            <>
              <Save size={17} />
              Save Changes
            </>
          )}

        </button>

      </div>


      <div className="settings-layout">

        <aside className="settings-menu">

          <div className="settings-menu-title">
            SETTINGS
          </div>

          {sections.map((section) => {

            const Icon = section.icon;

            return (
              <button
                key={section.id}
                className={`settings-menu-item ${
                  activeSection === section.id
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  setActiveSection(section.id)
                }
              >

                <span className="settings-menu-icon">
                  <Icon size={17} />
                </span>

                <span className="settings-menu-text">

                  <strong>
                    {section.label}
                  </strong>

                  <small>
                    {section.description}
                  </small>

                </span>

              </button>
            );

          })}

          <div className="settings-security-note">

            <ShieldCheck size={18} />

            <div>

              <strong>Secure Workspace</strong>

              <span>
                Your admin settings are protected.
              </span>

            </div>

          </div>

        </aside>


        <main className="settings-content">


          {activeSection === "profile" && (

            <section className="settings-card">

              <div className="settings-card-header">

                <div>

                  <span>ACCOUNT</span>

                  <h3>Admin Profile</h3>

                  <p>
                    Update your administrator account
                    information.
                  </p>

                </div>


                <div className="profile-avatar-large">
                  A
                </div>

              </div>


              <div className="settings-form-grid">

                <div className="settings-field">

                  <label>Full Name</label>

                  <div className="settings-input-wrap">

                    <User size={16} />

                    <input
                      value={profile.name}
                      onChange={(event) =>
                        updateProfile(
                          "name",
                          event.target.value
                        )
                      }
                    />

                  </div>

                </div>


                <div className="settings-field">

                  <label>Role</label>

                  <div className="settings-input-wrap">

                    <ShieldCheck size={16} />

                    <input
                      value={profile.role}
                      readOnly
                    />

                  </div>

                </div>


                <div className="settings-field">

                  <label>Email Address</label>

                  <div className="settings-input-wrap">

                    <Mail size={16} />

                    <input
                      type="email"
                      value={profile.email}
                      onChange={(event) =>
                        updateProfile(
                          "email",
                          event.target.value
                        )
                      }
                    />

                  </div>

                </div>


                <div className="settings-field">

                  <label>Phone Number</label>

                  <div className="settings-input-wrap">

                    <Phone size={16} />

                    <input
                      value={profile.phone}
                      onChange={(event) =>
                        updateProfile(
                          "phone",
                          event.target.value
                        )
                      }
                    />

                  </div>

                </div>

              </div>

            </section>

          )}


          {activeSection === "store" && (

            <section className="settings-card">

              <div className="settings-card-header">

                <div>

                  <span>BUSINESS</span>

                  <h3>Store Information</h3>

                  <p>
                    Manage the basic information displayed
                    across your store.
                  </p>

                </div>


                <div className="store-logo">
                  S
                </div>

              </div>


              <div className="settings-form-grid">

                <div className="settings-field full">

                  <label>Store Name</label>

                  <div className="settings-input-wrap">

                    <Store size={16} />

                    <input
                      value={store.name}
                      onChange={(event) =>
                        updateStore(
                          "name",
                          event.target.value
                        )
                      }
                    />

                  </div>

                </div>


                <div className="settings-field">

                  <label>Store Email</label>

                  <div className="settings-input-wrap">

                    <Mail size={16} />

                    <input
                      type="email"
                      value={store.email}
                      onChange={(event) =>
                        updateStore(
                          "email",
                          event.target.value
                        )
                      }
                    />

                  </div>

                </div>


                <div className="settings-field">

                  <label>Store Phone</label>

                  <div className="settings-input-wrap">

                    <Phone size={16} />

                    <input
                      value={store.phone}
                      onChange={(event) =>
                        updateStore(
                          "phone",
                          event.target.value
                        )
                      }
                    />

                  </div>

                </div>


                <div className="settings-field full">

                  <label>Store Address</label>

                  <div className="settings-input-wrap">

                    <MapPin size={16} />

                    <input
                      value={store.address}
                      onChange={(event) =>
                        updateStore(
                          "address",
                          event.target.value
                        )
                      }
                    />

                  </div>

                </div>


                <div className="settings-field">

                  <label>Currency</label>

                  <div className="settings-input-wrap">

                    <IndianRupeeIcon />

                    <select
                      value={store.currency}
                      onChange={(event) =>
                        updateStore(
                          "currency",
                          event.target.value
                        )
                      }
                    >

                      <option>
                        Indian Rupee (₹)
                      </option>

                      <option>
                        US Dollar ($)
                      </option>

                      <option>
                        Euro (€)
                      </option>

                    </select>

                  </div>

                </div>

              </div>

            </section>

          )}


          {activeSection === "notifications" && (

            <section className="settings-card">

              <div className="settings-card-header">

                <div>

                  <span>PREFERENCES</span>

                  <h3>Notifications</h3>

                  <p>
                    Choose which updates you want to receive.
                  </p>

                </div>

                <div className="notification-header-icon">
                  <Bell size={22} />
                </div>

              </div>


              <div className="notification-list">

                <NotificationItem
                  icon={PackageCheck}
                  title="New Orders"
                  description="Get notified whenever a new order is placed."
                  enabled={notifications.orders}
                  onToggle={() =>
                    toggleNotification("orders")
                  }
                />

                <NotificationItem
                  icon={Smartphone}
                  title="Delivery Updates"
                  description="Receive alerts about delivery status changes."
                  enabled={notifications.deliveries}
                  onToggle={() =>
                    toggleNotification("deliveries")
                  }
                />

                <NotificationItem
                  icon={MessageSquare}
                  title="Customer Reviews"
                  description="Get notified when customers submit reviews."
                  enabled={notifications.reviews}
                  onToggle={() =>
                    toggleNotification("reviews")
                  }
                />

                <NotificationItem
                  icon={User}
                  title="Customer Activity"
                  description="Receive updates about important customer activity."
                  enabled={notifications.customers}
                  onToggle={() =>
                    toggleNotification("customers")
                  }
                />

                <NotificationItem
                  icon={BarChartIcon}
                  title="Weekly Reports"
                  description="Receive a summary of your store performance."
                  enabled={notifications.reports}
                  onToggle={() =>
                    toggleNotification("reports")
                  }
                />

              </div>

            </section>

          )}


          {activeSection === "security" && (

            <section className="settings-card">

              <div className="settings-card-header">

                <div>

                  <span>PROTECTION</span>

                  <h3>Security</h3>

                  <p>
                    Keep your administrator account secure.
                  </p>

                </div>

                <div className="security-header-icon">
                  <Lock size={21} />
                </div>

              </div>


              <div className="security-section">

                <div className="security-section-title">

                  <div>

                    <h4>Change Password</h4>

                    <p>
                      Use a strong password that you
                      don't use elsewhere.
                    </p>

                  </div>

                </div>


                <div className="settings-form-grid">

                  <div className="settings-field full">

                    <label>Current Password</label>

                    <div className="settings-input-wrap">

                      <Lock size={16} />

                      <input
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        value={security.currentPassword}
                        onChange={(event) =>
                          updateSecurity(
                            "currentPassword",
                            event.target.value
                          )
                        }
                        placeholder="Enter current password"
                      />

                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() =>
                          setShowPassword(
                            !showPassword
                          )
                        }
                      >

                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}

                      </button>

                    </div>

                  </div>


                  <div className="settings-field">

                    <label>New Password</label>

                    <div className="settings-input-wrap">

                      <Lock size={16} />

                      <input
                        type="password"
                        value={security.newPassword}
                        onChange={(event) =>
                          updateSecurity(
                            "newPassword",
                            event.target.value
                          )
                        }
                        placeholder="New password"
                      />

                    </div>

                  </div>


                  <div className="settings-field">

                    <label>Confirm Password</label>

                    <div className="settings-input-wrap">

                      <Lock size={16} />

                      <input
                        type="password"
                        value={security.confirmPassword}
                        onChange={(event) =>
                          updateSecurity(
                            "confirmPassword",
                            event.target.value
                          )
                        }
                        placeholder="Confirm password"
                      />

                    </div>

                  </div>

                </div>

              </div>


              <div className="security-divider"></div>


              <div className="two-factor-row">

                <div className="two-factor-icon">
                  <ShieldCheck size={20} />
                </div>

                <div>

                  <strong>
                    Two-Factor Authentication
                  </strong>

                  <p>
                    Add an extra layer of protection
                    to your admin account.
                  </p>

                </div>


                <button
                  type="button"
                  className={`settings-toggle ${
                    security.twoFactor
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    updateSecurity(
                      "twoFactor",
                      !security.twoFactor
                    )
                  }
                >

                  <span></span>

                </button>

              </div>

            </section>

          )}


          {activeSection === "appearance" && (

            <section className="settings-card">

              <div className="settings-card-header">

                <div>

                  <span>WORKSPACE</span>

                  <h3>Appearance</h3>

                  <p>
                    Customize the look and feel of
                    your admin workspace.
                  </p>

                </div>

                <div className="appearance-header-icon">
                  <Palette size={22} />
                </div>

              </div>


              <div className="appearance-section">

                <h4>Theme</h4>

                <p>
                  Choose how the admin portal should
                  appear.
                </p>


                <div className="theme-options">

                  <div className="theme-option selected">

                    <div className="theme-preview light-preview">

                      <div className="preview-sidebar"></div>

                      <div className="preview-content">

                        <span></span>
                        <span></span>
                        <span></span>

                      </div>

                    </div>

                    <div className="theme-option-label">

                      <strong>Light</strong>

                      <span>
                        Recommended
                      </span>

                    </div>

                    <Check size={16} />

                  </div>


                  <div className="theme-option">

                    <div className="theme-preview dark-preview">

                      <div className="preview-sidebar"></div>

                      <div className="preview-content">

                        <span></span>
                        <span></span>
                        <span></span>

                      </div>

                    </div>

                    <div className="theme-option-label">

                      <strong>Dark</strong>

                      <span>
                        Coming soon
                      </span>

                    </div>

                  </div>

                </div>

              </div>


              <div className="appearance-divider"></div>


              <div className="brand-preview">

                <div>

                  <h4>Brand Preview</h4>

                  <p>
                    Your current Shop All Goods
                    visual identity.
                  </p>

                </div>


                <div className="brand-gradient-preview">

                  <div className="brand-preview-mark">
                    S
                  </div>

                  <div>

                    <strong>
                      Shop All Goods
                    </strong>

                    <span>
                      Admin Portal
                    </span>

                  </div>

                </div>

              </div>

            </section>

          )}

        </main>

      </div>


      {saved && (

        <div className="settings-toast">

          <div>
            <Check size={16} />
          </div>

          <span>
            Settings saved successfully
          </span>

        </div>

      )}

    </div>
  );
}


function NotificationItem({
  icon: Icon,
  title,
  description,
  enabled,
  onToggle,
}) {

  return (
    <div className="notification-item">

      <div className="notification-icon">
        <Icon size={18} />
      </div>

      <div className="notification-info">

        <strong>{title}</strong>

        <p>{description}</p>

      </div>

      <button
        type="button"
        className={`settings-toggle ${
          enabled ? "active" : ""
        }`}
        onClick={onToggle}
      >

        <span></span>

      </button>

    </div>
  );
}


function IndianRupeeIcon() {
  return (
    <span className="rupee-icon">
      ₹
    </span>
  );
}


function BarChartIcon() {
  return (
    <span className="bar-chart-icon">
      ▥
    </span>
  );
}


export default Settings;