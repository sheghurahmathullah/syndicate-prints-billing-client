import "./Menubar.css";
import { assets } from "../../assets/assets.js";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AppContext } from "../../context/AppContext.jsx";

const Menubar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuthData, auth } = useContext(AppContext);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setAuthData(null, null);
    navigate("/login");
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isAdmin = auth.role === "ROLE_ADMIN";

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <div className="logo-container">
           <img src={assets.logo} alt="Logo" className="sidebar-logo" />
        </div>
        <button className="hamburger-btn" onClick={toggleSidebar}>
          <i className="bi bi-list"></i>
        </button>
      </div>

      <div className="sidebar-menu">
        <Link
          className={`sidebar-link ${isActive("/dashboard") ? "active" : ""}`}
          to="/dashboard"
          title="Dashboard"
        >
          <i className="bi bi-grid-1x2"></i>
          <span className="link-text">Dashboard</span>
        </Link>

        <Link
          className={`sidebar-link ${isActive("/explore") ? "active" : ""}`}
          to="/explore"
          title="Explore"
        >
          <i className="bi bi-compass"></i>
          <span className="link-text">Explore</span>
        </Link>

        {isAdmin && (
          <Link
            className={`sidebar-link ${isActive("/analytics") ? "active" : ""}`}
            to="/analytics"
            title="Analytics"
          >
            <i className="bi bi-graph-up"></i>
            <span className="link-text">Analytics</span>
          </Link>
        )}

        {isAdmin && (
          <>
            <div className="sidebar-heading">Manage</div>
            <Link
              className={`sidebar-link ${isActive("/branches") ? "active" : ""}`}
              to="/branches"
              title="Manage Branches"
            >
              <i className="bi bi-building"></i>
              <span className="link-text">Branch</span>
            </Link>
            <Link
              className={`sidebar-link ${isActive("/items") ? "active" : ""}`}
              to="/items"
              title="Manage Products"
            >
              <i className="bi bi-box-seam"></i>
              <span className="link-text">Products</span>
            </Link>
            <Link
              className={`sidebar-link ${isActive("/users") ? "active" : ""}`}
              to="/users"
              title="Manage Users"
            >
              <i className="bi bi-people"></i>
              <span className="link-text">Users</span>
            </Link>
            <Link
              className={`sidebar-link ${isActive("/customers") ? "active" : ""}`}
              to="/customers"
              title="Manage Customers"
            >
              <i className="bi bi-person-badge"></i>
              <span className="link-text">Customers</span>
            </Link>
            
            <div className="sidebar-heading">Machines</div>
            <Link
              className={`sidebar-link ${isActive("/machine-category") ? "active" : ""}`}
              to="/machine-category"
              title="Machine Category"
            >
              <i className="bi bi-diagram-3"></i>
              <span className="link-text">Categories</span>
            </Link>
            <Link
              className={`sidebar-link ${isActive("/machine") ? "active" : ""}`}
              to="/machine"
              title="Manage Machines"
            >
              <i className="bi bi-printer"></i>
              <span className="link-text">Machines</span>
            </Link>
          </>
        )}

        <div className="sidebar-heading">More</div>
        <Link
          className={`sidebar-link ${isActive("/orders") ? "active" : ""}`}
          to="/orders"
          title="Order History"
        >
          <i className="bi bi-clock-history"></i>
          <span className="link-text">Order History</span>
        </Link>

        {isAdmin && (
          <Link
            className={`sidebar-link ${isActive("/credits") ? "active" : ""}`}
            to="/credits"
            title="Credit Management"
          >
            <i className="bi bi-credit-card"></i>
            <span className="link-text">Credit Management</span>
          </Link>
        )}
      </div>

      <div className="sidebar-footer">
        {isAdmin && (
          <Link
            className={`sidebar-link ${isActive("/settings") ? "active" : ""}`}
            to="/settings"
            title="Settings"
          >
            <i className="bi bi-gear"></i>
            <span className="link-text">Settings</span>
          </Link>
        )}
        <div className="sidebar-link" onClick={logout} title="Logout" style={{ cursor: "pointer" }}>
          <i className="bi bi-box-arrow-right"></i>
          <span className="link-text">Logout</span>
        </div>
      </div>
    </div>
  );
};

export default Menubar;
