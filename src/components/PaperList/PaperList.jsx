import "./PaperList.css";
import { useState } from "react";
import toast from "react-hot-toast";
import { deletePaper } from "../../Service/PaperService.js";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner.jsx";

const PaperList = ({ papers, loading, onEdit, refreshList, page, setPage, size, setSize, totalPages }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [paperToDelete, setPaperToDelete] = useState(null);

  const handleDeleteClick = (paper) => {
    setPaperToDelete(paper);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!paperToDelete) return;
    try {
      await deletePaper(paperToDelete.paperId);
      toast.success("Paper deleted successfully");
      refreshList();
    } catch {
      toast.error("Unable to delete paper");
    } finally {
      setShowDeleteModal(false);
      setPaperToDelete(null);
    }
  };

  const filteredPapers = papers.filter((paper) =>
    paper.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (paper.paperCategory && paper.paperCategory.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (paper.paperGroup && paper.paperGroup.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="paper-item-list-container-scoped">
      {/* Search Header */}
      <div className="list-header d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h6 className="list-title mb-0">
          <span>Paper Stock Directory</span>
        </h6>
        <div className="search-input-wrapper">
          <i className="bi bi-search search-icon"></i>
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search paper name, category, group..."
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
        <LoadingSpinner message="Loading paper stock inventory..." />
      ) : filteredPapers.length > 0 ? (
        <>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: "50px" }}>#</th>
                  <th>Paper Name</th>
                  <th>Category</th>
                  <th>Group</th>
                  <th>Reading Count</th>
                  <th>Status</th>
                  <th className="text-end" style={{ width: "100px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPapers.map((paper, idx) => (
                  <tr key={paper.paperId}>
                    <td>
                      <div className="paper-item-icon-box">
                        <i className="bi bi-file-earmark-text-fill"></i>
                      </div>
                    </td>
                    <td>
                      <div className="fw-semibold text-dark fs-6">{paper.name}</div>
                    </td>
                    <td>
                      <span className="category-pill-badge">
                        <i className="bi bi-layers me-1"></i>
                        {paper.paperCategory || "Uncategorized"}
                      </span>
                    </td>
                    <td>
                      <span className="group-pill-badge">
                        <i className="bi bi-collection me-1"></i>
                        {paper.paperGroup || "Ungrouped"}
                      </span>
                    </td>
                    <td>
                      <span className="reading-count-badge">
                        <i className="bi bi-speedometer2 me-1"></i>
                        {paper.readingCount ?? 0}
                      </span>
                    </td>
                    <td>
                      {paper.isActive ? (
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
                          onClick={() => onEdit(paper)}
                          title="Edit Paper"
                        >
                          <i className="bi bi-pencil-square"></i>
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDeleteClick(paper)}
                          title="Delete Paper"
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
              <label htmlFor="p-pageSize" className="form-label mb-0 small fw-bold text-muted">Rows per page:</label>
              <select
                id="p-pageSize"
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
            <i className="bi bi-file-earmark-text" style={{ fontSize: "3rem", color: "#94a3b8" }}></i>
          </div>
          <h5 className="text-dark fw-bold mb-1">No Papers Found</h5>
          <p className="text-muted small mb-0">Click the "Add Paper" button above to create one.</p>
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
                <h5 className="mb-0 fw-bold text-dark">Delete Paper</h5>
                <p className="mb-0 text-muted small">Confirm paper deletion</p>
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
                Are you sure you want to delete paper{" "}
                <strong className="text-dark">{paperToDelete?.name}</strong>?
              </p>

              {paperToDelete && (
                <div className="user-delete-preview-card mb-3">
                  <div className="d-flex align-items-center gap-3">
                    <div className="paper-item-avatar-badge">
                      <i className="bi bi-file-earmark-text-fill"></i>
                    </div>
                    <div>
                      <h6 className="mb-0 fw-semibold text-dark">{paperToDelete.name}</h6>
                      <div className="d-flex gap-1 mt-1 flex-wrap">
                        <span className="badge bg-primary-subtle text-primary">{paperToDelete.paperCategory || "No Category"}</span>
                        <span className="badge bg-info-subtle text-info">{paperToDelete.paperGroup || "No Group"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="warning-notice-box">
                <i className="bi bi-exclamation-triangle-fill text-warning me-2 fs-5"></i>
                <span className="small text-dark font-medium">
                  This action cannot be undone. Billing calculations relying on this paper stock may be affected.
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
                <i className="bi bi-trash3-fill me-1"></i> Yes, Delete Paper
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaperList;
