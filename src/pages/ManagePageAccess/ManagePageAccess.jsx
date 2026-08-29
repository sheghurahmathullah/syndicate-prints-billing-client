import { useState, useEffect, useContext } from "react";
import "./ManagePageAccess.css";
import PageAccessList from "./PageAccessList";
import { AppContext } from "../../context/AppContext";
import { getActivePageAccesses, toggleRoleAccess } from "../../Service/PageAccessService";
import toast from "react-hot-toast";

const ManagePageAccess = () => {
  const { auth, pageAccessRules, setPageAccessRules } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'admin', 'manager', 'employee'

  useEffect(() => {
    const fetchFreshData = async () => {
      try {
        setLoading(true);
        const data = await getActivePageAccesses(auth.token);
        setPageAccessRules(data);
      } catch (error) {
        toast.error("Failed to load page access data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchFreshData();
    // eslint-disable-next-line
  }, []);

  const handleToggleRole = async (id, role) => {
    try {
      // Optimistic update
      setPageAccessRules(prev => prev.map(rule => 
        rule.id === id ? { ...rule, [role]: !rule[role] } : rule
      ));

      const updated = await toggleRoleAccess(id, role, auth.token);
      toast.success(`${role.charAt(0).toUpperCase() + role.slice(1)} access updated successfully`);
      
      // Sync with backend truth
      setPageAccessRules(prev => prev.map(rule => 
        rule.id === id ? updated : rule
      ));
    } catch (error) {
      toast.error(`Failed to update ${role} access`);
      // Revert optimistic update by refetching
      const data = await getActivePageAccesses(auth.token);
      setPageAccessRules(data);
    }
  };

  // Calculate dynamic stats
  const totalRoutes = pageAccessRules.length;
  const adminRoutes = pageAccessRules.filter(r => r.admin).length;
  const managerRoutes = pageAccessRules.filter(r => r.manager).length;
  const employeeRoutes = pageAccessRules.filter(r => r.employee).length;

  // Filter routes by tab and search query and sort alphabetically
  const filteredRules = pageAccessRules
    .filter(rule => {
      const matchesSearch = rule.page.toLowerCase().replace(/_/g, " ").includes(searchTerm.toLowerCase());
      
      if (activeTab === "admin") return matchesSearch && rule.admin;
      if (activeTab === "manager") return matchesSearch && rule.manager;
      if (activeTab === "employee") return matchesSearch && rule.employee;
      
      return matchesSearch;
    })
    .sort((a, b) => {
      // Sort alphabetically by page identifier/display name
      return a.page.localeCompare(b.page);
    });

  return (
    <div className="manage-page-access-container animate-fade-in">
      {/* Header Banner */}
      <div className="security-banner">
        <div className="banner-glow"></div>
        
        {/* Right Corner Console Badge */}
        <span className="console-security-badge">
          <i className="bi bi-shield-lock-fill" style={{ color: '#10b981' }}></i> Access Control Console
        </span>

        <div className="security-banner-content">
          <div className="status-badge status-active" style={{ marginBottom: '8px' }}>
            <span className="status-dot"></span> Live Sync
          </div>
          <h1>Dynamic Route Authorization</h1>
          <p>
            Configure role-based page and action permissions. Changes take effect instantly for all logged-in users.
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-icon">
            <i className="bi bi-diagram-3"></i>
          </div>
          <div className="stat-info">
            <h3>{totalRoutes}</h3>
            <span>Total Resources</span>
          </div>
        </div>
        <div className={`stat-card admin ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => setActiveTab('admin')}>
          <div className="stat-icon">
            <i className="bi bi-shield-check"></i>
          </div>
          <div className="stat-info">
            <h3>{adminRoutes}</h3>
            <span>Admin Access</span>
          </div>
        </div>
        <div className={`stat-card manager ${activeTab === 'manager' ? 'active' : ''}`} onClick={() => setActiveTab('manager')}>
          <div className="stat-icon">
            <i className="bi bi-briefcase"></i>
          </div>
          <div className="stat-info">
            <h3>{managerRoutes}</h3>
            <span>Manager Access</span>
          </div>
        </div>
        <div className={`stat-card employee ${activeTab === 'employee' ? 'active' : ''}`} onClick={() => setActiveTab('employee')}>
          <div className="stat-icon">
            <i className="bi bi-person-workspace"></i>
          </div>
          <div className="stat-info">
            <h3>{employeeRoutes}</h3>
            <span>Employee Access</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Options Bar */}
      <div className="control-bar">
        <div className="search-box">
          <i className="bi bi-search"></i>
          <input 
            type="text" 
            placeholder="Search routes or resources (e.g. Bills)..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-btn" onClick={() => setSearchTerm("")}>
              <i className="bi bi-x-circle-fill"></i>
            </button>
          )}
        </div>

        <div className="filter-tabs">
          <button className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
            All
          </button>
          <button className={`tab-btn ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => setActiveTab('admin')}>
            Admin
          </button>
          <button className={`tab-btn ${activeTab === 'manager' ? 'active' : ''}`} onClick={() => setActiveTab('manager')}>
            Manager
          </button>
          <button className={`tab-btn ${activeTab === 'employee' ? 'active' : ''}`} onClick={() => setActiveTab('employee')}>
            Employee
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p style={{ color: '#64748b', fontWeight: 500 }}>Fetching live policy configuration...</p>
        </div>
      ) : (
        <PageAccessList 
          pageAccesses={filteredRules} 
          onToggleRole={handleToggleRole} 
        />
      )}
    </div>
  );
};

export default ManagePageAccess;
