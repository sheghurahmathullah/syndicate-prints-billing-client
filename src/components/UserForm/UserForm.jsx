import { useState, useEffect } from "react";
import { addUser, updateUser } from "../../Service/UserService.js";
import toast from "react-hot-toast";
import "./UserForm.css";

const UserForm = ({ setUsers, selectedUser, onUpdateUser, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    role: "ROLE_USER"
  });
  const [showPassword, setShowPassword] = useState(false);

  const onChangeHandler = (e) => {
    const value = e.target.value;
    const name = e.target.name;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleSelect = (roleValue) => {
    setData((prev) => ({ ...prev, role: roleValue }));
  };

  useEffect(() => {
    if (selectedUser && selectedUser.userId) {
      setData({
        name: selectedUser.name || "",
        email: selectedUser.email || "",
        password: "",
        role: selectedUser.role || "ROLE_USER",
        userId: selectedUser.userId
      });
    } else if (!selectedUser) {
      setData({ name: "", email: "", password: "", role: "ROLE_USER" });
    }
  }, [selectedUser]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (data.userId) {
        const response = await updateUser(data.userId, data);
        const updatedUser =
          response && response.data && response.data.userId
            ? response.data
            : { ...data };
        onUpdateUser && onUpdateUser(updatedUser);
        toast.success("User updated successfully");
      } else {
        const response = await addUser(data);
        setUsers((prevUsers) => [...prevUsers, response.data]);
        toast.success("User created successfully");
      }
      setData({
        name: "",
        email: "",
        password: "",
        role: "ROLE_USER"
      });
      if (onSuccess) {
        onSuccess();
      }
    } catch (e) {
      console.error(e);
      toast.error("Error saving user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-form-wrapper fade-in">
      <div className="user-form-card">
        <form onSubmit={onSubmitHandler} className="user-form-content">
          <div className="form-section-header mb-4">
            <div className="form-header-badge">
              <i className="bi bi-person-lines-fill"></i>
            </div>
            <div>
              <h5 className="form-section-title mb-0">
                {data.userId ? "Update User Profile" : "Account Information"}
              </h5>
              <p className="form-section-subtitle mb-0">
                Provide user credentials, contact details, and assign system privileges
              </p>
            </div>
          </div>

          <div className="row g-3 mb-4">
            {/* User Name Field */}
            <div className="col-md-6">
              <div className="rich-form-group">
                <label htmlFor="name" className="rich-form-label">
                  FULL NAME <span className="text-danger">*</span>
                </label>
                <div className="rich-input-group">
                  <span className="rich-input-icon">
                    <i className="bi bi-person-fill"></i>
                  </span>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    className="rich-form-control"
                    placeholder="e.g. John Doe"
                    onChange={onChangeHandler}
                    value={data.name}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Email Address Field */}
            <div className="col-md-6">
              <div className="rich-form-group">
                <label htmlFor="email" className="rich-form-label">
                  EMAIL ADDRESS <span className="text-danger">*</span>
                </label>
                <div className="rich-input-group">
                  <span className="rich-input-icon">
                    <i className="bi bi-envelope-fill"></i>
                  </span>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    className="rich-form-control"
                    placeholder="e.g. john.doe@syndicate.com"
                    onChange={onChangeHandler}
                    value={data.email}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div className="col-md-12">
              <div className="rich-form-group">
                <label htmlFor="password" className="rich-form-label">
                  PASSWORD {!data.userId && <span className="text-danger">*</span>}
                </label>
                <div className="rich-input-group">
                  <span className="rich-input-icon">
                    <i className="bi bi-lock-fill"></i>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="password"
                    className="rich-form-control pe-5"
                    placeholder={
                      data.userId
                        ? "Leave blank to keep existing password"
                        : "Create a strong password"
                    }
                    onChange={onChangeHandler}
                    value={data.password}
                    required={!data.userId}
                  />
                  <button
                    type="button"
                    className="btn-password-toggle"
                    onClick={() => setShowPassword((s) => !s)}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    <i className={showPassword ? "bi bi-eye-slash-fill" : "bi bi-eye-fill"}></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Role Selection Cards */}
          <div className="mb-4">
            <label className="rich-form-label mb-2">
              ASSIGN SECURITY ROLE <span className="text-danger">*</span>
            </label>
            <div className="row g-3">
              <div className="col-md-4">
                <div
                  className={`role-select-card ${
                    data.role === "ROLE_USER" ? "selected" : ""
                  }`}
                  onClick={() => handleRoleSelect("ROLE_USER")}
                >
                  <div className="role-card-icon user-icon">
                    <i className="bi bi-person-fill"></i>
                  </div>
                  <div className="role-card-info">
                    <h6 className="role-card-title">Standard User</h6>
                    <p className="role-card-desc">Standard access to general operational features</p>
                  </div>
                  <div className="role-card-check">
                    <i className="bi bi-check-circle-fill"></i>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div
                  className={`role-select-card ${
                    data.role === "ROLE_MANAGER" ? "selected" : ""
                  }`}
                  onClick={() => handleRoleSelect("ROLE_MANAGER")}
                >
                  <div className="role-card-icon manager-icon">
                    <i className="bi bi-person-gear"></i>
                  </div>
                  <div className="role-card-info">
                    <h6 className="role-card-title">Manager</h6>
                    <p className="role-card-desc">Access to management & branch reports</p>
                  </div>
                  <div className="role-card-check">
                    <i className="bi bi-check-circle-fill"></i>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div
                  className={`role-select-card ${
                    data.role === "ROLE_ADMIN" ? "selected" : ""
                  }`}
                  onClick={() => handleRoleSelect("ROLE_ADMIN")}
                >
                  <div className="role-card-icon admin-icon">
                    <i className="bi bi-shield-fill-check"></i>
                  </div>
                  <div className="role-card-info">
                    <h6 className="role-card-title">System Admin</h6>
                    <p className="role-card-desc">Full access to system settings & user controls</p>
                  </div>
                  <div className="role-card-check">
                    <i className="bi bi-check-circle-fill"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Action Footer */}
          <div className="form-action-footer">
            <button
              type="button"
              className="btn-form-cancel"
              onClick={onCancel || onSuccess}
            >
              <i className="bi bi-x-lg me-1.5"></i> Cancel
            </button>
            <button
              type="submit"
              className="btn-form-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Processing...
                </>
              ) : (
                <>
                  <i className="bi bi-check2-circle me-1.5"></i>{" "}
                  {data.userId ? "Update User" : "Save User"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;