import "./ManageExpenseItem.css";
import ExpenseItemForm from "../../components/ExpenseItemForm/ExpenseItemForm.jsx";
import ExpenseItemList from "../../components/ExpenseItemList/ExpenseItemList.jsx";
import { useState, useEffect } from "react";
import { fetchExpenseItems } from "../../Service/ExpenseService.js";

const ManageExpenseItem = () => {
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [expenseItems, setExpenseItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filterName, setFilterName] = useState("");
  const [filterType, setFilterType] = useState("");

  const loadExpenseItems = async (typeOverride = null, nameOverride = null) => {
    setLoading(true);
    try {
      const typeToUse = typeOverride !== null ? typeOverride : (filterType || null);
      const nameToUse = nameOverride !== null ? nameOverride : (filterName || null);
      
      const response = await fetchExpenseItems(page, size, "name", typeToUse, nameToUse);
      console.log("API Response:", response.data);
      
      const pageData = response.data.page || response.data;
      const content = response.data.content || pageData.content || [];
      const totalPages = pageData.totalPages || 0;
      const totalElements = pageData.totalElements || 0;

      setExpenseItems(content);
      setTotalPages(totalPages);
      setTotalElements(totalElements);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenseItems();
  }, [page, size]);

  const handleNameSearch = (e) => {
    if (e.key === 'Enter') {
      setPage(0);
      loadExpenseItems(null, filterName);
    }
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setFilterType(newType);
    setPage(0);
    loadExpenseItems(newType, null);
  };

  const handleAddItem = () => {
    setEditData(null);
    setShowForm(true);
  };

  const handleEdit = (item) => {
    setEditData(item);
    setShowForm(true);
  };

  const handleFormSubmit = (data) => {
    setShowForm(false);
    setEditData(null);
    loadExpenseItems();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditData(null);
  };

  const refreshList = () => {
    loadExpenseItems();
  };

  return (
    <div className="expense-item-container">
      {/* Banner */}
      <div className="expense-item-banner">
        <div className="banner-content">
          <h2>
            <i className="bi bi-receipt"></i>
            Expense Item Management
          </h2>
          <p>Manage your expense items - add, edit, and organize daily and monthly expenses</p>
        </div>
        {!showForm && (
          <div className="d-flex align-items-center gap-3">
            <span className="total-items-count">
              <i className="bi bi-list-check me-2"></i>
              Total: {totalElements}
            </span>
            <button
              className="btn btn-primary add-item-btn"
              onClick={handleAddItem}
            >
              <i className="bi bi-plus-circle"></i>
              Add Item
            </button>
          </div>
        )}
      </div>

      <div className="expense-item-content">
        {!showForm && (
          <div className="filter-card mb-4">
            <div className="row g-3">
              <div className="col-md-6">
                <label htmlFor="filterName" className="form-label fw-bold">Search by Name</label>
                <input
                  type="text"
                  id="filterName"
                  className="form-control"
                  placeholder="Enter expense item name..."
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  onKeyDown={handleNameSearch}
                />
              </div>
              <div className="col-md-6">
                <label htmlFor="filterType" className="form-label fw-bold">Filter by Type</label>
                <select
                  id="filterType"
                  className="form-select"
                  value={filterType}
                  onChange={handleTypeChange}
                >
                  <option value="">All Types</option>
                  <option value="DAILY">Daily</option>
                  <option value="MONTHLY">Monthly</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {showForm ? (
          <div className="form-section">
            <ExpenseItemForm
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              editData={editData}
            />
          </div>
        ) : (
          <div className="list-section">
            <ExpenseItemList
              onEdit={handleEdit}
              expenseItems={expenseItems}
              loading={loading}
              page={page}
              setPage={setPage}
              size={size}
              setSize={setSize}
              totalPages={totalPages}
              refreshList={refreshList}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageExpenseItem;
