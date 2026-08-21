import "./ManageCustomers.css";
import CustomerForm from "../../components/CustomerForm/CustomerForm.jsx";
import CustomersList from "../../components/CustomersList/CustomersList.jsx";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fetchPaginatedCustomers } from "../../Service/CustomerService.js";

const ManageCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, [currentPage, pageSize]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetchPaginatedCustomers(currentPage, pageSize);
      if (response?.data?.content) {
        setCustomers(response.data.content);
        setTotalPages(response.data.totalPages || 1);
        setTotalElements(response.data.totalElements || response.data.content.length);
      } else {
        const allCustomers = Array.isArray(response?.data) ? response.data : [];
        setCustomers(allCustomers);
        setTotalPages(1);
        setTotalElements(allCustomers.length);
      }
    } catch (error) {
      console.error(error);
      toast.error("Unable to fetch customers");
    } finally {
      setLoading(false);
    }
  };

  const onEdit = (customer) => {
    setSelectedCustomer(customer);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onAddClick = () => {
    setSelectedCustomer(null);
    setIsFormOpen(true);
  };

  const onCloseForm = () => {
    setIsFormOpen(false);
    setSelectedCustomer(null);
  };

  const onUpdateCustomer = (updated) => {
    setCustomers((prev) =>
      prev.map((c) => {
        const cId = c.customerId || c.id;
        const updatedId = updated.customerId || updated.id;
        return (cId === updatedId) ? updated : c;
      })
    );
    onCloseForm();
  };

  const onCustomerAdded = () => {
    loadCustomers();
    onCloseForm();
  };

  return (
    <div className="customers-page text-dark">
      {/* Premium Header Card */}
      <div className="manage-header-card mb-3">
        <div className="header-title-box">
          <div className="header-icon-badge">
            <i className="bi bi-people-fill"></i>
          </div>
          <div>
            <h4 className="mb-0 fw-bold text-dark">Manage Customers</h4>
            <p className="mb-0 text-muted small">
              Comprehensive oversight and administration of customer directory
            </p>
          </div>
        </div>

        {!isFormOpen && (
          <button className="btn-premium-add" onClick={onAddClick}>
            <i className="bi bi-person-plus-fill"></i>
            <span>Add Customer</span>
          </button>
        )}
      </div>

      {isFormOpen ? (
        <div className="customer-form-section fade-in">
          <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
            <h5 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
              <i className="bi bi-person-bounding-box text-primary"></i>{" "}
              {selectedCustomer ? "Edit Customer Details" : "Add New Customer"}
            </h5>
            <button className="btn btn-outline-secondary btn-sm rounded-2" onClick={onCloseForm}>
              <i className="bi bi-x-lg me-1"></i> Close
            </button>
          </div>
          <CustomerForm
            setCustomers={setCustomers}
            selectedCustomer={selectedCustomer}
            onUpdateCustomer={onUpdateCustomer}
            onCustomerAdded={onCustomerAdded}
            onSuccess={onCloseForm}
            onCancel={onCloseForm}
          />
        </div>
      ) : (
        <div className="customer-list-section fade-in">
          {/* Responsive Banner */}
          <div className="customer-management-banner mb-3">
            <div className="banner-content">
              <h5 className="banner-title">CUSTOMER MANAGEMENT</h5>
              <p className="banner-subtitle">
                Comprehensive oversight and administration of all system customers
              </p>
            </div>
            <div className="banner-stat-badge">
              TOTAL CUSTOMERS: {totalElements || customers.length}
            </div>
          </div>

          <CustomersList 
            customers={customers} 
            setCustomers={setCustomers} 
            onEdit={onEdit} 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
};

export default ManageCustomers;
