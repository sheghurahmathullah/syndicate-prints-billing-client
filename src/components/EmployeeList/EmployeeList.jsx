import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { fetchEmployees, deleteEmployee } from "../../Service/EmployeeService.js";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner.jsx";
import "./EmployeeList.css";

const EmployeeList = ({ onEdit, onTotalLoaded }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);

  const loadEmployees = async (page = 0, size = 10) => {
    setLoading(true);
    try {
      const response = await fetchEmployees(page, size);
      const pageData = response.data.page || response.data;
      setEmployees(response.data.content || []);
      setTotalPages(pageData.totalPages || 0);
      setTotalElements(pageData.totalElements || 0);
      setCurrentPage(pageData.number || 0);
      if (onTotalLoaded) {
        onTotalLoaded(pageData.totalElements || 0);
      }
    } catch (error) {
      console.error("Error loading employees:", error);
      toast.error("Failed to load employees");
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees(currentPage, pageSize);
  }, [currentPage, pageSize]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleDeleteClick = (employee) => {
    setEmployeeToDelete(employee);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!employeeToDelete) return;
    try {
      await deleteEmployee(employeeToDelete.id);
      toast.success("Employee deleted successfully");
      setShowDeleteModal(false);
      setEmployeeToDelete(null);
      
      if (employees.length === 1 && currentPage > 0) {
        setCurrentPage(currentPage - 1);
      } else {
        loadEmployees(currentPage, pageSize);
      }
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast.error("Failed to delete employee.");
      setShowDeleteModal(false);
    }
  };

  const renderAvatar = (emp) => {
    if (emp.photo) {
      return (
        <img
          src={emp.photo}
          alt={`${emp.firstName} ${emp.lastName}`}
          className="employee-avatar-img"
        />
      );
    }
    const initials = `${emp.firstName ? emp.firstName[0] : ""}${emp.lastName ? emp.lastName[0] : ""}`.toUpperCase() || "E";
    return (
      <div className="employee-avatar-initials">
        {initials}
      </div>
    );
  };

  const renderRoleBadge = (role) => {
    const r = role || "";
    if (r.includes("ADMIN")) {
      return <span className="data-badge badge-role-admin"><i className="bi bi-shield-fill-check me-1"></i> Admin</span>;
    } else if (r.includes("MANAGER")) {
      return <span className="data-badge badge-role-manager"><i className="bi bi-person-gear me-1"></i> Manager</span>;
    } else {
      return <span className="data-badge badge-role-user"><i className="bi bi-person-fill me-1"></i> User</span>;
    }
  };

  const renderResumeBtn = (base64String) => {
    if (!base64String) return <span className="text-muted small">No file</span>;
    return (
      <a
        href={base64String}
        download="resume"
        target="_blank"
        rel="noopener noreferrer"
        className="btn-download-resume"
      >
        <i className="bi bi-file-earmark-arrow-down-fill me-1"></i> Resume
      </a>
    );
  };

  const filteredEmployees = employees.filter((emp) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const fullName = `${emp.firstName || ""} ${emp.lastName || ""}`.toLowerCase();
    const email = (emp.email || "").toLowerCase();
    const role = (emp.role || "").toLowerCase();
    const designation = (emp.designation || "").toLowerCase();
    const branch = (emp.branch || "").toLowerCase();
    return (
      fullName.includes(term) ||
      email.includes(term) ||
      role.includes(term) ||
      designation.includes(term) ||
      branch.includes(term)
    );
  });

  return (
    <div className="particular-list-container fade-in">
      <div className="list-header d-flex justify-content-between align-items-center flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2">
          <h3 className="list-title">Employees Directory</h3>
          <span className="badge bg-light text-dark border rounded-pill px-2.5 py-1 small fw-semibold">
            {totalElements} Total
          </span>
        </div>
        <div className="search-input-wrapper">
          <i className="bi bi-search search-icon"></i>
          <input
            type="text"
            className="form-control form-control-sm search-input"
            placeholder="Search name, email, role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="btn-search-clear" onClick={() => setSearchTerm("")}>
              <i className="bi bi-x-circle-fill"></i>
            </button>
          )}
        </div>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <LoadingSpinner message="Loading employee directory..." />
        ) : filteredEmployees.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-person-x"></i>
            <p>{searchTerm ? "No employees match your search query." : "No employees found."}</p>
          </div>
        ) : (
          <table className="data-table align-middle">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Avatar</th>
                <th>Employee Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Designation</th>
                <th>Branch</th>
                <th>Resume</th>
                <th className="actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp) => (
                <tr key={emp.id}>
                  <td>{renderAvatar(emp)}</td>
                  <td className="fw-semibold text-dark">
                    {emp.firstName} {emp.lastName}
                  </td>
                  <td className="text-muted">{emp.email}</td>
                  <td>{renderRoleBadge(emp.role)}</td>
                  <td>{emp.designation || "-"}</td>
                  <td>
                    <span className="branch-badge">
                      <i className="bi bi-building me-1"></i>
                      {emp.branch}
                    </span>
                  </td>
                  <td>{renderResumeBtn(emp.resume)}</td>
                  <td className="actions-col">
                    <div className="action-buttons">
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => onEdit(emp)}
                        title="Edit Employee"
                      >
                        <i className="bi bi-pencil-square"></i>
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleDeleteClick(emp)}
                        title="Delete Employee"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="custom-pagination-container mt-4 mb-2 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          <label htmlFor="pageSize" className="form-label mb-0 small fw-bold text-muted">Rows per page:</label>
          <select
            id="pageSize"
            className="form-select form-select-sm shadow-sm"
            style={{ width: "auto" }}
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(0);
              loadEmployees(0, Number(e.target.value));
            }}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>

        <div className="custom-pagination">
          <button
            className="page-nav-btn"
            disabled={currentPage === 0}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            <i className="bi bi-chevron-left me-1"></i> PREVIOUS
          </button>

          <div className="page-numbers">
            {Array.from({ length: totalPages === 0 ? 1 : totalPages }).map((_, idx) => (
              <button
                key={idx}
                className={`page-num-btn ${currentPage === idx ? 'active' : ''}`}
                onClick={() => handlePageChange(idx)}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <button
            className="page-nav-btn"
            disabled={currentPage >= totalPages - 1}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            NEXT <i className="bi bi-chevron-right ms-1"></i>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-content scale-in">
            <div className="custom-modal-header warning">
              <i className="bi bi-exclamation-triangle"></i>
              <h4>Confirm Deletion</h4>
            </div>
            <div className="custom-modal-body">
              <p>Are you sure you want to delete the employee <strong>{employeeToDelete?.firstName} {employeeToDelete?.lastName}</strong>?</p>
              <p className="custom-modal-warning-text">This action cannot be undone.</p>
            </div>
            <div className="custom-modal-actions">
              <button className="btn-modal-cancel" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="btn-modal-delete" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
