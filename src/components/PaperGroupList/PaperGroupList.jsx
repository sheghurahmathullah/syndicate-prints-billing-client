import "./PaperGroupList.css";
import { useState } from "react";
import toast from "react-hot-toast";
import { deletePaperGroup } from "../../Service/PaperService.js";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner.jsx";

const PaperGroupList = ({ groups, loading, onEdit, refreshList, page, setPage, size, setSize, totalPages }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);

  const handleDeleteClick = (group) => {
    setGroupToDelete(group);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!groupToDelete) return;
    try {
      await deletePaperGroup(groupToDelete.groupId);
      toast.success("Paper Group deleted successfully");
      refreshList();
    } catch {
      toast.error("Unable to delete paper group");
    } finally {
      setShowDeleteModal(false);
      setGroupToDelete(null);
    }
  };

  const filteredGroups = groups.filter((grp) =>
    grp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (grp.description && grp.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="paper-group-list-container-scoped">
      {/* Search Header */}
      <div className="list-header d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h6 className="list-title mb-0">
          <span>Paper Group Directory</span>
        </h6>
        <div className="search-input-wrapper">
          <i className="bi bi-search search-icon"></i>
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search group name..."
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
        <LoadingSpinner message="Loading paper groups..." />
      ) : filteredGroups.length > 0 ? (
        <>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: "50px" }}>#</th>
                  <th>Group Name</th>
                  <th>Description</th>
                  <th className="text-end" style={{ width: "100px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGroups.map((grp, idx) => (
                  <tr key={grp.groupId}>
                    <td>
                      <div className="paper-grp-icon-box">
                        <i className="bi bi-collection-fill"></i>
                      </div>
                    </td>
                    <td>
                      <div className="fw-semibold text-dark fs-6">{grp.name}</div>
                    </td>
                    <td>
                      <span className="text-muted small">{grp.description || "—"}</span>
                    </td>
                    <td className="text-end">
                      <div className="action-buttons justify-content-end">
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => onEdit(grp)}
                          title="Edit Group"
                        >
                          <i className="bi bi-pencil-square"></i>
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDeleteClick(grp)}
                          title="Delete Group"
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
              <label htmlFor="pg-pageSize" className="form-label mb-0 small fw-bold text-muted">Rows per page:</label>
              <select
                id="pg-pageSize"
                className="form-select form-select-sm shadow-sm"
                style={{ width: "auto" }}
                value={size}
                onChange={(e) => { setSize(Number(e.target.value)); setPage(0); }}
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
            <i className="bi bi-collection" style={{ fontSize: "3rem", color: "#94a3b8" }}></i>
          </div>
          <h5 className="text-dark fw-bold mb-1">No Paper Groups Found</h5>
          <p className="text-muted small mb-0">Click the "Add Group" button above to create one.</p>
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
                <h5 className="mb-0 fw-bold text-dark">Delete Paper Group</h5>
                <p className="mb-0 text-muted small">Confirm group deletion</p>
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
                Are you sure you want to delete paper group{" "}
                <strong className="text-dark">{groupToDelete?.name}</strong>?
              </p>

              {groupToDelete && (
                <div className="user-delete-preview-card mb-3">
                  <div className="d-flex align-items-center gap-3">
                    <div className="paper-grp-avatar-badge">
                      <i className="bi bi-collection-fill"></i>
                    </div>
                    <div>
                      <h6 className="mb-0 fw-semibold text-dark">{groupToDelete.name}</h6>
                      <p className="mb-0 text-muted small">{groupToDelete.description || "No description"}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="warning-notice-box">
                <i className="bi bi-exclamation-triangle-fill text-warning me-2 fs-5"></i>
                <span className="small text-dark font-medium">
                  This action cannot be undone. Associated papers may lose their group mapping.
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
                <i className="bi bi-trash3-fill me-1"></i> Yes, Delete Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaperGroupList;
