import "./BranchList.css";
import { useState } from "react";
import { deleteBranch } from "../../Service/BranchService.js";
import toast from "react-hot-toast";
import ConfirmModal from "../ConfirmModal/ConfirmModal.jsx";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner.jsx";

const BranchList = ({ 
  branches, 
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
  const [branchToDelete, setBranchToDelete] = useState(null);

  const confirmDelete = (branch) => {
    setBranchToDelete(branch);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!branchToDelete) return;
    try {
      await deleteBranch(branchToDelete.branchId);
      toast.success("Branch deleted successfully");
      refreshList();
    } catch (error) {
      console.error(error);
      toast.error("Unable to delete branch");
    } finally {
      setIsDeleteModalOpen(false);
      setBranchToDelete(null);
    }
  };

  return (
    <div className="branch-list-container">
      {loading ? (
        <LoadingSpinner message="Loading branch locations..." />
      ) : branches.length > 0 ? (
        <>
          <div className="table-responsive branch-table-wrapper">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col">Branch Name</th>
                  <th scope="col">Shop Name</th>
                  <th scope="col">Contact</th>
                  <th scope="col">Address</th>
                  <th scope="col" className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {branches.map((branch) => (
                  <tr key={branch.branchId}>
                    <td>
                      <div className="fw-bold text-dark">{branch.name}</div>
                    </td>
                    <td>{branch.shopName}</td>
                    <td>
                      <div><i className="bi bi-telephone text-primary me-2"></i>{branch.phoneNumber}</div>
                      {branch.email && (
                        <div className="small text-muted"><i className="bi bi-envelope me-2"></i>{branch.email}</div>
                      )}
                    </td>
                    <td>
                      <span className="text-truncate d-inline-block" style={{ maxWidth: '200px' }} title={branch.address}>
                        {branch.address}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="action-btn-group">
                        <button
                          className="action-btn action-btn-edit"
                          onClick={() => onEdit(branch)}
                          title="Edit Branch"
                        >
                          <i className="bi bi-pencil-square"></i>
                        </button>
                        <button
                          className="action-btn action-btn-delete"
                          onClick={() => confirmDelete(branch)}
                          title="Delete Branch"
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

          <div className="custom-pagination-container mt-4 mb-2 d-flex justify-content-end align-items-center gap-3">
            <div className="d-flex align-items-center gap-2">
              <label htmlFor="pageSize" className="form-label mb-0 small fw-bold text-muted">Rows per page:</label>
              <select 
                id="pageSize" 
                className="form-select form-select-sm shadow-sm" 
                style={{ width: "auto" }}
                value={size}
                onChange={(e) => {
                  setSize(Number(e.target.value));
                  setPage(0); // Reset to first page when size changes
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
                onClick={() => setPage(p => p - 1)}
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
                onClick={() => setPage(p => p + 1)}
              >
                NEXT <i className="bi bi-chevron-right ms-1"></i>
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="empty-state text-center py-5">
          <div className="empty-state-icon mb-3">
            <i className="bi bi-buildings" style={{ fontSize: "3rem", color: "#cbd5e1" }}></i>
          </div>
          <h4 className="text-secondary fw-bold">No Branches Found</h4>
          <p className="text-muted">Click the "Add Branch" button to create one.</p>
        </div>
      )}

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={executeDelete}
        title="Delete Branch"
        message={`Are you sure you want to delete the branch '${branchToDelete?.name}'? This action cannot be undone.`}
        confirmText="Delete"
        confirmButtonClass="btn-danger"
      />
    </div>
  );
};

export default BranchList;
