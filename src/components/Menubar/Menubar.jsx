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
  const [showLogout, setShowLogout] = useState(false);
  const [machinesOpen, setMachinesOpen] = useState(false);
  const [paperOpen, setPaperOpen] = useState(false);
  const [operationsOpen, setOperationsOpen] = useState(false);
  const [billsOpen, setBillsOpen] = useState(false);
  const [employeesOpen, setEmployeesOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [customersOpen, setCustomersOpen] = useState(false);

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

        {/* Explore hidden as requested */}

        <div
          className={`sidebar-link nav-group ${billsOpen ? "open" : ""}`}
          onClick={() => { setBillsOpen(!billsOpen); if (isCollapsed) setIsCollapsed(false); }}
          title="Bills"
          style={{ cursor: 'pointer' }}
        >
          <i className="bi bi-receipt-cutoff"></i>
          <span className="link-text">Bill</span>
          <i className={`bi bi-chevron-down nav-chevron link-text ms-auto`} style={{ fontSize: '0.75rem', minWidth: 'auto', transform: billsOpen ? 'rotate(180deg)' : 'rotate(0)' }}></i>
        </div>

        <div className={`submenu-wrapper ${billsOpen ? 'open' : ''}`}>
          <div className="submenu">
            <div className="submenu-content">
              <Link
                className={`sidebar-link submenu-link ${isActive("/bills/create") ? "active" : ""}`}
                to="/bills/create"
                title="Create Bill"
              >
                <i className="bi bi-plus-circle"></i>
                <span className="link-text">Bills</span>
              </Link>
              <Link
                className={`sidebar-link submenu-link ${isActive("/bills/today") ? "active" : ""}`}
                to="/bills/today"
                title="View Today"
              >
                <i className="bi bi-calendar-event"></i>
                <span className="link-text">View Today</span>
              </Link>
              <Link
                className={`sidebar-link submenu-link ${isActive("/bills/all") ? "active" : ""}`}
                to="/bills/all"
                title="View All Bills"
              >
                <i className="bi bi-list-check"></i>
                <span className="link-text">View All bills</span>
              </Link>
            </div>
          </div>
        </div>


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
          <Link
            className={`sidebar-link ${isActive("/credits") || isActive("/credit-management") ? "active" : ""}`}
            to="/credits"
            title="Credit Management"
          >
            <i className="bi bi-credit-card-2-front"></i>
            <span className="link-text">Credit Management</span>
          </Link>
        )}

        {isAdmin && (
          <>
            <div className="sidebar-heading">Manage</div>
            <Link
              className={`sidebar-link ${isActive("/particulars") ? "active" : ""}`}
              to="/particulars"
              title="Manage Particulars"
            >
              <i className="bi bi-list-columns-reverse"></i>
              <span className="link-text">Particulars</span>
            </Link>
            <Link
              className={`sidebar-link ${isActive("/branches") ? "active" : ""}`}
              to="/branches"
              title="Manage Branches"
            >
              <i className="bi bi-building"></i>
              <span className="link-text">Branch</span>
            </Link>
            {/* Products hidden as requested */}

            <div
              className={`sidebar-link nav-group ${employeesOpen ? "open" : ""}`}
              onClick={() => { setEmployeesOpen(!employeesOpen); if (isCollapsed) setIsCollapsed(false); }}
              title="Manage Employees"
              style={{ cursor: 'pointer' }}
            >
              <i className="bi bi-people-fill"></i>
              <span className="link-text">Manage Employees</span>
              <i className={`bi bi-chevron-down nav-chevron link-text ms-auto`} style={{ fontSize: '0.75rem', minWidth: 'auto', transform: employeesOpen ? 'rotate(180deg)' : 'rotate(0)' }}></i>
            </div>

            <div className={`submenu-wrapper ${employeesOpen ? 'open' : ''}`}>
              <div className="submenu">
                <div className="submenu-content">
                  <Link
                    className={`sidebar-link submenu-link ${isActive("/employees") ? "active" : ""}`}
                    to="/employees"
                    title="Employees"
                  >
                    <i className="bi bi-person-badge"></i>
                    <span className="link-text">Employees</span>
                  </Link>
                  <Link
                    className={`sidebar-link submenu-link ${isActive("/users") ? "active" : ""}`}
                    to="/users"
                    title="Users"
                  >
                    <i className="bi bi-person"></i>
                    <span className="link-text">Users</span>
                  </Link>
                  <Link
                    className={`sidebar-link submenu-link ${isActive("/employee-view") ? "active" : ""}`}
                    to="/employee-view"
                    title="Employee View"
                  >
                    <i className="bi bi-person-workspace"></i>
                    <span className="link-text">Employee View</span>
                  </Link>
                </div>
              </div>
            </div>
            <div
              className={`sidebar-link nav-group ${customersOpen ? "open" : ""}`}
              onClick={() => { setCustomersOpen(!customersOpen); if (isCollapsed) setIsCollapsed(false); }}
              title="Customers"
              style={{ cursor: 'pointer' }}
            >
              <i className="bi bi-person-lines-fill"></i>
              <span className="link-text">Customers</span>
              <i className={`bi bi-chevron-down nav-chevron link-text ms-auto`} style={{ fontSize: '0.75rem', minWidth: 'auto', transform: customersOpen ? 'rotate(180deg)' : 'rotate(0)' }}></i>
            </div>

            <div className={`submenu-wrapper ${customersOpen ? 'open' : ''}`}>
              <div className="submenu">
                <div className="submenu-content">
                  <Link
                    className={`sidebar-link submenu-link ${isActive("/customers") ? "active" : ""}`}
                    to="/customers"
                    title="Manage Customers"
                  >
                    <i className="bi bi-person-lines-fill"></i>
                    <span className="link-text">Manage</span>
                  </Link>
                  <Link
                    className={`sidebar-link submenu-link ${isActive("/customer-view") ? "active" : ""}`}
                    to="/customer-view"
                    title="Customer View"
                  >
                    <i className="bi bi-person-vcard"></i>
                    <span className="link-text">Customer View</span>
                  </Link>
                </div>
              </div>
            </div>

            <div
              className={`sidebar-link nav-group ${machinesOpen ? "open" : ""}`}
              onClick={() => { setMachinesOpen(!machinesOpen); if (isCollapsed) setIsCollapsed(false); }}
              title="Machines"
              style={{ cursor: 'pointer' }}
            >
              <i className="bi bi-gear-wide-connected"></i>
              <span className="link-text">Machines</span>
              <i className={`bi bi-chevron-down nav-chevron link-text ms-auto`} style={{ fontSize: '0.75rem', minWidth: 'auto', transform: machinesOpen ? 'rotate(180deg)' : 'rotate(0)' }}></i>
            </div>

            <div className={`submenu-wrapper ${machinesOpen ? 'open' : ''}`}>
              <div className="submenu">
                <div className="submenu-content">
                  <Link
                    className={`sidebar-link submenu-link ${isActive("/machine-category") ? "active" : ""}`}
                    to="/machine-category"
                    title="Machine Category"
                  >
                    <i className="bi bi-diagram-3"></i>
                    <span className="link-text">Categories</span>
                  </Link>
                  <Link
                    className={`sidebar-link submenu-link ${isActive("/machine") ? "active" : ""}`}
                    to="/machine"
                    title="Manage Machines"
                  >
                    <i className="bi bi-printer"></i>
                    <span className="link-text">Machines</span>
                  </Link>
                </div>
              </div>
            </div>

            <div
              className={`sidebar-link nav-group ${paperOpen ? "open" : ""}`}
              onClick={() => { setPaperOpen(!paperOpen); if (isCollapsed) setIsCollapsed(false); }}
              title="Paper"
              style={{ cursor: 'pointer' }}
            >
              <i className="bi bi-file-earmark-ruled"></i>
              <span className="link-text">Paper</span>
              <i className={`bi bi-chevron-down nav-chevron link-text ms-auto`} style={{ fontSize: '0.75rem', minWidth: 'auto', transform: paperOpen ? 'rotate(180deg)' : 'rotate(0)' }}></i>
            </div>

            <div className={`submenu-wrapper ${paperOpen ? 'open' : ''}`}>
              <div className="submenu">
                <div className="submenu-content">
                  <Link
                    className={`sidebar-link submenu-link ${isActive("/paper-category") ? "active" : ""}`}
                    to="/paper-category"
                    title="Paper Category"
                  >
                    <i className="bi bi-layers"></i>
                    <span className="link-text">Paper Category</span>
                  </Link>
                  <Link
                    className={`sidebar-link submenu-link ${isActive("/paper-group") ? "active" : ""}`}
                    to="/paper-group"
                    title="Paper Groups"
                  >
                    <i className="bi bi-collection"></i>
                    <span className="link-text">Paper Groups</span>
                  </Link>
                  <Link
                    className={`sidebar-link submenu-link ${isActive("/paper") ? "active" : ""}`}
                    to="/paper"
                    title="Manage Paper"
                  >
                    <i className="bi bi-file-earmark-text"></i>
                    <span className="link-text">Paper</span>
                  </Link>
                </div>
              </div>
            </div>

            <div
              className={`sidebar-link nav-group ${operationsOpen ? "open" : ""}`}
              onClick={() => { setOperationsOpen(!operationsOpen); if (isCollapsed) setIsCollapsed(false); }}
              title="Operations"
              style={{ cursor: 'pointer' }}
            >
              <i className="bi bi-gear"></i>
              <span className="link-text">Operations</span>
              <i className={`bi bi-chevron-down nav-chevron link-text ms-auto`} style={{ fontSize: '0.75rem', minWidth: 'auto', transform: operationsOpen ? 'rotate(180deg)' : 'rotate(0)' }}></i>
            </div>

            <div className={`submenu-wrapper ${operationsOpen ? 'open' : ''}`}>
              <div className="submenu">
                <div className="submenu-content">
                  <Link
                    className={`sidebar-link submenu-link ${isActive("/expense-item") ? "active" : ""}`}
                    to="/expense-item"
                    title="Expense Item"
                  >
                    <i className="bi bi-receipt"></i>
                    <span className="link-text">Expense Item</span>
                  </Link>
                  <Link
                    className={`sidebar-link submenu-link ${isActive("/daily-expenses") ? "active" : ""}`}
                    to="/daily-expenses"
                    title="Daily Expense"
                  >
                    <i className="bi bi-calendar-day"></i>
                    <span className="link-text">Daily Expense</span>
                  </Link>
                  <Link
                    className={`sidebar-link submenu-link ${isActive("/monthly-expense") ? "active" : ""}`}
                    to="/monthly-expense"
                    title="Monthly Expense"
                  >
                    <i className="bi bi-calendar-month"></i>
                    <span className="link-text">Monthly Expense</span>
                  </Link>
                </div>
              </div>
            </div>

            <div
              className={`sidebar-link nav-group ${reportsOpen ? "open" : ""}`}
              onClick={() => { setReportsOpen(!reportsOpen); if (isCollapsed) setIsCollapsed(false); }}
              title="Reports"
              style={{ cursor: 'pointer' }}
            >
              <i className="bi bi-file-bar-graph"></i>
              <span className="link-text">Reports</span>
              <i className={`bi bi-chevron-down nav-chevron link-text ms-auto`} style={{ fontSize: '0.75rem', minWidth: 'auto', transform: reportsOpen ? 'rotate(180deg)' : 'rotate(0)' }}></i>
            </div>

            <div className={`submenu-wrapper ${reportsOpen ? 'open' : ''}`}>
              <div className="submenu">
                <div className="submenu-content">
                  <Link
                    className={`sidebar-link submenu-link ${isActive("/reports/daily-expense") ? "active" : ""}`}
                    to="/reports/daily-expense"
                    title="Daily Expense Report"
                  >
                    <i className="bi bi-journal-text"></i>
                    <span className="link-text">Daily Expense</span>
                  </Link>
                </div>
              </div>
            </div>
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

        <div
          className="sidebar-profile"
          onClick={() => setShowLogout(!showLogout)}
          title="User Profile"
        >
          <div className="profile-info">
            <i className="bi bi-person-circle profile-icon"></i>
            <div className="profile-details link-text">
              <span className="profile-name">{isAdmin ? "Administrator" : "Employee"}</span>
              <span className="profile-role">{isAdmin ? "Admin" : "User"}</span>
            </div>
          </div>
          <i className={`bi bi-chevron-${showLogout ? 'up' : 'down'} profile-toggle link-text`}></i>
        </div>

        {showLogout && (
          <div className="sidebar-link logout-btn" onClick={logout} title="Logout" style={{ cursor: "pointer" }}>
            <i className="bi bi-box-arrow-right"></i>
            <span className="link-text">Logout</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menubar;
