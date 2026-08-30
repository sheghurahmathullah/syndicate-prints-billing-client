import "./Menubar.css";
import { assets } from "../../assets/assets.js";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AppContext } from "../../context/AppContext.jsx";

const Menubar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuthData, auth, pageAccessRules } = useContext(AppContext);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
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

  const hasAccess = (pageIdentifier) => {
    if (!pageAccessRules || pageAccessRules.length === 0) {
      return auth.role === "ROLE_ADMIN";
    }

    const rule = pageAccessRules.find(r => r.page === pageIdentifier);
    if (!rule) {
      return auth.role === "ROLE_ADMIN";
    }

    const roleKey = auth.role === "ROLE_ADMIN" ? "admin" 
                  : auth.role === "ROLE_MANAGER" ? "manager" 
                  : "employee";

    return auth.role === "ROLE_ADMIN" || !!rule[roleKey];
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const showManageSection = 
    hasAccess("PARTICULARS") || 
    hasAccess("BRANCHES") || 
    hasAccess("EMPLOYEES") || 
    hasAccess("USERS") || 
    hasAccess("EMPLOYEE_VIEW") || 
    hasAccess("CUSTOMERS") || 
    hasAccess("CUSTOMER_VIEW") || 
    hasAccess("MACHINE_CATEGORY") || 
    hasAccess("MACHINE") || 
    hasAccess("PAPER_CATEGORY") || 
    hasAccess("PAPER_GROUP") || 
    hasAccess("PAPER") || 
    hasAccess("EXPENSE_ITEM") || 
    hasAccess("DAILY_EXPENSES") || 
    hasAccess("MONTHLY_EXPENSE") ||
    hasAccess("REPORTS_DAILY_EXPENSE");

  return (
    <>
      {/* Mobile Top Header Bar - visible only on mobile/tablet screens */}
      <div className="mobile-topbar">
        <div className="mobile-topbar-left">
          <button className="mobile-hamburger-btn" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle Navigation">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#002142" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          <img src={assets.logo} alt="Logo" className="mobile-logo" />
        </div>
        <div className="mobile-topbar-right">
          <span className="mobile-user-title">{isAdmin ? "Admin" : "User"}</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e64051" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mobile-user-icon">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
      </div>

      {/* Backdrop overlay when mobile drawer is open */}
      {mobileOpen && (
        <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)}></div>
      )}

      <div className={`sidebar ${isCollapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <img src={assets.logo} alt="Logo" className="sidebar-logo" />
          </div>
          <button className="hamburger-btn" onClick={toggleSidebar}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#002142" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          <button className="mobile-close-btn" onClick={() => setMobileOpen(false)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="sidebar-menu" onClick={(e) => { if (e.target.closest('a')) setMobileOpen(false); }}>
        {hasAccess("DASHBOARD") && (
          <Link
            className={`sidebar-link ${isActive("/dashboard") ? "active" : ""}`}
            to="/dashboard"
            title="Dashboard"
          >
            <i className="bi bi-grid-1x2"></i>
            <span className="link-text">Dashboard</span>
          </Link>
        )}

        {hasAccess("BILLS_CREATE") && (
          <Link
            className={`sidebar-link ${isActive("/bills/create") ? "active" : ""}`}
            to="/bills/create"
            title="New Bills"
          >
            <i className="bi bi-plus-circle"></i>
            <span className="link-text">New Bills</span>
          </Link>
        )}

        {/* Explore hidden as requested */}

        {(hasAccess("BILLS_TODAY") || hasAccess("BILLS_ALL")) && (
          <>
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
                  {hasAccess("BILLS_TODAY") && (
                    <Link
                      className={`sidebar-link submenu-link ${isActive("/bills/today") ? "active" : ""}`}
                      to="/bills/today"
                      title="View Today"
                    >
                      <i className="bi bi-calendar-event"></i>
                      <span className="link-text">View Today</span>
                    </Link>
                  )}
                  {hasAccess("BILLS_ALL") && (
                    <Link
                      className={`sidebar-link submenu-link ${isActive("/bills/all") ? "active" : ""}`}
                      to="/bills/all"
                      title="View All Bills"
                    >
                      <i className="bi bi-list-check"></i>
                      <span className="link-text">View All bills</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {hasAccess("ANALYTICS") && (
          <Link
            className={`sidebar-link ${isActive("/analytics") ? "active" : ""}`}
            to="/analytics"
            title="Analytics"
          >
            <i className="bi bi-graph-up"></i>
            <span className="link-text">Analytics</span>
          </Link>
        )}

        {hasAccess("CREDITS") && (
          <Link
            className={`sidebar-link ${isActive("/credits") || isActive("/credit-management") ? "active" : ""}`}
            to="/credits"
            title="Credit Management"
          >
            <i className="bi bi-credit-card-2-front"></i>
            <span className="link-text">Credit Management</span>
          </Link>
        )}

        {showManageSection && (
          <>
            <div className="sidebar-heading">Manage</div>
            
            {hasAccess("PARTICULARS") && (
              <Link
                className={`sidebar-link ${isActive("/particulars") ? "active" : ""}`}
                to="/particulars"
                title="Manage Particulars"
              >
                <i className="bi bi-list-columns-reverse"></i>
                <span className="link-text">Particulars</span>
              </Link>
            )}

            {hasAccess("BRANCHES") && (
              <Link
                className={`sidebar-link ${isActive("/branches") ? "active" : ""}`}
                to="/branches"
                title="Manage Branches"
              >
                <i className="bi bi-building"></i>
                <span className="link-text">Branch</span>
              </Link>
            )}

            {/* Products hidden as requested */}

            {(hasAccess("EMPLOYEES") || hasAccess("USERS") || hasAccess("EMPLOYEE_VIEW")) && (
              <>
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
                      {hasAccess("EMPLOYEES") && (
                        <Link
                          className={`sidebar-link submenu-link ${isActive("/employees") ? "active" : ""}`}
                          to="/employees"
                          title="Employees"
                        >
                          <i className="bi bi-person-badge"></i>
                          <span className="link-text">Employees</span>
                        </Link>
                      )}
                      {hasAccess("USERS") && (
                        <Link
                          className={`sidebar-link submenu-link ${isActive("/users") ? "active" : ""}`}
                          to="/users"
                          title="Users"
                        >
                          <i className="bi bi-person"></i>
                          <span className="link-text">Users</span>
                        </Link>
                      )}
                      {hasAccess("EMPLOYEE_VIEW") && (
                        <Link
                          className={`sidebar-link submenu-link ${isActive("/employee-view") ? "active" : ""}`}
                          to="/employee-view"
                          title="Employee View"
                        >
                          <i className="bi bi-person-workspace"></i>
                          <span className="link-text">Employee View</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {(hasAccess("CUSTOMERS") || hasAccess("CUSTOMER_VIEW")) && (
              <>
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
                      {hasAccess("CUSTOMERS") && (
                        <Link
                          className={`sidebar-link submenu-link ${isActive("/customers") ? "active" : ""}`}
                          to="/customers"
                          title="Manage Customers"
                        >
                          <i className="bi bi-person-lines-fill"></i>
                          <span className="link-text">Manage</span>
                        </Link>
                      )}
                      {hasAccess("CUSTOMER_VIEW") && (
                        <Link
                          className={`sidebar-link submenu-link ${isActive("/customer-view") ? "active" : ""}`}
                          to="/customer-view"
                          title="Customer View"
                        >
                          <i className="bi bi-person-vcard"></i>
                          <span className="link-text">Customer View</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {(hasAccess("MACHINE_CATEGORY") || hasAccess("MACHINE")) && (
              <>
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
                      {hasAccess("MACHINE_CATEGORY") && (
                        <Link
                          className={`sidebar-link submenu-link ${isActive("/machine-category") ? "active" : ""}`}
                          to="/machine-category"
                          title="Machine Category"
                        >
                          <i className="bi bi-diagram-3"></i>
                          <span className="link-text">Categories</span>
                        </Link>
                      )}
                      {hasAccess("MACHINE") && (
                        <Link
                          className={`sidebar-link submenu-link ${isActive("/machine") ? "active" : ""}`}
                          to="/machine"
                          title="Manage Machines"
                        >
                          <i className="bi bi-printer"></i>
                          <span className="link-text">Machines</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {(hasAccess("PAPER_CATEGORY") || hasAccess("PAPER_GROUP") || hasAccess("PAPER")) && (
              <>
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
                      {hasAccess("PAPER_CATEGORY") && (
                        <Link
                          className={`sidebar-link submenu-link ${isActive("/paper-category") ? "active" : ""}`}
                          to="/paper-category"
                          title="Paper Category"
                        >
                          <i className="bi bi-layers"></i>
                          <span className="link-text">Paper Category</span>
                        </Link>
                      )}
                      {hasAccess("PAPER_GROUP") && (
                        <Link
                          className={`sidebar-link submenu-link ${isActive("/paper-group") ? "active" : ""}`}
                          to="/paper-group"
                          title="Paper Groups"
                        >
                          <i className="bi bi-collection"></i>
                          <span className="link-text">Paper Groups</span>
                        </Link>
                      )}
                      {hasAccess("PAPER") && (
                        <Link
                          className={`sidebar-link submenu-link ${isActive("/paper") ? "active" : ""}`}
                          to="/paper"
                          title="Manage Paper"
                        >
                          <i className="bi bi-file-earmark-text"></i>
                          <span className="link-text">Paper</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {(hasAccess("EXPENSE_ITEM") || hasAccess("DAILY_EXPENSES") || hasAccess("MONTHLY_EXPENSE")) && (
              <>
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
                      {hasAccess("EXPENSE_ITEM") && (
                        <Link
                          className={`sidebar-link submenu-link ${isActive("/expense-item") ? "active" : ""}`}
                          to="/expense-item"
                          title="Expense Item"
                        >
                          <i className="bi bi-receipt"></i>
                          <span className="link-text">Expense Item</span>
                        </Link>
                      )}
                      {hasAccess("DAILY_EXPENSES") && (
                        <Link
                          className={`sidebar-link submenu-link ${isActive("/daily-expenses") ? "active" : ""}`}
                          to="/daily-expenses"
                          title="Daily Expense"
                        >
                          <i className="bi bi-calendar-day"></i>
                          <span className="link-text">Daily Expense</span>
                        </Link>
                      )}
                      {hasAccess("MONTHLY_EXPENSE") && (
                        <Link
                          className={`sidebar-link submenu-link ${isActive("/monthly-expense") ? "active" : ""}`}
                          to="/monthly-expense"
                          title="Monthly Expense"
                        >
                          <i className="bi bi-calendar-month"></i>
                          <span className="link-text">Monthly Expense</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {hasAccess("REPORTS_DAILY_EXPENSE") && (
              <>
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
          </>
        )}

        {hasAccess("MANAGE_PAGE_ACCESS") && (
          <>
            <div className="sidebar-heading">Security</div>
            <Link
              className={`sidebar-link ${isActive("/manage-page-access") ? "active" : ""}`}
              to="/manage-page-access"
              title="Page Access"
            >
              <i className="bi bi-shield-lock"></i>
              <span className="link-text">Page Access</span>
            </Link>
          </>
        )}

        <div className="sidebar-heading">More</div>
        {hasAccess("ORDERS") && (
          <Link
            className={`sidebar-link ${isActive("/orders") ? "active" : ""}`}
            to="/orders"
            title="Order History"
          >
            <i className="bi bi-clock-history"></i>
            <span className="link-text">Order History</span>
          </Link>
        )}
      </div>

      <div className="sidebar-footer">
        {hasAccess("SETTINGS") && (
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
  </>
  );
};

export default Menubar;
