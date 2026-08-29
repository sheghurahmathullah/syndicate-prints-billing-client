import React, { useState } from "react";

const PageAccessList = ({ pageAccesses, onToggleRole }) => {
  const [processing, setProcessing] = useState(null); // track loading state for specific toggle

  const handleToggle = async (id, role) => {
    const item = pageAccesses.find(p => p.id === id);
    if (item && item.page === "MANAGE_PAGE_ACCESS" && role === "admin") {
      return;
    }
    setProcessing(`${id}-${role}`);
    await onToggleRole(id, role);
    setProcessing(null);
  };

  const getPageIcon = (pageName) => {
    const p = pageName.toLowerCase();
    if (p.includes("dashboard")) return "bi-grid-1x2";
    if (p.includes("bills_create")) return "bi-plus-circle";
    if (p.includes("bills_edit")) return "bi-pencil-square";
    if (p.includes("bills")) return "bi-receipt-cutoff";
    if (p.includes("order")) return "bi-clock-history";
    if (p.includes("credit")) return "bi-credit-card-2-front";
    if (p.includes("category")) return "bi-tags";
    if (p.includes("user")) return "bi-person-badge";
    if (p.includes("branch")) return "bi-building";
    if (p.includes("customer")) return "bi-people";
    if (p.includes("item")) return "bi-box-seam";
    if (p.includes("machine")) return "bi-printer";
    if (p.includes("paper")) return "bi-file-earmark-ruled";
    if (p.includes("particular")) return "bi-list-columns-reverse";
    if (p.includes("employee")) return "bi-people-fill";
    if (p.includes("expense")) return "bi-cash-coin";
    if (p.includes("report")) return "bi-file-bar-graph";
    if (p.includes("security") || p.includes("access")) return "bi-shield-lock";
    if (p.includes("analytics")) return "bi-graph-up";
    if (p.includes("setting")) return "bi-gear";
    return "bi-file-earmark-text";
  };

  const getDisplayName = (pageName) => {
    return pageName
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <div className="glass-card">
      <div className="table-responsive">
        <table className="premium-table">
          <thead>
            <tr>
              <th><i className="bi bi-compass-fill" style={{ marginRight: '8px', color: '#002142' }}></i>Resource & Route</th>
              <th className="text-center"><i className="bi bi-shield-check" style={{ marginRight: '6px', color: '#10b981' }}></i>Admin</th>
              <th className="text-center"><i className="bi bi-briefcase" style={{ marginRight: '6px', color: '#2563eb' }}></i>Manager</th>
              <th className="text-center"><i className="bi bi-person-workspace" style={{ marginRight: '6px', color: '#d97706' }}></i>Employee</th>
            </tr>
          </thead>
          <tbody>
            {pageAccesses.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: 0 }}>
                  <div className="security-empty-state">
                    <i className="bi bi-shield-x"></i>
                    <h4>No Access Rules Found</h4>
                    <p>Database table is empty. Please add page identifiers to configure access.</p>
                  </div>
                </td>
              </tr>
            ) : (
              pageAccesses.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="page-info">
                      <div className="icon-box">
                        <i className={`bi ${getPageIcon(item.page)}`}></i>
                      </div>
                      <div className="page-details">
                        <span className="page-name">{getDisplayName(item.page)}</span>
                        <span className="page-id">{item.page}</span>
                      </div>
                    </div>
                  </td>
                  
                  <td>
                    <div className="toggle-wrapper">
                      <label className="premium-switch">
                        <input
                          type="checkbox"
                          checked={item.page === "MANAGE_PAGE_ACCESS" ? true : item.admin}
                          disabled={item.page === "MANAGE_PAGE_ACCESS" || processing === `${item.id}-admin`}
                          onChange={() => handleToggle(item.id, "admin")}
                        />
                        <span className="premium-slider"></span>
                      </label>
                    </div>
                  </td>
                  
                  <td>
                    <div className="toggle-wrapper">
                      <label className="premium-switch">
                        <input
                          type="checkbox"
                          checked={item.manager}
                          disabled={processing === `${item.id}-manager`}
                          onChange={() => handleToggle(item.id, "manager")}
                        />
                        <span className="premium-slider"></span>
                      </label>
                    </div>
                  </td>
                  
                  <td>
                    <div className="toggle-wrapper">
                      <label className="premium-switch">
                        <input
                          type="checkbox"
                          checked={item.employee}
                          disabled={processing === `${item.id}-employee`}
                          onChange={() => handleToggle(item.id, "employee")}
                        />
                        <span className="premium-slider"></span>
                      </label>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PageAccessList;
