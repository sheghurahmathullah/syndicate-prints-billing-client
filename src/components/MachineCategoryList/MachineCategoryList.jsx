import "./MachineCategoryList.css";
import { useState } from "react";
import { deleteMachineCategory } from "../../Service/MachineCategoryService.js";
import toast from "react-hot-toast";
import ConfirmModal from "../ConfirmModal/ConfirmModal.jsx";

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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const confirmDelete = (category) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await deleteMachineCategory(categoryToDelete.categoryId);
      toast.success("Category deleted successfully");
      refreshList();
    } catch (error) {
      console.error(error);
      toast.error("Unable to delete category");
    } finally {
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
    }
  };

  return (
    <div className="category-list-container">
      {loading ? (
        <div className="d-flex justify-content-center align-items-center py-4">
          <div className="spinner-border spinner-border-sm text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : categories.length > 0 ? (
        <>
          <div className="category-table-wrapper">
            <table className="table table-sm table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col" className="ps-3 py-2">Category Name</th>
                  <th scope="col" className="py-2">Status</th>
                  <th scope="col" className="text-end pe-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.categoryId}>
                    <td className="ps-3 py-2">
                      <div className="fw-semibold text-dark small">{category.name}</div>
                    </td>
                    <td className="py-2">
                      <span className={`badge rounded-pill ${category.isActive ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'} small-badge`}>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="text-end pe-3 py-2">
                      <div className="action-btn-group justify-content-end">
                        <button
                          className="action-btn action-btn-edit"
                          onClick={() => onEdit(category)}
                          title="Edit Category"
                        >
                          <i className="bi bi-pencil-fill"></i>
                        </button>
                        <button
                          className="action-btn action-btn-delete"
                          onClick={() => confirmDelete(category)}
                          title="Delete Category"
                        >
                          <i className="bi bi-trash-fill"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="custom-pagination-container mt-3 mb-1 d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <label htmlFor="pageSize" className="form-label mb-0 small text-muted">Rows:</label>
              <select 
                id="pageSize" 
                className="form-select form-select-sm shadow-sm" 
                style={{ width: "60px", padding: "0.1rem 1.5rem 0.1rem 0.5rem", fontSize: "0.8rem" }}
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

            <div className="custom-pagination pagination-sm">
              <button 
                className="page-nav-btn btn-sm py-0 px-2 small" 
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
              >
                <i className="bi bi-chevron-left"></i> PREV
              </button>
              
              <div className="page-numbers d-flex gap-1">
                {Array.from({ length: totalPages === 0 ? 1 : totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    className={`page-num-btn btn-sm py-0 px-2 small ${page === idx ? 'active' : ''}`}
                    onClick={() => setPage(idx)}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              <button 
                className="page-nav-btn btn-sm py-0 px-2 small" 
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
              >
                NEXT <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="empty-state text-center py-4">
          <div className="empty-state-icon mb-2">
            <i className="bi bi-diagram-3" style={{ fontSize: "2rem", color: "#cbd5e1" }}></i>
          </div>
          <h5 className="text-secondary fw-bold mb-1">No Categories Found</h5>
          <p className="text-muted small">Click the "Add Category" button to create one.</p>
        </div>
      )}

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={executeDelete}
        title="Delete Category"
        message={`Are you sure you want to delete the category '${categoryToDelete?.name}'? This action cannot be undone.`}
        confirmText="Delete"
        confirmButtonClass="btn-danger btn-sm"
      />
    </div>
  );
};

export default MachineCategoryList;
