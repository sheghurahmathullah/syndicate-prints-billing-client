import "./ExpenseItemList.css";
import { useState, useEffect } from "react";
import { fetchExpenseItems, deleteExpenseItem } from "../../Service/ExpenseService.js";
import toast from "react-hot-toast";
import ConfirmModal from "../ConfirmModal/ConfirmModal.jsx";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner.jsx";

const ExpenseItemList = ({ 
  onEdit, 
  refreshTrigger,
  expenseItems,
  loading,
  page,
  setPage,
  size,
  setSize,
  totalPages,
  refreshList
}) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const confirmDelete = (item) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteExpenseItem(itemToDelete.expenseItemId);
      toast.success("Expense item deleted successfully");
      refreshList();
    } catch (error) {
      console.error(error);
      let errorMessage = "Unable to delete expense item";
      
      if (error.response) {
        const errorData = error.response.data;
        if (errorData) {
          if (typeof errorData === 'string') {
            errorMessage = errorData;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className="expense-item-list-container">
      {loading ? (
        <LoadingSpinner message="Loading expense items..." />
      ) : expenseItems.length > 0 ? (
        <>
          <div className="table-responsive expense-table-wrapper">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col" style={{ width: "60px" }}>#</th>
                  <th scope="col">Name</th>
                  <th scope="col">Type</th>
                  <th scope="col">In Account</th>
                  <th scope="col" className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenseItems.map((item, index) => (
                  <tr key={item.expenseItemId}>
                    <td>
                      <span className="ops-row-number">{page * size + index + 1}</span>
                    </td>
                    <td>
                      <div className="fw-bold text-dark">{item.name}</div>
                    </td>
                    <td>
                      {item.type === 'DAILY' ? (
                        <span className="data-badge badge-ops-daily">
                          <i className="bi bi-calendar-event me-1"></i> Daily
                        </span>
                      ) : (
                        <span className="data-badge badge-ops-monthly">
                          <i className="bi bi-calendar-range me-1"></i> Monthly
                        </span>
                      )}
                    </td>
                    <td>
                      {item.addInAccount ? (
                        <span className="data-badge badge-ops-included">
                          <i className="bi bi-check-circle-fill me-1"></i> Add in Account
                        </span>
                      ) : (
                        <span className="data-badge badge-ops-excluded">
                          <i className="bi bi-dash-circle me-1"></i> Excluded
                        </span>
                      )}
                    </td>
                    <td className="text-end">
                      <div className="action-buttons justify-content-end">
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => onEdit(item)}
                          title="Edit Item"
                        >
                          <i className="bi bi-pencil-square"></i>
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => confirmDelete(item)}
                          title="Delete Item"
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

          <div className="custom-pagination-container mt-4 mb-2 d-flex justify-content-between align-items-center">
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
            <i className="bi bi-receipt" style={{ fontSize: "3rem", color: "#cbd5e1" }}></i>
          </div>
          <h4 className="text-secondary fw-bold">No Expense Items Found</h4>
          <p className="text-muted">Click the "Add Item" button to create one.</p>
        </div>
      )}

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={executeDelete}
        title="Delete Expense Item"
        message={`Are you sure you want to delete the expense item '${itemToDelete?.name}'? This action cannot be undone.`}
        confirmText="Delete"
        confirmButtonClass="btn-danger"
      />
    </div>
  );
};

export default ExpenseItemList;
