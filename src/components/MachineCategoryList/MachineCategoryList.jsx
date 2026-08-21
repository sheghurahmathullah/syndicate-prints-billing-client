import "./MachineCategoryList.css";
import { useState } from "react";
import { deleteMachineCategory } from "../../Service/MachineCategoryService.js";
import toast from "react-hot-toast";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner.jsx";

const MachineCategoryList = ({ 
  categories, 
  loading,
  onEdit, 
  refreshList,
  page,
  setPage,
  size,
  setSize,
  totalPages
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await deleteMachineCategory(categoryToDelete.categoryId);
      toast.success("Machine Category deleted successfully");
      refreshList();
    } catch (error) {
      console.error(error);
      toast.error("Unable to delete category");
    } finally {
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="machine-category-list-container">
      {/* Search Header */}
      <div className="list-header d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h6 className="list-title mb-0">
          <span>Machine Category Directory</span>
        </h6>
        <div className="search-input-wrapper">
          <i className="bi bi-search search-icon"></i>
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search category name..."
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

      {loading ? (
        <LoadingSpinner message="Loading machine categories..." />
      ) : filteredCategories.length > 0 ? (
        <>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: "50px" }}>#</th>
                  <th>Category Name</th>
                  <th>Status</th>
                  <th className="text-end" style={{ width: "100px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((category, index) => (
                  <tr key={category.categoryId}>
                    <td>
                      <div className="category-icon-box">
                        <i className="bi bi-diagram-3-fill"></i>
                      </div>
                    </td>
                    <td>
                      <div className="fw-semibold text-dark fs-6">{category.name}</div>
                    </td>
                    <td>
                      {category.isActive ? (
                        <span className="data-badge badge-status-active">
                          <i className="bi bi-dot me-1"></i> Active
                        </span>
                      ) : (
                        <span className="data-badge badge-status-inactive">
                          <i className="bi bi-dot me-1"></i> Inactive
                        </span>
                      )}
                    </td>
                    <td className="text-end">
                      <div className="action-buttons justify-content-end">
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => onEdit(category)}
                          title="Edit Category"
                        >
                          <i className="bi bi-pencil-square"></i>
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDeleteClick(category)}
                          title="Delete Category"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="custom-pagination-container mt-4 mb-2 d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div className="d-flex align-items-center gap-2">
              <label htmlFor="pageSize" className="form-label mb-0 small fw-bold text-muted">Rows per page:</label>
              <select 
                id="pageSize" 
                className="form-select form-select-sm shadow-sm" 
                style={{ width: "auto" }}
                value={size}
                onChange={(e) => {
                  setSize(Number(e.target.value));
                  setPage(0);
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
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
              >
                <i className="bi bi-chevron-left me-1"></i> PREVIOUS
              </button>
              
              <div className="page-numbers">
                {Array.from({ length: totalPages === 0 ? 1 : totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    className={`page-num-btn ${page === idx ? 'active' : ''}`}
                    onClick={() => setPage(idx)}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              <button 
                className="page-nav-btn" 
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
              >
                NEXT <i className="bi bi-chevron-right ms-1"></i>
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="empty-state text-center py-5">
          <div className="empty-state-icon mb-3">
            <i className="bi bi-diagram-3" style={{ fontSize: "3rem", color: "#94a3b8" }}></i>
          </div>
          <h5 className="text-dark fw-bold mb-1">No Machine Categories Found</h5>
          <p className="text-muted small mb-0">Click the "Add Category" button above to create a new category.</p>
        </div>
      )}

      {/* Premium Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-card scale-in">
            <div className="modal-header-danger">
              <div className="modal-icon-badge">
                <i className="bi bi-exclamation-triangle-fill"></i>
              </div>
              <div>
                <h5 className="mb-0 fw-bold text-dark">Delete Machine Category</h5>
                <p className="mb-0 text-muted small">Confirm category deletion</p>
              </div>
              <button
                className="btn-close-modal ms-auto"
                onClick={() => setShowDeleteModal(false)}
                title="Close"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="modal-body-content">
              <p className="modal-message-text mb-3">
                Are you sure you want to delete category{" "}
                <strong className="text-dark">{categoryToDelete?.name}</strong>?
              </p>

              {categoryToDelete && (
                <div className="user-delete-preview-card mb-3">
                  <div className="d-flex align-items-center gap-3">
                    <div className="category-avatar-badge">
                      <i className="bi bi-diagram-3-fill"></i>
                    </div>
                    <div>
                      <h6 className="mb-0 fw-semibold text-dark">{categoryToDelete.name}</h6>
                      <span className={`badge ${categoryToDelete.isActive ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'} mt-1`}>
                        {categoryToDelete.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="warning-notice-box">
                <i className="bi bi-exclamation-triangle-fill text-warning me-2 fs-5"></i>
                <span className="small text-dark font-medium">
                  This action cannot be undone. Machines associated with this category may lose their category classification.
                </span>
              </div>
            </div>

            <div className="modal-footer-actions">
              <button
                className="btn-modal-cancel"
                onClick={() => setShowDeleteModal(false)}
              >
                <i className="bi bi-x-circle me-1"></i> No, Cancel
              </button>
              <button
                className="btn-modal-delete"
                onClick={confirmDelete}
              >
                <i className="bi bi-trash3-fill me-1"></i> Yes, Delete Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MachineCategoryList;
