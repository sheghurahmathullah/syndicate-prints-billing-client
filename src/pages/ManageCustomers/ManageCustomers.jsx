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
        setTotalPages(response.data.totalPages);
        setTotalElements(response.data.totalElements || 0);
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
      <div className="customers-header mb-3">
        <div>
          <h4 className="mb-0">Manage Customers</h4>
        </div>
        {!isFormOpen && (
          <button className="btn btn-primary btn-sm add-customer-btn" onClick={onAddClick}>
            <i className="bi bi-person-plus-fill"></i> Add Customer
          </button>
        )}
      </div>

      {isFormOpen ? (
        <div className="customer-form-section fade-in">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="mb-0">
              <i className="bi bi-person-lines-fill"></i>{" "}
              {selectedCustomer ? "Edit Customer" : "Add New Customer"}
            </h5>
            <button className="btn btn-outline-secondary btn-sm" onClick={onCloseForm}>
              <i className="bi bi-x-lg"></i> Close
            </button>
          </div>
          <CustomerForm
            setCustomers={setCustomers}
            selectedCustomer={selectedCustomer}
            onUpdateCustomer={onUpdateCustomer}
            onCustomerAdded={onCustomerAdded}
          />
        </div>
      ) : (
        <div className="customer-list-section fade-in">
          <div className="customer-banner position-relative text-center text-white mb-3 rounded px-3 py-3" style={{ backgroundColor: '#002952' }}>
            <div className="position-absolute top-0 end-0 m-2 px-2 py-1 badge bg-light text-dark shadow-sm fw-bold small">
              Total Customers: {totalElements}
            </div>
            <h5 className="fw-bold mb-1 text-uppercase tracking-wider">Customer Management</h5>
            <p className="mb-0 text-white-50" style={{ fontSize: '0.8rem' }}>Comprehensive oversight and administration of customers</p>
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

