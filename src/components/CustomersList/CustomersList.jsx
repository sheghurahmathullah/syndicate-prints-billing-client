import "./CustomersList.css";
import { useState } from "react";
import { deleteCustomer } from "../../Service/CustomerService.js";
import toast from "react-hot-toast";

const CustomersList = ({ customers, setCustomers, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const editCustomer = (id) => {
    // Support both customerId and id fields
    const customer = customers.find((c) => (c.customerId === id) || (c.id === id));
    console.log("editing customer", customer);
    if (customer && typeof onEdit === "function") {
      onEdit(customer);
    }
  };

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phoneNumber.includes(searchTerm) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const deleteByCustomerId = async (id) => {
    try {
      await deleteCustomer(id);
      setCustomers((prevCustomers) => 
        prevCustomers.filter((customer) => 
          (customer.customerId !== id) && (customer.id !== id)
        )
      );
      toast.success("Customer deleted successfully");
      // Dispatch event to refresh customer suggestions in Explore page
      window.dispatchEvent(new CustomEvent('customerDeleted', { detail: { id } }));
    } catch (e) {
      console.error(e);
      const errorMessage = e.response?.data?.message || e.message || "Unknown error";
      toast.error(`Unable to delete customer: ${errorMessage}`);
    }
  };

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
      <div className="row g-3">
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer) => {
            // Support both customerId and id fields
            const customerId = customer.customerId || customer.id;
            return (
              <div key={customerId} className="col-12">
                <div className="customer-card">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <h5>{customer.name}</h5>
                      <p><i className="bi bi-telephone"></i> {customer.phoneNumber}</p>
                      {customer.email && <p><i className="bi bi-envelope"></i> {customer.email}</p>}
                    </div>
                    <div className="action-buttons">
                      <button
                        className="btn btn-sm btn-edit"
                        onClick={() => editCustomer(customerId)}
                      >
                        <i className="bi bi-pencil-fill"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-delete"
                        onClick={() => deleteByCustomerId(customerId)}
                      >
                        <i className="bi bi-trash-fill"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-12">
            <div className="empty-state">
              <i className="bi bi-person-x"></i>
              <p>No customers found</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomersList;

