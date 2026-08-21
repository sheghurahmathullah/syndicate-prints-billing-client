import "./MachineList.css";
import { useState } from "react";
import { deleteMachine, updateMachineStatus } from "../../Service/MachineService.js";
import toast from "react-hot-toast";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner.jsx";

const MachineList = ({ 
  machines, 
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
  const [machineToDelete, setMachineToDelete] = useState(null);

  const handleDeleteClick = (machine) => {
    setMachineToDelete(machine);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!machineToDelete) return;
    try {
      await deleteMachine(machineToDelete.machineId);
      toast.success("Machine deleted successfully");
      refreshList();
    } catch (error) {
      console.error(error);
      toast.error("Unable to delete machine");
    } finally {
      setShowDeleteModal(false);
      setMachineToDelete(null);
    }
  };

  const toggleStatus = async (machine) => {
    try {
      await updateMachineStatus(machine.machineId, !machine.isActive);
      toast.success(`Machine is now ${!machine.isActive ? 'Active' : 'Inactive'}`);
      refreshList();
    } catch (error) {
      console.error(error);
      toast.error("Unable to update machine status");
    }
  };

  const filteredMachines = machines.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.machineCategory && m.machineCategory.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (m.branchName && m.branchName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (m.serialNumber && m.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="machine-list-container">
      {/* Search Header */}
      <div className="list-header d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h6 className="list-title mb-0">
          <span>Machine Directory</span>
        </h6>
        <div className="search-input-wrapper">
          <i className="bi bi-search search-icon"></i>
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search name, category, serial #..."
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
        <LoadingSpinner message="Loading registered machines..." />
      ) : filteredMachines.length > 0 ? (
        <>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: "50px" }}>#</th>
                  <th>Machine Name</th>
                  <th>Category</th>
                  <th>Branch</th>
                  <th>Serial Number</th>
                  <th>Status</th>
                  <th className="text-end" style={{ width: "100px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMachines.map((machine) => (
                  <tr key={machine.machineId}>
                    <td>
                      <div className="machine-icon-box">
                        <i className="bi bi-printer-fill"></i>
                      </div>
                    </td>
                    <td>
                      <div className="fw-semibold text-dark fs-6">{machine.name}</div>
                      {machine.reading !== undefined && machine.reading !== null && (
                        <div className="small text-muted">Initial Reading: {machine.reading}</div>
                      )}
                    </td>
                    <td>
                      <span className="category-pill-badge">
                        <i className="bi bi-diagram-3 me-1"></i>
                        {machine.machineCategory || "N/A"}
                      </span>
                    </td>
                    <td>
                      <span className="branch-pill-badge">
                        <i className="bi bi-geo-alt me-1"></i>
                        {machine.branchName || "N/A"}
                      </span>
                    </td>
                    <td>
                      <span className="serial-pill-badge">
                        {machine.serialNumber || "N/A"}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="form-check form-switch custom-switch-sm m-0">
                          <input
                            className="form-check-input cursor-pointer"
                            type="checkbox"
                            checked={machine.isActive}
                            onChange={() => toggleStatus(machine)}
                            title={`Click to ${machine.isActive ? 'Deactivate' : 'Activate'}`}
                          />
                        </div>
                        {machine.isActive ? (
                          <span className="data-badge badge-status-active">Active</span>
                        ) : (
                          <span className="data-badge badge-status-inactive">Inactive</span>
                        )}
                      </div>
                    </td>
                    <td className="text-end">
                      <div className="action-buttons justify-content-end">
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => onEdit(machine)}
                          title="Edit Machine"
                        >
                          <i className="bi bi-pencil-square"></i>
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDeleteClick(machine)}
                          title="Delete Machine"
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
            <i className="bi bi-printer" style={{ fontSize: "3rem", color: "#94a3b8" }}></i>
          </div>
          <h5 className="text-dark fw-bold mb-1">No Machines Found</h5>
          <p className="text-muted small mb-0">Click the "Add Machine" button above to register a new machine.</p>
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
                <h5 className="mb-0 fw-bold text-dark">Delete Machine</h5>
                <p className="mb-0 text-muted small">Confirm machine deletion</p>
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
                Are you sure you want to delete machine{" "}
                <strong className="text-dark">{machineToDelete?.name}</strong>?
              </p>

              {machineToDelete && (
                <div className="user-delete-preview-card mb-3">
                  <div className="d-flex align-items-center gap-3">
                    <div className="machine-avatar-badge">
                      <i className="bi bi-printer-fill"></i>
                    </div>
                    <div>
                      <h6 className="mb-0 fw-semibold text-dark">{machineToDelete.name}</h6>
                      <div className="small text-muted">
                        Category: {machineToDelete.machineCategory || "N/A"} | Serial: {machineToDelete.serialNumber || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="warning-notice-box">
                <i className="bi bi-exclamation-triangle-fill text-warning me-2 fs-5"></i>
                <span className="small text-dark font-medium">
                  This action cannot be undone. Associated reading records and logs for this machine may be permanently affected.
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
                <i className="bi bi-trash3-fill me-1"></i> Yes, Delete Machine
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MachineList;
