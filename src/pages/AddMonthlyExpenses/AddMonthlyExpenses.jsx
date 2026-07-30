import { useState, useEffect } from "react";
import { fetchBranches } from "../../Service/BranchService.js";
import { fetchExpenseItemsByType, saveMonthlyExpenses } from "../../Service/DailyExpensesService.js";
import toast from "react-hot-toast";

const AddMonthlyExpenses = () => {
  // Basic Info
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [branches, setBranches] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Monthly Expense Items
  const [monthlyExpenseItems, setMonthlyExpenseItems] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  
  // Loading state
  const [loading, setLoading] = useState(false);

  // Fetch branches and monthly expense items on mount
  useEffect(() => {
    loadBranches();
    loadMonthlyExpenseItems();
  }, []);

  const loadBranches = async () => {
    try {
      const response = await fetchBranches(0, 100);
      console.log("Branches API response:", response.data);
      const pageData = response.data.page || response.data;
      const content = response.data.content || pageData.content || [];
      console.log("Branches content:", content);
      setBranches(content);
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  const loadMonthlyExpenseItems = async () => {
    try {
      const response = await fetchExpenseItemsByType("MONTHLY");
      const items = response.data || [];
      setMonthlyExpenseItems(items);
      
      // Initialize expense data for each item
      const initialExpenseData = items.map(item => ({
        name: item.name,
        amount: "",
        paymentType: "Cash",
        isPaid: false
      }));
      setExpenseData(initialExpenseData);
    } catch (error) {
      console.error("Error fetching monthly expense items:", error);
    }
  };

  const updateExpenseData = (index, field, value) => {
    const updatedData = [...expenseData];
    if (field === "isPaid") {
      updatedData[index][field] = value;
    } else {
      updatedData[index][field] = value;
    }
    setExpenseData(updatedData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Filter out empty expense entries
      const expensiveData = expenseData
        .filter(exp => exp.name && exp.amount)
        .map(exp => ({
          name: exp.name,
          amount: parseFloat(exp.amount) || 0,
          paymentType: exp.paymentType,
          isPaid: exp.isPaid
        })) || [];

      // Prepare the payload - match backend MonthlyExpenseRequest structure
      const payload = {
        branch: selectedBranch || null,
        date: currentDate,
        month: parseInt(selectedMonth) || 0,
        year: parseInt(selectedYear) || 0,
        expensive: expensiveData
      };

      console.log("Sending payload:", payload);

      const response = await saveMonthlyExpenses(payload);
      toast.success("Monthly expenses saved successfully!");
      resetForm();
    } catch (error) {
      console.error("Error saving monthly expenses:", error);
      toast.error("Failed to save monthly expenses");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentDate(new Date().toISOString().split('T')[0]);
    setSelectedBranch("");
    setSelectedMonth(new Date().getMonth() + 1);
    setSelectedYear(new Date().getFullYear());
    
    // Reset expense data
    const initialExpenseData = monthlyExpenseItems.map(item => ({
      name: item.name,
      amount: "",
      paymentType: "Cash",
      isPaid: false
    }));
    setExpenseData(initialExpenseData);
  };

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" }
  ];

  const paymentTypes = ["Cash", "Bank Transfer", "Online Payment", "Check", "UPI"];

  return (
    <div className="add-monthly-expenses-container">
      <div className="monthly-expenses-header">
        <h2>
          <i className="bi bi-calendar-month me-2"></i>
          Add Monthly Expenses
        </h2>
        <p>Record your monthly recurring expenses and payments</p>
      </div>

      <form onSubmit={handleSubmit} className="monthly-expenses-form">
        {/* Date, Branch, Month, Year Section */}
        <div className="form-section">
          <h3 className="section-title">
            <i className="bi bi-info-circle me-2"></i>
            Basic Information
          </h3>
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-control"
                value={currentDate}
                onChange={(e) => setCurrentDate(e.target.value)}
                required
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Branch</label>
              <select
                className="form-select"
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                required
              >
                <option value="">Select Branch</option>
                {branches.length === 0 && (
                  <option disabled>No branches available</option>
                )}
                {branches.map((branch) => (
                  <option key={branch.branchId || branch.id} value={branch.branchName || branch.name || branch.branchId}>
                    {branch.branchName || branch.name || branch.branchId}
                  </option>
                ))}
              </select>
              {branches.length === 0 && (
                <small className="text-danger mt-1">No branches loaded. Please check console for errors.</small>
              )}
            </div>
            <div className="col-md-3">
              <label className="form-label">Month</label>
              <select
                className="form-select"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                required
              >
                {months.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Year</label>
              <input
                type="number"
                className="form-control"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                min="2020"
                max="2030"
                required
              />
            </div>
          </div>
        </div>

        {/* Monthly Expense Items Section */}
        <div className="form-section">
          <h3 className="section-title">
            <i className="bi bi-list-check me-2"></i>
            Monthly Expenses
          </h3>
          <div className="monthly-expenses-grid">
            {monthlyExpenseItems.map((item, index) => (
              <div key={item.expenseItemId || index} className="expense-item-card">
                <div className="expense-item-header">
                  <h5 className="expense-item-name">{item.name}</h5>
                </div>
                <div className="expense-item-body">
                  <div className="row g-2">
                    <div className="col-md-4">
                      <label className="form-label small">Amount</label>
                      <div className="input-group">
                        <span className="input-group-text">₹</span>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="0.00"
                          value={expenseData[index]?.amount || ""}
                          onChange={(e) => updateExpenseData(index, "amount", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small">Payment Type</label>
                      <select
                        className="form-select"
                        value={expenseData[index]?.paymentType || "Cash"}
                        onChange={(e) => updateExpenseData(index, "paymentType", e.target.value)}
                      >
                        {paymentTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small">Status</label>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`paid-${index}`}
                          checked={expenseData[index]?.isPaid || false}
                          onChange={(e) => updateExpenseData(index, "isPaid", e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor={`paid-${index}`}>
                          {expenseData[index]?.isPaid ? "Paid" : "Unpaid"}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Saving...
              </>
            ) : (
              <>
                <i className="bi bi-save me-2"></i>
                Save Monthly Expenses
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddMonthlyExpenses;
