import "./ManageCustomers.css";
import CustomerForm from "../../components/CustomerForm/CustomerForm.jsx";
import CustomersList from "../../components/CustomersList/CustomersList.jsx";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { fetchCustomers } from "../../Service/CustomerService.js";

const ManageCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadCustomers() {
      try {
        setLoading(true);
        const response = await fetchCustomers();
        const allCustomers = Array.isArray(response?.data) ? response.data : [];
        setCustomers(allCustomers);
        
      } catch (error) {
        console.error(error);
        toast.error("Unable to fetch customers");
      } finally {
        setLoading(false);
      }
    }
    loadCustomers();
  }, []);

  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const onEdit = (customer) => {
    // show customer in the left form for editing
    setSelectedCustomer(customer);
    // optionally scroll to top or focus
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onUpdateCustomer = (updated) => {
    setCustomers((prev) =>
      prev.map((c) => {
        // Support both customerId and id fields
        const cId = c.customerId || c.id;
        const updatedId = updated.customerId || updated.id;
        return (cId === updatedId) ? updated : c;
      })
    );
    setSelectedCustomer(null);
  };

  return (
    <div className="customers-container text-dark">
      <div className="left-column">
        <h3>
          <i className="bi bi-person-plus-fill"></i>{" "}
          {selectedCustomer ? "Edit Customer" : "Add New Customer"}
        </h3>
        <CustomerForm
          setCustomers={setCustomers}
          selectedCustomer={selectedCustomer}
          onUpdateCustomer={onUpdateCustomer}
        />
      </div>
      <div className="right-column">
        <h3>
          <i className="bi bi-people-fill"></i> All Customers
        </h3>
        <CustomersList customers={customers} setCustomers={setCustomers} onEdit={onEdit} />
      </div>
    </div>
  );
};

export default ManageCustomers;

