import "./CustomersList.css";
import { useState } from "react";
import { deleteCustomer } from "../../Service/CustomerService.js";
import toast from "react-hot-toast";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner.jsx";

const CustomersList = ({ 
  customers, 
  setCustomers, 
  onEdit, 
  currentPage, 
  totalPages, 
  onPageChange,
  pageSize,
  setPageSize,
  loading 
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  const editCustomer = (id) => {
    const customer = customers.find((c) => (c.customerId === id) || (c.id === id));
    if (customer && typeof onEdit === "function") {
      onEdit(customer);
    }
  };

  const handleDeleteClick = (customer) => {
    setCustomerToDelete(customer);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!customerToDelete) return;
    const id = customerToDelete.customerId || customerToDelete.id;
    try {
      await deleteCustomer(id);
      setCustomers((prevCustomers) => 
        prevCustomers.filter((customer) => 
          (customer.customerId !== id) && (customer.id !== id)
        )
      );
      toast.success("Customer deleted successfully");
      window.dispatchEvent(new CustomEvent('customerDeleted', { detail: { id } }));
      
      if (customers.length === 1 && currentPage > 0) {
        onPageChange(currentPage - 1);
      }
    } catch (e) {
      console.error(e);
      const errorMessage = e.response?.data?.message || e.message || "Unknown error";
      toast.error(`Unable to delete customer: ${errorMessage}`);
    } finally {
      setShowDeleteModal(false);
      setCustomerToDelete(null);
    }
  };

  const renderAvatar = (customer) => {
    if (!customer || !customer.name) return <div className="customer-avatar-initials">CU</div>;
    const names = customer.name.trim().split(" ");
    const initials = names.length > 1 
      ? `${names[0][0]}${names[1][0]}`.toUpperCase()
      : names[0].substring(0, 2).toUpperCase();
    
    return <div className="customer-avatar-initials">{initials}</div>;
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phoneNumber.includes(searchTerm) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (customer.companyName && customer.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (customer.taxNumber && customer.taxNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="customers-list-container">
      {/* Search Header */}
      <div className="list-header d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h6 className="list-title mb-0">
          <span>Customer Directory</span>
        </h6>
        <div className="search-input-wrapper">
          <i className="bi bi-search search-icon"></i>
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search name, phone, email, GSTIN..."
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
        <LoadingSpinner message="Loading customer directory..." />
      ) : filteredCustomers.length > 0 ? (
        <>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: "60px" }}>Avatar</th>
                  <th>Customer Name</th>
                  <th>Contact Information</th>
                  <th>Company / GSTIN</th>
                  <th>Status</th>
                  <th className="text-end" style={{ width: "100px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => {
                  const customerId = customer.customerId || customer.id;
                  return (
                    <tr key={customerId}>
                      <td>{renderAvatar(customer)}</td>
                      <td>
                        <div className="fw-semibold text-dark fs-6">{customer.name}</div>
                      </td>
                      <td>
                        <div className="d-flex flex-column gap-1">
                          <span className="text-dark font-mono small">
                            <i className="bi bi-telephone-fill text-primary me-1.5"></i>
                            {customer.phoneNumber}
                          </span>
                          {customer.email && (
                            <span className="text-muted small">
                              <i className="bi bi-envelope me-1.5"></i>
                              {customer.email}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex flex-column gap-1">
                          {customer.companyName ? (
                            <span className="fw-medium text-dark small">
                              <i className="bi bi-building me-1.5 text-secondary"></i>
                              {customer.companyName}
                            </span>
                          ) : (
                            <span className="text-muted small">-</span>
                          )}
                          {customer.taxNumber && (
                            <span className="badge bg-light text-secondary border w-auto align-self-start font-mono small">
                              GST: {customer.taxNumber}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        {customer.isActive === false ? (
                          <span className="data-badge badge-status-inactive">
                            <i className="bi bi-dot me-1"></i> Inactive
                          </span>
                        ) : (
                          <span className="data-badge badge-status-active">
                            <i className="bi bi-dot me-1"></i> Active
                          </span>
                        )}
                      </td>
                      <td className="text-end">
                        <div className="action-buttons justify-content-end">
                          <button
                            className="btn-icon btn-edit"
                            onClick={() => editCustomer(customerId)}
                            title="Edit Customer"
                          >
                            <i className="bi bi-pencil-square"></i>
                          </button>
                          <button
                            className="btn-icon btn-delete"
                            onClick={() => handleDeleteClick(customer)}
                            title="Delete Customer"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  onPageChange(0);
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
                onClick={() => onPageChange(currentPage - 1)}
              >
                <i className="bi bi-chevron-left me-1"></i> PREVIOUS
              </button>
              
              <div className="page-numbers">
                {Array.from({ length: totalPages === 0 ? 1 : totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    className={`page-num-btn ${currentPage === idx ? 'active' : ''}`}
                    onClick={() => onPageChange(idx)}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              <button 
                className="page-nav-btn" 
                disabled={currentPage >= totalPages - 1}
                onClick={() => onPageChange(currentPage + 1)}
              >
                NEXT <i className="bi bi-chevron-right ms-1"></i>
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="empty-state text-center py-5">
          <div className="empty-state-icon mb-3">
             <i className="bi bi-person-x" style={{ fontSize: "3rem", color: "#94a3b8" }}></i>
          </div>
          <h5 className="text-dark fw-bold mb-1">No Customers Found</h5>
          <p className="text-muted small mb-0">Click the "Add Customer" button above to create a new customer record.</p>
        </div>
      )}

      {/* Premium Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-card scale-in">
            <div className="modal-header-danger">
              <div className="modal-icon-badge">
                <i className="bi bi-person-x-fill"></i>
              </div>
              <div>
                <h5 className="mb-0 fw-bold text-dark">Delete Customer</h5>
                <p className="mb-0 text-muted small">Confirm customer record deletion</p>
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
                Are you sure you want to delete customer record for{" "}
                <strong className="text-dark">{customerToDelete?.name}</strong>?
              </p>

              {customerToDelete && (
                <div className="user-delete-preview-card mb-3">
                  <div className="d-flex align-items-center gap-3">
                    {renderAvatar(customerToDelete)}
                    <div className="overflow-hidden">
                      <h6 className="mb-0 fw-semibold text-dark text-truncate">{customerToDelete.name}</h6>
                      <p className="mb-0 text-muted small text-truncate"><i className="bi bi-telephone me-1"></i>{customerToDelete.phoneNumber}</p>
                      {customerToDelete.email && (
                        <p className="mb-0 text-muted small text-truncate"><i className="bi bi-envelope me-1"></i>{customerToDelete.email}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="warning-notice-box">
                <i className="bi bi-exclamation-triangle-fill text-warning me-2 fs-5"></i>
                <span className="small text-dark font-medium">
                  This action cannot be undone. Customer transaction history associated with this account may be affected.
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
                <i className="bi bi-trash3-fill me-1"></i> Yes, Delete Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersList;
