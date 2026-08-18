import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import EmployeeList from "../../components/EmployeeList/EmployeeList.jsx";
import EmployeeForm from "../../components/EmployeeForm/EmployeeForm.jsx";
import { addEmployee, updateEmployee } from "../../Service/EmployeeService.js";

const ManageEmployee = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [totalEmployees, setTotalEmployees] = useState(0);

  const listRef = useRef();

  const handleAddClick = () => {
    setEditingEmployee(null);
    setShowForm(true);
  };

  const handleEditClick = (employee) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingEmployee(null);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingEmployee) {
        await updateEmployee(editingEmployee.id, formData);
        toast.success("Employee updated successfully");
      } else {
        await addEmployee(formData);
        toast.success("Employee created successfully");
      }

      setShowForm(false);
      setEditingEmployee(null);
      if (listRef.current) {
        window.dispatchEvent(new CustomEvent("refreshEmployees"));
      } else {
        window.dispatchEvent(new CustomEvent("refreshEmployees"));
      }
    } catch (error) {
      console.error("Error saving employee:", error);
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error(`Failed to ${editingEmployee ? "update" : "create"} employee`);
      }
    }
  };

  return (
    <div className="manage-page fade-in">
      <div className="page-header mb-3 d-flex justify-content-between align-items-center">
        <div>
          <h4 className="mb-0">Manage Employees</h4>
        </div>
        {!showForm && (
          <button className="btn-premium-add" onClick={handleAddClick}>
            <i className="bi bi-person-plus-fill"></i> Add Employee
          </button>
        )}
      </div>

      {showForm ? (
        <div className="form-section fade-in">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="mb-0">
              <i className="bi bi-person-badge"></i>{" "}
              {editingEmployee ? "Edit Employee" : "Add New Employee"}
            </h5>
            <button className="btn btn-outline-secondary btn-sm" onClick={handleCancelForm}>
              <i className="bi bi-x-lg"></i> Close
            </button>
          </div>
          <EmployeeForm
            onSubmit={handleFormSubmit}
            onCancel={handleCancelForm}
            initialData={editingEmployee}
          />
        </div>
      ) : (
        <div className="list-section fade-in" ref={listRef}>
          <div className="machine-banner position-relative text-white mb-3 rounded px-4 py-3 shadow-sm d-flex justify-content-between align-items-center" style={{ backgroundColor: '#002952' }}>
            <div>
              <h5 className="fw-bold mb-1 text-uppercase tracking-wider">Employee Management</h5>
              <p className="mb-0 text-white-50" style={{ fontSize: '0.8rem' }}>Comprehensive oversight and administration of employees</p>
            </div>
            <div>
              <span className="badge bg-light text-dark fs-6 rounded-pill px-3 py-2 shadow-sm">
                Total Employees: <span className="fw-bold text-primary ms-1 fs-5">{totalEmployees}</span>
              </span>
            </div>
          </div>
          <EmployeeListWrapper onEdit={handleEditClick} onTotalLoaded={setTotalEmployees} />
        </div>
      )}
    </div>
  );
};

const EmployeeListWrapper = ({ onEdit, onTotalLoaded }) => {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const handleRefresh = () => setRefreshKey((prev) => prev + 1);
    window.addEventListener("refreshEmployees", handleRefresh);
    return () => window.removeEventListener("refreshEmployees", handleRefresh);
  }, []);

  return <EmployeeList key={refreshKey} onEdit={onEdit} onTotalLoaded={onTotalLoaded} />;
};

export default ManageEmployee;
