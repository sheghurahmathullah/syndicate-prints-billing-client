import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { fetchEmployees, deleteEmployee } from "../../Service/EmployeeService.js";
import "./EmployeeList.css";

const EmployeeList = ({ onEdit, onTotalLoaded }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  
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
      
      // If we deleted the last item on the current page, go back a page
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

  const renderBase64File = (base64String, type) => {
    if (!base64String) return <span className="text-muted">-</span>;
    if (type === 'image') {
       return <img src={base64String} alt="Employee" style={{width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover'}} />
    } else {
       return (
         <a href={base64String} download="resume" target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
           <i className="bi bi-file-earmark-arrow-down"></i> Download
         </a>
       )
    }
  }

  return (
    <div className="particular-list-container fade-in">
      <div className="list-header">
        <h3 className="list-title">Employees List</h3>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading employees...</p>
          </div>
        ) : employees.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-person-x"></i>
            <p>No employees found.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Photo</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Designation</th>
                <th>Branch</th>
                <th>Resume</th>
                <th className="actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td>{renderBase64File(emp.photo, 'image')}</td>
                  <td className="fw-500">{emp.firstName} {emp.lastName}</td>
                  <td>{emp.email}</td>
                  <td>
                     <span className="data-badge badge-blue">{emp.role}</span>
                  </td>
                  <td>{emp.designation}</td>
                  <td>{emp.branch}</td>
                  <td>{renderBase64File(emp.resume, 'file')}</td>
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
