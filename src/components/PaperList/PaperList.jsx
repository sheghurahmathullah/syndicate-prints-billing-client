import "./PaperList.css";
import { useState } from "react";
import toast from "react-hot-toast";
import { deletePaper } from "../../Service/PaperService.js";
import ConfirmModal from "../ConfirmModal/ConfirmModal.jsx";

const PaperList = ({ papers, loading, onEdit, refreshList, page, setPage, size, setSize, totalPages }) => {
  const [deleteModal, setDeleteModal] = useState({ open: false, item: null });

  const confirmDelete = (item) => setDeleteModal({ open: true, item });

  const executeDelete = async () => {
    try {
      await deletePaper(deleteModal.item.paperId);
      toast.success("Paper deleted successfully");
      refreshList();
    } catch {
      toast.error("Unable to delete paper");
    } finally {
      setDeleteModal({ open: false, item: null });
    }
  };

  return (
    <div className="paper-list-container">
      {loading ? (
        <div className="d-flex justify-content-center align-items-center py-4">
          <div className="spinner-border spinner-border-sm text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : papers.length > 0 ? (
        <>
          <div className="paper-table-wrapper">
            <table className="table table-sm table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-3 py-2">#</th>
                  <th className="py-2">Paper Name</th>
                  <th className="py-2">Category</th>
                  <th className="py-2">Group</th>
                  <th className="py-2">Readings</th>
                  <th className="py-2">Status</th>
                  <th className="text-end pe-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {papers.map((paper, idx) => (
                  <tr key={paper.paperId}>
                    <td className="ps-3 py-2 text-muted small">{page * size + idx + 1}</td>
                    <td className="py-2">
                      <div className="fw-semibold text-dark small">{paper.name}</div>
                    </td>
                    <td className="py-2">
                      <span className="badge bg-primary-subtle text-primary small-badge">{paper.paperCategory || "—"}</span>
                    </td>
                    <td className="py-2">
                      <span className="badge bg-info-subtle text-info small-badge">{paper.paperGroup || "—"}</span>
                    </td>
                    <td className="py-2 small text-muted">{paper.readingCount ?? 0}</td>
                    <td className="py-2">
                      <span className={`badge rounded-pill ${paper.isActive ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"} small-badge`}>
                        {paper.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="text-end pe-3 py-2">
                      <div className="action-btn-group justify-content-end">
                        <button className="action-btn action-btn-edit" onClick={() => onEdit(paper)} title="Edit">
                          <i className="bi bi-pencil-fill" />
                        </button>
                        <button className="action-btn action-btn-delete" onClick={() => confirmDelete(paper)} title="Delete">
                          <i className="bi bi-trash-fill" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="paper-pagination mt-3 mb-1 d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <label htmlFor="p-pageSize" className="form-label mb-0 small text-muted">Rows:</label>
              <select
                id="p-pageSize"
                className="form-select form-select-sm shadow-sm"
                style={{ width: "60px", padding: "0.1rem 1.5rem 0.1rem 0.5rem", fontSize: "0.8rem" }}
                value={size}
                onChange={(e) => { setSize(Number(e.target.value)); setPage(0); }}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>

            <div className="custom-pagination pagination-sm">
              <button className="page-nav-btn btn-sm py-0 px-2 small" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                <i className="bi bi-chevron-left" /> PREV
              </button>
              <div className="page-numbers d-flex gap-1">
                {Array.from({ length: totalPages === 0 ? 1 : totalPages }).map((_, i) => (
                  <button
                    key={i}
                    className={`page-num-btn btn-sm py-0 px-2 small ${page === i ? "active" : ""}`}
                    onClick={() => setPage(i)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button className="page-nav-btn btn-sm py-0 px-2 small" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
                NEXT <i className="bi bi-chevron-right" />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="empty-state text-center py-4">
          <i className="bi bi-file-earmark-text" style={{ fontSize: "2rem", color: "#cbd5e1" }} />
          <h5 className="text-secondary fw-bold mt-2 mb-1">No Papers Found</h5>
          <p className="text-muted small">Click "Add Paper" to create one.</p>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, item: null })}
        onConfirm={executeDelete}
        title="Delete Paper"
        message={`Are you sure you want to delete "${deleteModal.item?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmButtonClass="btn-danger btn-sm"
      />
    </div>
  );
};

export default PaperList;
