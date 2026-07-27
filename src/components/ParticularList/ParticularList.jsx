import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { fetchParticulars, deleteParticular, updateParticularStatus } from "../../Service/ParticularService.js";
import "./ParticularList.css";

const ParticularList = ({ onEdit }) => {
  const [particulars, setParticulars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  
  // Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [particularToDelete, setParticularToDelete] = useState(null);

  const loadParticulars = async (page = 0, size = 10) => {
    setLoading(true);
    try {
      const response = await fetchParticulars(page, size);
      const pageData = response.data.page || response.data;
      setParticulars(response.data.content || []);
      setTotalPages(pageData.totalPages || 0);
      setTotalElements(pageData.totalElements || 0);
      setCurrentPage(pageData.number || 0);
    } catch (error) {
      console.error("Error loading particulars:", error);
      toast.error("Failed to load particulars");
      setParticulars([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParticulars(currentPage, pageSize);
  }, [currentPage, pageSize]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleDeleteClick = (particular) => {
    setParticularToDelete(particular);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!particularToDelete) return;
    try {
      await deleteParticular(particularToDelete.particularId);
      toast.success("Particular deleted successfully");
      setShowDeleteModal(false);
      setParticularToDelete(null);
      
      // If we deleted the last item on the current page, go back a page
      if (particulars.length === 1 && currentPage > 0) {
        setCurrentPage(currentPage - 1);
      } else {
        loadParticulars(currentPage, pageSize);
      }
    } catch (error) {
      console.error("Error deleting particular:", error);
      toast.error("Failed to delete particular. It might be in use.");
      setShowDeleteModal(false);
    }
  };

  const handleStatusToggle = async (particularId, currentStatus) => {
    try {
      await updateParticularStatus(particularId, !currentStatus);
      toast.success(`Particular ${!currentStatus ? 'activated' : 'deactivated'}`);
      loadParticulars(currentPage, pageSize);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  return (
    <div className="particular-list-container fade-in">
      <div className="list-header">
        <h3 className="list-title">Particulars List</h3>
        <div className="list-meta">
          Total items: <span className="meta-badge">{totalElements}</span>
        </div>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading particulars...</p>
          </div>
        ) : particulars.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-file-earmark-x"></i>
            <p>No particulars found.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Price (₹)</th>
                <th>Price Back (₹)</th>
                <th>Comm. Rate (%)</th>
                <th>Machine Category</th>
                <th>Paper Group</th>
                <th>Paper</th>
                <th>Status</th>
                <th className="actions-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {particulars.map((part) => (
                <tr key={part.particularId} className={!part.isActive ? 'inactive-row' : ''}>
                  <td className="fw-500">{part.particularId}</td>
                  <td>{part.name}</td>
                  <td>{part.price?.toFixed(2)}</td>
                  <td>{part.priceBack?.toFixed(2) || '0.00'}</td>
                  <td>{part.commisionRate?.toFixed(2) || '0.00'}</td>
                  <td>
                    {part.machineCategory ? (
                      <span className="data-badge badge-blue">{part.machineCategory}</span>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td>
                    {part.paperGroup ? (
                      <span className="data-badge badge-purple">{part.paperGroup}</span>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td>
                    {part.paper ? (
                      <span className="data-badge badge-gray">{part.paper}</span>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td>
                    <button
                      className={`status-btn ${part.isActive ? 'active' : 'inactive'}`}
                      onClick={() => handleStatusToggle(part.particularId, part.isActive)}
                      title={`Click to ${part.isActive ? 'deactivate' : 'activate'}`}
                    >
                      {part.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="actions-col">
                    <div className="action-buttons">
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => onEdit(part)}
                        title="Edit Particular"
                      >
                        <i className="bi bi-pencil-square"></i>
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleDeleteClick(part)}
                        title="Delete Particular"
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
              setCurrentPage(0); // Reset to first page when size changes
              loadParticulars(0, Number(e.target.value));
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
        <div className="modal-overlay">
          <div className="modal-content scale-in">
            <div className="modal-header warning">
              <i className="bi bi-exclamation-triangle"></i>
              <h4>Confirm Deletion</h4>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete the particular <strong>{particularToDelete?.name}</strong> ({particularToDelete?.particularId})?</p>
              <p className="modal-warning-text">This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
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

export default ParticularList;
