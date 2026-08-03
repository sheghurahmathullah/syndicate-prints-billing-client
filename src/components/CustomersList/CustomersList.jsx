import "./CustomersList.css";
import { useState } from "react";
import { deleteCustomer } from "../../Service/CustomerService.js";
import toast from "react-hot-toast";
import ConfirmModal from "../ConfirmModal/ConfirmModal.jsx";

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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  const editCustomer = (id) => {
    const customer = customers.find((c) => (c.customerId === id) || (c.id === id));
    if (customer && typeof onEdit === "function") {
      onEdit(customer);
    }
  };

  const confirmDelete = (id) => {
    const customer = customers.find((c) => (c.customerId === id) || (c.id === id));
    setCustomerToDelete(customer);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = async () => {
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
      
      // If we deleted the last item on the page, go back a page
      if (customers.length === 1 && currentPage > 0) {
          onPageChange(currentPage - 1);
      }
    } catch (e) {
      console.error(e);
      const errorMessage = e.response?.data?.message || e.message || "Unknown error";
      toast.error(`Unable to delete customer: ${errorMessage}`);
    } finally {
      setIsDeleteModalOpen(false);
      setCustomerToDelete(null);
    }
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phoneNumber.includes(searchTerm) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (customer.companyName && customer.companyName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="customers-list-container">
      <div className="search-box">
        <div className="input-group">
          <input
            type="text"
            name="keyword"
            id="keyword"
            placeholder="Search customers by name, phone, or email..."
            className="form-control search-input"
            onChange={(e) => setSearchTerm(e.target.value)}
            value={searchTerm}
          />
          <span className="search-icon">
            <i className="bi bi-search"></i>
          </span>
        </div>
      </div>
      
      {loading ? (
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : filteredCustomers.length > 0 ? (
        <>
          <div className="table-responsive customer-table-wrapper">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Contact</th>
                  <th scope="col">Company</th>
                  <th scope="col">Tax Number</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => {
                  const customerId = customer.customerId || customer.id;
                  return (
                    <tr key={customerId}>
                      <td>
                        <div className="fw-bold text-dark">{customer.name}</div>
                      </td>
                      <td>
                        <div><i className="bi bi-telephone text-primary me-2"></i>{customer.phoneNumber}</div>
                        {customer.email && (
                          <div className="small text-muted"><i className="bi bi-envelope me-2"></i>{customer.email}</div>
                        )}
                      </td>
                      <td>
                        {customer.companyName ? (
                           <div className="text-muted"><i className="bi bi-building me-1"></i> {customer.companyName}</div>
                        ) : (
                           <span className="text-muted small">-</span>
                        )}
                      </td>
                      <td>
                        {customer.taxNumber ? (
                          <div className="text-muted"><i className="bi bi-receipt me-1"></i> {customer.taxNumber}</div>
                        ) : (
                          <span className="text-muted small">-</span>
                        )}
                      </td>
                      <td>
                        {customer.isActive === false ? (
                          <span className="badge bg-danger">Inactive</span>
                        ) : (
                          <span className="badge bg-success">Active</span>
                        )}
                      </td>
                      <td className="text-end">
                        <div className="action-btn-group">
                          <button
                            className="action-btn action-btn-edit"
                            onClick={() => editCustomer(customerId)}
                            title="Edit Customer"
                          >
                            <i className="bi bi-pencil-square"></i>
                          </button>
                          <button
                            className="action-btn action-btn-delete"
                            onClick={() => confirmDelete(customerId)}
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
                  onPageChange(0); // Reset to first page when size changes
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
                onClick={() => onPageChange(p => p - 1)}
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
                onClick={() => onPageChange(p => p + 1)}
              >
                NEXT <i className="bi bi-chevron-right ms-1"></i>
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="empty-state text-center py-5">
          <div className="empty-state-icon mb-3">
             <i className="bi bi-person-x" style={{ fontSize: "3rem", color: "#cbd5e1" }}></i>
          </div>
          <h4 className="text-secondary fw-bold">No Customers Found</h4>
          <p className="text-muted">Click the "Add Customer" button to create one.</p>
        </div>
      )}

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={executeDelete}
        title="Delete Customer"
        message={`Are you sure you want to delete the customer '${customerToDelete?.name}'? This action cannot be undone.`}
        confirmText="Delete"
        confirmButtonClass="btn-danger"
      />
    </div>
  );
};

export default CustomersList;

