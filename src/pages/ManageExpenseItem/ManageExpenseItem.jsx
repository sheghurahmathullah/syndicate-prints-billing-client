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
    <div className="expense-item-container fade-in">
      {/* Banner Card */}
      <div className="expense-item-banner">
        <div className="banner-content d-flex align-items-center gap-3">
          <div className="banner-icon-box">
            <i className="bi bi-tags-fill"></i>
          </div>
          <div>
            <h2 className="mb-1">Expense Item Catalog</h2>
            <p className="mb-0">Configure operational expense categories for daily and monthly accounting</p>
          </div>
        </div>
        {!showForm && (
          <div className="d-flex align-items-center gap-3 mt-3 mt-md-0">
            <span className="total-items-badge">
              <i className="bi bi-collection-fill me-2"></i>
              {totalElements} Items Total
            </span>
            <button
              className="btn btn-ops-primary add-item-btn"
              onClick={handleAddItem}
            >
              <i className="bi bi-plus-lg me-1"></i>
              Add Expense Item
            </button>
          </div>
        )}
      </div>

      <div className="expense-item-content">
        {!showForm && (
          <div className="ops-filter-card mb-4">
            <div className="row g-3 align-items-center">
              <div className="col-md-7">
                <label htmlFor="filterName" className="ops-filter-label">Search Item Name</label>
                <div className="ops-input-wrapper">
                  <i className="bi bi-search ops-input-icon"></i>
                  <input
                    type="text"
                    id="filterName"
                    className="form-control ops-input"
                    placeholder="Search by name (press Enter)..."
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                    onKeyDown={handleNameSearch}
                  />
                  {filterName && (
                    <button className="btn-clear-search" onClick={() => { setFilterName(""); loadExpenseItems(null, ""); }}>
                      <i className="bi bi-x-circle-fill"></i>
                    </button>
                  )}
                </div>
              </div>
              <div className="col-md-5">
                <label htmlFor="filterType" className="ops-filter-label">Expense Category</label>
                <div className="ops-input-wrapper">
                  <i className="bi bi-funnel-fill ops-input-icon"></i>
                  <select
                    id="filterType"
                    className="form-select ops-select"
                    value={filterType}
                    onChange={handleTypeChange}
                  >
                    <option value="">All Expense Types</option>
                    <option value="DAILY">Daily Expense</option>
                    <option value="MONTHLY">Monthly Expense</option>
                  </select>
                </div>
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
