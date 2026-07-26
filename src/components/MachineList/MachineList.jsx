import "./MachineList.css";
import { useState } from "react";
import { deleteMachine, updateMachineStatus } from "../../Service/MachineService.js";
import toast from "react-hot-toast";
import ConfirmModal from "../ConfirmModal/ConfirmModal.jsx";

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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [machineToDelete, setMachineToDelete] = useState(null);

  const confirmDelete = (machine) => {
    setMachineToDelete(machine);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!machineToDelete) return;
    try {
      await deleteMachine(machineToDelete.machineId);
      toast.success("Machine deleted successfully");
      refreshList();
    } catch (error) {
      console.error(error);
      toast.error("Unable to delete machine");
    } finally {
      setIsDeleteModalOpen(false);
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

  return (
    <div className="machine-list-container">
      {loading ? (
        <div className="d-flex justify-content-center align-items-center py-4">
          <div className="spinner-border spinner-border-sm text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : machines.length > 0 ? (
        <>
          <div className="machine-table-wrapper">
            <table className="table table-sm table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col" className="ps-3 py-2">Machine Name</th>
                  <th scope="col" className="py-2">Category</th>
                  <th scope="col" className="py-2">Branch</th>
                  <th scope="col" className="py-2">Serial Number</th>
                  <th scope="col" className="py-2">Status</th>
                  <th scope="col" className="text-end pe-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {machines.map((machine) => (
                  <tr key={machine.machineId}>
                    <td className="ps-3 py-2">
                      <div className="fw-semibold text-dark small">{machine.name}</div>
                    </td>
                    <td className="py-2">
                      <span className="small text-secondary">{machine.machineCategory || "N/A"}</span>
                    </td>
                    <td className="py-2">
                      <span className="small text-secondary">{machine.branchName || "N/A"}</span>
                    </td>
                    <td className="py-2">
                      <span className="small font-monospace text-secondary">{machine.serialNumber || "N/A"}</span>
                    </td>
                    <td className="py-2">
                      <div className="form-check form-switch custom-switch-sm d-inline-block">
                        <input
                          className="form-check-input cursor-pointer"
                          type="checkbox"
                          checked={machine.isActive}
                          onChange={() => toggleStatus(machine)}
                          title={`Click to ${machine.isActive ? 'Deactivate' : 'Activate'}`}
                        />
                      </div>
                      <span className={`badge rounded-pill ms-2 ${machine.isActive ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'} small-badge`}>
                        {machine.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="text-end pe-3 py-2">
                      <div className="action-btn-group justify-content-end">
                        <button
                          className="action-btn action-btn-edit"
                          onClick={() => onEdit(machine)}
                          title="Edit Machine"
                        >
                          <i className="bi bi-pencil-fill"></i>
                        </button>
                        <button
                          className="action-btn action-btn-delete"
                          onClick={() => confirmDelete(machine)}
                          title="Delete Machine"
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
            <i className="bi bi-printer" style={{ fontSize: "2rem", color: "#cbd5e1" }}></i>
          </div>
          <h5 className="text-secondary fw-bold mb-1">No Machines Found</h5>
          <p className="text-muted small">Click the "Add Machine" button to register one.</p>
        </div>
      )}

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={executeDelete}
        title="Delete Machine"
        message={`Are you sure you want to delete the machine '${machineToDelete?.name}'? This action cannot be undone.`}
        confirmText="Delete"
        confirmButtonClass="btn-danger btn-sm"
      />
    </div>
  );
};

export default MachineList;
