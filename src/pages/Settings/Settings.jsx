import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import "./Settings.css";
import AdminList from "../../components/UsersList/AdminList";
import { fetchUsers, updateUser, addUser } from "../../Service/UserService.js";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);

  // Admin Profile State
  const [adminProfile, setAdminProfile] = useState({
    name: "",
    email: "",    
    role: "",
    password: "",
  });

  // Business Info State
  const [businessInfo, setBusinessInfo] = useState({
    shopName: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    email: "",
    gstNumber: "",
    logo: null,
  });

  // Payment Configuration State
  const [paymentConfig, setPaymentConfig] = useState({
    upiId: "",
    upiName: "",
    qrCode: null,
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    accountHolderName: "",
    branch: "",
  });

  // System Preferences State
  const [systemPrefs, setSystemPrefs] = useState({
    currency: "INR",
    taxRate: "18",
    receiptFooter: "",
    enableNotifications: true,
    enableEmailReceipts: false,
    enableSMSReceipts: false,
  });

  const [users, setUsers] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  // const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadUsers() {
      try {
        setLoading(true);
        const response = await fetchUsers();
        const allUsers = Array.isArray(response?.data) ? response.data : [];
        const onlyRoleUsers = allUsers.filter(
          (u) => (u?.role ?? "") === "ROLE_ADMIN"
        );
        setUsers(onlyRoleUsers);
      } catch (error) {
        console.error(error);
        toast.error("Unable to fetch Admins");
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, []);

  const [selectedUser, setSelectedUser] = useState(null);

  const onEdit = (user) => {
    // show user in the left form for editing
    setSelectedUser(user);
    
    // Populate the form with selected user's data
    console.log("Selected user for edit:", user);

    setAdminProfile({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "",
      password: "",
    });

    // optionally scroll to top or focus
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onUpdateUser = (updated) => {
    setUsers((prev) =>
      prev.map((u) => (u.userId === updated.userId ? updated : u))
    );
    setSelectedUser(null);
    // Reset form to logged-in admin's data
    
      setAdminProfile({
        name:  "",
        email: "",
        role: "",
        password: "",
      });
  };

  const handleCancelEdit = () => {

    setSelectedUser(null);

    setAdminProfile({
        name:  "",
        email: "",
        phone:  "",
        password: "",
      });
      
  };


  // Load saved settings from localStorage
  useEffect(() => {
    const savedBusinessInfo = localStorage.getItem("businessInfo");
    const savedPaymentConfig = localStorage.getItem("paymentConfig");
    const savedSystemPrefs = localStorage.getItem("systemPrefs");

    const userDetails = JSON.parse(localStorage.getItem("userDetails"));

    if (savedBusinessInfo) {
      setBusinessInfo(JSON.parse(savedBusinessInfo));
    }
    if (savedPaymentConfig) {
      setPaymentConfig(JSON.parse(savedPaymentConfig));
    }
    if (savedSystemPrefs) {
      setSystemPrefs(JSON.parse(savedSystemPrefs));
    }

  }, []);

  // Handle Admin Profile Update
  const handleAdminProfileUpdate = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      // Check if we're editing a selected user or the logged-in admin
      if (selectedUser) {
        // Update selected user
        const updatedUserData = {
          name: adminProfile.name,
          email: adminProfile.email,
          password: adminProfile.password,
          role: selectedUser.role || "ROLE_ADMIN",
        };

        console.log(selectedUser)
    
        await updateUser(selectedUser.userId, updatedUserData);

        // Update the user in the local list
        const updatedUser = {
          ...selectedUser,
          name: adminProfile.name,
          email: adminProfile.email,
        };
        onUpdateUser(updatedUser);

        toast.success("Admin updated successfully!");
      } else {
        // Update logged-in admin's profile
        
        const newAdminData = {
          name: adminProfile.name,
          email: adminProfile.email,
          password: adminProfile.password,
          role:"ROLE_ADMIN", // Preserve the role
        };
        console.log(newAdminData);

        await addUser(newAdminData);

        onUpdateUser(newAdminData);

        toast.success("Admin Profile added successfully!");
      }

      // Clear password fields
      setAdminProfile({
        name:"",
        email:"",
        password: "",
      });

    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Business Info Update
  const handleBusinessInfoUpdate = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem("businessInfo", JSON.stringify(businessInfo));
      setLoading(false);
      toast.success("Business information updated successfully!");
    }, 1000);
  };

  // Handle Payment Config Update
  const handlePaymentConfigUpdate = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem("paymentConfig", JSON.stringify(paymentConfig));
      setLoading(false);
      toast.success("Payment configuration updated successfully!");
    }, 1000);
  };

  // Handle System Preferences Update
  const handleSystemPrefsUpdate = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem("systemPrefs", JSON.stringify(systemPrefs));
      setLoading(false);
      toast.success("System preferences updated successfully!");
    }, 1000);
  };

  // Handle Logo Upload
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBusinessInfo({ ...businessInfo, logo: reader.result });
        toast.success("Logo uploaded successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle QR Code Upload
  const handleQRCodeUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentConfig({ ...paymentConfig, qrCode: reader.result });
        toast.success("QR Code uploaded successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="settings-container">
      {/* Header */}
      <div className="settings-header">
        <div className="header-content">
          <h1>
            <i className="bi bi-gear-fill"></i>
            Settings
          </h1>
          <p>Manage your application settings and preferences</p>
        </div>
      </div>

      <div className="settings-content">
        {/* Tabs Navigation */}
        <div className="settings-tabs">
          <button
            className={`tab-btn ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <i className="bi bi-person-circle"></i>
            <span>Admin Profile</span>
          </button>
          <button
            className={`tab-btn ${activeTab === "business" ? "active" : ""}`}
            onClick={() => setActiveTab("business")}
          >
            <i className="bi bi-shop"></i>
            <span>Business Info</span>
          </button>
          <button
            className={`tab-btn ${activeTab === "payment" ? "active" : ""}`}
            onClick={() => setActiveTab("payment")}
          >
            <i className="bi bi-credit-card-2-front"></i>
            <span>Payment Config</span>
          </button>
          <button
            className={`tab-btn ${activeTab === "system" ? "active" : ""}`}
            onClick={() => setActiveTab("system")}
          >
            <i className="bi bi-sliders"></i>
            <span>System Preferences</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="settings-panel">
          {/* Admin Profile Tab */}
          {activeTab === "profile" && (
            <div className="tab-content">
              <div className="section-header">
                <h2>
                  <i className="bi bi-person-fill"></i>
                  {selectedUser ? "Edit User" : "Admin Profile Settings"}
                </h2>
                <p>
                  {selectedUser
                    ? `Editing user: ${selectedUser.name}`
                    : "Update your personal information and change password"}
                </p>
              </div>

              {selectedUser && (
                <div
                  className="alert alert-info"
                  style={{
                    padding: "12px 16px",
                    marginBottom: "20px",
                    backgroundColor: "#e7f3ff",
                    border: "1px solid #b3d9ff",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ color: "#004085" }}>
                    <i
                      className="bi bi-info-circle"
                      style={{ marginRight: "8px" }}
                    ></i>
                    You are currently editing{" "}
                    <strong>{selectedUser.name}</strong>'s profile
                  </span>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="btn btn-sm"
                    style={{
                      padding: "4px 12px",
                      backgroundColor: "#fff",
                      border: "1px solid #004085",
                      color: "#004085",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    <i
                      className="bi bi-x-circle"
                      style={{ marginRight: "4px" }}
                    ></i>
                    Cancel Edit
                  </button>
                </div>
              )}

              <form
                onSubmit={handleAdminProfileUpdate}
                className="settings-form"
              >
                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <i className="bi bi-person"></i>
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={adminProfile.name}
                      onChange={(e) =>
                        setAdminProfile({
                          ...adminProfile,
                          name: e.target.value,
                        })
                      }
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <i className="bi bi-envelope"></i>
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={adminProfile.email}
                      onChange={(e) =>
                        setAdminProfile({
                          ...adminProfile,
                          email: e.target.value,
                        })
                      }
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group" style={{ position: 'relative' }}>
                    <label>
                      <i className="bi bi-lock"></i>
                      Password
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={adminProfile.password}
                      onChange={(e) =>
                        setAdminProfile({
                          ...adminProfile,
                          password: e.target.value,
                        })
                      }
                      placeholder="******"
                      style={{ paddingRight: '40px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '48px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        fontSize: '25px',
                        color: '#555',
                      }}
                      tabIndex={-1}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <i className={showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'}></i>
                    </button>
                  </div>
                </div>

                <div className="form-row">
                  {/* <div className="form-group">
                    
                    <label>
                      <i className="bi bi-phone"></i>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={adminProfile.phone}
                      onChange={(e) =>
                        setAdminProfile({
                          ...adminProfile,
                          phone: e.target.value,
                        })
                      }
                      placeholder="Enter your phone number"
                    />
                  </div> */}
                </div>

                {/* <div className="divider">
                  <span>Change Password</span>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <i className="bi bi-lock"></i>
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={adminProfile.currentPassword}
                      onChange={(e) =>
                        setAdminProfile({
                          ...adminProfile,
                          currentPassword: e.target.value,
                        })
                      }
                      placeholder="Enter current password"
                    />
                  </div>
                </div> */}

                {/* <div className="form-row">
                  <div className="form-group">
                    <label>
                      <i className="bi bi-shield-lock"></i>
                      New Password
                    </label>
                    <input
                      type="password"
                      value={adminProfile.newPassword}
                      onChange={(e) =>
                        setAdminProfile({
                          ...adminProfile,
                          newPassword: e.target.value,
                        })
                      }
                      placeholder="Enter new password"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <i className="bi bi-shield-check"></i>
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={adminProfile.confirmPassword}
                      onChange={(e) =>
                        setAdminProfile({
                          ...adminProfile,
                          confirmPassword: e.target.value,
                        })
                      }
                      placeholder="Confirm new password"
                    />
                  </div>
                </div> */}

                <div className="form-actions mb-4">
                  <button type="submit" className="btn-save" disabled={loading}>
                    {loading ? (
                      <>
                        <i className="bi bi-arrow-repeat rotating"></i>
                        Updating...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle"></i>
                        {selectedUser ? "Update Admin" : "Create Admin Profile"}
                      </>
                    )}
                  </button>
                  {selectedUser && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="btn-cancel"
                      style={{
                        marginLeft: "10px",
                        padding: "12px 24px",
                        backgroundColor: "#6c757d",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "500",
                      }}
                    >
                      <i
                        className="bi bi-x-circle"
                        style={{ marginRight: "6px" }}
                      ></i>
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              <AdminList users={users} setUsers={setUsers} onEdit={onEdit} />
            </div>
          )}

          {/* Business Info Tab */}
          {activeTab === "business" && (
            <div className="tab-content">
              <div className="section-header">
                <h2>
                  <i className="bi bi-building"></i>
                  Business Information
                </h2>
                <p>Update your shop/business details</p>
              </div>

              <form
                onSubmit={handleBusinessInfoUpdate}
                className="settings-form"
              >
                <div className="logo-upload-section">
                  <div className="logo-preview">
                    {businessInfo.logo ? (
                      <img src={businessInfo.logo} alt="Business Logo" />
                    ) : (
                      <div className="logo-placeholder">
                        <i className="bi bi-image"></i>
                        <span>No Logo</span>
                      </div>
                    )}
                  </div>
                  <div className="logo-upload-controls">
                    <label htmlFor="logo-upload" className="btn-upload">
                      <i className="bi bi-cloud-upload"></i>
                      Upload Logo
                    </label>
                    <input
                      type="file"
                      id="logo-upload"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      style={{ display: "none" }}
                    />
                    {businessInfo.logo && (
                      <button
                        type="button"
                        className="btn-remove"
                        onClick={() =>
                          setBusinessInfo({ ...businessInfo, logo: null })
                        }
                      >
                        <i className="bi bi-trash"></i>
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <i className="bi bi-shop"></i>
                      Shop/Business Name
                    </label>
                    <input
                      type="text"
                      value={businessInfo.shopName}
                      onChange={(e) =>
                        setBusinessInfo({
                          ...businessInfo,
                          shopName: e.target.value,
                        })
                      }
                      placeholder="Enter shop name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <i className="bi bi-phone"></i>
                      Contact Number
                    </label>
                    <input
                      type="tel"
                      value={businessInfo.phone}
                      onChange={(e) =>
                        setBusinessInfo({
                          ...businessInfo,
                          phone: e.target.value,
                        })
                      }
                      placeholder="Enter contact number"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group full-width">
                    <label>
                      <i className="bi bi-geo-alt"></i>
                      Address
                    </label>
                    <textarea
                      value={businessInfo.address}
                      onChange={(e) =>
                        setBusinessInfo({
                          ...businessInfo,
                          address: e.target.value,
                        })
                      }
                      placeholder="Enter complete address"
                      rows="3"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <i className="bi bi-building"></i>
                      City
                    </label>
                    <input
                      type="text"
                      value={businessInfo.city}
                      onChange={(e) =>
                        setBusinessInfo({
                          ...businessInfo,
                          city: e.target.value,
                        })
                      }
                      placeholder="Enter city"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <i className="bi bi-map"></i>
                      State
                    </label>
                    <input
                      type="text"
                      value={businessInfo.state}
                      onChange={(e) =>
                        setBusinessInfo({
                          ...businessInfo,
                          state: e.target.value,
                        })
                      }
                      placeholder="Enter state"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <i className="bi bi-mailbox"></i>
                      Pincode
                    </label>
                    <input
                      type="text"
                      value={businessInfo.pincode}
                      onChange={(e) =>
                        setBusinessInfo({
                          ...businessInfo,
                          pincode: e.target.value,
                        })
                      }
                      placeholder="Enter pincode"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <i className="bi bi-envelope"></i>
                      Email
                    </label>
                    <input
                      type="email"
                      value={businessInfo.email}
                      onChange={(e) =>
                        setBusinessInfo({
                          ...businessInfo,
                          email: e.target.value,
                        })
                      }
                      placeholder="Enter business email"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <i className="bi bi-file-text"></i>
                      GST Number
                    </label>
                    <input
                      type="text"
                      value={businessInfo.gstNumber}
                      onChange={(e) =>
                        setBusinessInfo({
                          ...businessInfo,
                          gstNumber: e.target.value,
                        })
                      }
                      placeholder="Enter GST number (optional)"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-save" disabled={loading}>
                    {loading ? (
                      <>
                        <i className="bi bi-arrow-repeat rotating"></i>
                        Updating...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle"></i>
                        Update Business Info
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Payment Configuration Tab */}
          {activeTab === "payment" && (
            <div className="tab-content">
              <div className="section-header">
                <h2>
                  <i className="bi bi-wallet2"></i>
                  Payment Configuration
                </h2>
                <p>Configure your payment methods and bank details</p>
              </div>

              <form
                onSubmit={handlePaymentConfigUpdate}
                className="settings-form"
              >
                <div className="payment-section">
                  <h3>
                    <i className="bi bi-phone"></i>
                    UPI Configuration
                  </h3>

                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        <i className="bi bi-upc"></i>
                        UPI ID
                      </label>
                      <input
                        type="text"
                        value={paymentConfig.upiId}
                        onChange={(e) =>
                          setPaymentConfig({
                            ...paymentConfig,
                            upiId: e.target.value,
                          })
                        }
                        placeholder="yourname@upi"
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        <i className="bi bi-person"></i>
                        UPI Name
                      </label>
                      <input
                        type="text"
                        value={paymentConfig.upiName}
                        onChange={(e) =>
                          setPaymentConfig({
                            ...paymentConfig,
                            upiName: e.target.value,
                          })
                        }
                        placeholder="Enter UPI registered name"
                      />
                    </div>
                  </div>

                  <div className="qr-upload-section">
                    <div className="qr-preview">
                      {paymentConfig.qrCode ? (
                        <img src={paymentConfig.qrCode} alt="UPI QR Code" />
                      ) : (
                        <div className="qr-placeholder">
                          <i className="bi bi-qr-code"></i>
                          <span>No QR Code</span>
                        </div>
                      )}
                    </div>
                    <div className="qr-upload-controls">
                      <label htmlFor="qr-upload" className="btn-upload">
                        <i className="bi bi-cloud-upload"></i>
                        Upload QR Code
                      </label>
                      <input
                        type="file"
                        id="qr-upload"
                        accept="image/*"
                        onChange={handleQRCodeUpload}
                        style={{ display: "none" }}
                      />
                      {paymentConfig.qrCode && (
                        <button
                          type="button"
                          className="btn-remove"
                          onClick={() =>
                            setPaymentConfig({ ...paymentConfig, qrCode: null })
                          }
                        >
                          <i className="bi bi-trash"></i>
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="payment-section">
                  <h3>
                    <i className="bi bi-bank"></i>
                    Bank Details
                  </h3>

                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        <i className="bi bi-building"></i>
                        Bank Name
                      </label>
                      <input
                        type="text"
                        value={paymentConfig.bankName}
                        onChange={(e) =>
                          setPaymentConfig({
                            ...paymentConfig,
                            bankName: e.target.value,
                          })
                        }
                        placeholder="Enter bank name"
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        <i className="bi bi-person-badge"></i>
                        Account Holder Name
                      </label>
                      <input
                        type="text"
                        value={paymentConfig.accountHolderName}
                        onChange={(e) =>
                          setPaymentConfig({
                            ...paymentConfig,
                            accountHolderName: e.target.value,
                          })
                        }
                        placeholder="Enter account holder name"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        <i className="bi bi-hash"></i>
                        Account Number
                      </label>
                      <input
                        type="text"
                        value={paymentConfig.accountNumber}
                        onChange={(e) =>
                          setPaymentConfig({
                            ...paymentConfig,
                            accountNumber: e.target.value,
                          })
                        }
                        placeholder="Enter account number"
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        <i className="bi bi-code-square"></i>
                        IFSC Code
                      </label>
                      <input
                        type="text"
                        value={paymentConfig.ifscCode}
                        onChange={(e) =>
                          setPaymentConfig({
                            ...paymentConfig,
                            ifscCode: e.target.value,
                          })
                        }
                        placeholder="Enter IFSC code"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        <i className="bi bi-geo-alt"></i>
                        Branch
                      </label>
                      <input
                        type="text"
                        value={paymentConfig.branch}
                        onChange={(e) =>
                          setPaymentConfig({
                            ...paymentConfig,
                            branch: e.target.value,
                          })
                        }
                        placeholder="Enter branch name"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-save" disabled={loading}>
                    {loading ? (
                      <>
                        <i className="bi bi-arrow-repeat rotating"></i>
                        Updating...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle"></i>
                        Update Payment Config
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* System Preferences Tab */}
          {activeTab === "system" && (
            <div className="tab-content">
              <div className="section-header">
                <h2>
                  <i className="bi bi-toggles"></i>
                  System Preferences
                </h2>
                <p>Configure system settings and preferences</p>
              </div>

              <form
                onSubmit={handleSystemPrefsUpdate}
                className="settings-form"
              >
                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <i className="bi bi-currency-rupee"></i>
                      Currency
                    </label>
                    <select
                      value={systemPrefs.currency}
                      onChange={(e) =>
                        setSystemPrefs({
                          ...systemPrefs,
                          currency: e.target.value,
                        })
                      }
                    >
                      <option value="INR">INR - Indian Rupee</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>
                      <i className="bi bi-percent"></i>
                      Default Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      value={systemPrefs.taxRate}
                      onChange={(e) =>
                        setSystemPrefs({
                          ...systemPrefs,
                          taxRate: e.target.value,
                        })
                      }
                      placeholder="Enter tax rate"
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group full-width">
                    <label>
                      <i className="bi bi-card-text"></i>
                      Receipt Footer Text
                    </label>
                    <textarea
                      value={systemPrefs.receiptFooter}
                      onChange={(e) =>
                        setSystemPrefs({
                          ...systemPrefs,
                          receiptFooter: e.target.value,
                        })
                      }
                      placeholder="Enter text to display at the bottom of receipts"
                      rows="3"
                    />
                  </div>
                </div>

                <div className="divider">
                  <span>Notification Settings</span>
                </div>

                <div className="toggle-group">
                  <div className="toggle-item">
                    <div className="toggle-info">
                      <label>
                        <i className="bi bi-bell"></i>
                        Enable Notifications
                      </label>
                      <span>Receive system notifications</span>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={systemPrefs.enableNotifications}
                        onChange={(e) =>
                          setSystemPrefs({
                            ...systemPrefs,
                            enableNotifications: e.target.checked,
                          })
                        }
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="toggle-item">
                    <div className="toggle-info">
                      <label>
                        <i className="bi bi-envelope"></i>
                        Email Receipts
                      </label>
                      <span>Send receipts via email to customers</span>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={systemPrefs.enableEmailReceipts}
                        onChange={(e) =>
                          setSystemPrefs({
                            ...systemPrefs,
                            enableEmailReceipts: e.target.checked,
                          })
                        }
                      />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="toggle-item">
                    <div className="toggle-info">
                      <label>
                        <i className="bi bi-chat-dots"></i>
                        SMS Receipts
                      </label>
                      <span>Send receipts via SMS to customers</span>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={systemPrefs.enableSMSReceipts}
                        onChange={(e) =>
                          setSystemPrefs({
                            ...systemPrefs,
                            enableSMSReceipts: e.target.checked,
                          })
                        }
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-save" disabled={loading}>
                    {loading ? (
                      <>
                        <i className="bi bi-arrow-repeat rotating"></i>
                        Updating...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle"></i>
                        Update Preferences
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
