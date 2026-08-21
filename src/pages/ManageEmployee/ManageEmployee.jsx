import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import EmployeeList from "../../components/EmployeeList/EmployeeList.jsx";
import EmployeeForm from "../../components/EmployeeForm/EmployeeForm.jsx";
import { addEmployee, updateEmployee } from "../../Service/EmployeeService.js";
import "./ManageEmployee.css";

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
      <div className="manage-header-card mb-3">
        <div className="header-title-box">
          <div className="header-icon-badge">
            <i className="bi bi-people-fill"></i>
          </div>
          <div className="header-text">
            <h4 className="mb-0">Manage Employees</h4>
            <p className="text-muted small mb-0 d-none d-sm-block">Add, update and oversee your workforce team</p>
          </div>
        </div>
        {!showForm && (
          <button className="btn-premium-add" onClick={handleAddClick}>
            <i className="bi bi-person-plus-fill"></i>
            <span>Add Employee</span>
          </button>
        )}
      </div>

      {showForm ? (
        <div className="form-section fade-in">
          <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
            <h5 className="mb-0 fw-bold text-dark d-flex align-items-center gap-2">
              <i className="bi bi-person-badge text-primary"></i>{" "}
              {editingEmployee ? "Edit Employee Details" : "Add New Employee"}
            </h5>
            <button className="btn btn-outline-secondary btn-sm rounded-2" onClick={handleCancelForm}>
              <i className="bi bi-x-lg me-1"></i> Close
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
          <div className="employee-management-banner mb-3">
            <div>
              <h5 className="banner-title-text">Employee Management</h5>
              <p className="banner-subtitle-text">Comprehensive oversight and administration of employees</p>
            </div>
            <div className="banner-stat-badge">
              <span className="banner-stat-label">Total Employees:</span>
              <span className="banner-stat-value">{totalEmployees}</span>
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
