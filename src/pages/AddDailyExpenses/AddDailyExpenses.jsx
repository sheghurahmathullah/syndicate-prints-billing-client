import "./AddDailyExpenses.css";
import { useState, useEffect } from "react";
import { fetchBranches } from "../../Service/BranchService.js";
import { fetchExpenseItemsByType, saveDailyExpenses } from "../../Service/DailyExpensesService.js";
import toast from "react-hot-toast";

const AddDailyExpenses = () => {
  // Basic Info
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [branches, setBranches] = useState([]);
  
  // Cash & Image
  const [cashInHand, setCashInHand] = useState("");
  const [cashImage, setCashImage] = useState(null);
  const [totalCash, setTotalCash] = useState("");
  
  // Daily Type Expense Items
  const [dailyExpenseItems, setDailyExpenseItems] = useState([]);
  const [dailyItemAmounts, setDailyItemAmounts] = useState({});
  
  // Other Expenses (Dynamic)
  const [otherExpenses, setOtherExpenses] = useState([{ type: "", amount: "" }]);
  
  // Advance Paid (Dynamic)
  const [advancePayments, setAdvancePayments] = useState([{ type: "", amount: "" }]);
  
  // Check Payments (Dynamic)
  const [checkPayments, setCheckPayments] = useState([{ checkNo: "", amount: "" }]);
  
  // Cash Deposits (Dynamic)
  const [cashDeposits, setCashDeposits] = useState([{ refNo: "", amount: "" }]);
  
  // Other Incomes (Dynamic)
  const [otherIncomes, setOtherIncomes] = useState([{ reason: "", amount: "" }]);
  
  // Machine Readings (Dynamic)
  const [machineReadings, setMachineReadings] = useState([{ 
    machine: "", 
    currentReading: "", 
    oldReading: "", 
    diff: "" 
  }]);
  
  const [loading, setLoading] = useState(false);

  // Fetch branches on mount
  useEffect(() => {
    loadBranches();
    loadDailyExpenseItems();
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

  const loadDailyExpenseItems = async () => {
    try {
      const response = await fetchExpenseItemsByType("DAILY");
      const items = response.data || [];
      setDailyExpenseItems(items);
      
      // Initialize amounts for each item
      const initialAmounts = {};
      items.forEach(item => {
        initialAmounts[item.expenseItemId] = "";
      });
      setDailyItemAmounts(initialAmounts);
    } catch (error) {
      console.error("Error fetching daily expense items:", error);
      toast.error("Failed to load daily expense items");
    }
  };

  // Dynamic row handlers
  const addOtherExpense = () => {
    setOtherExpenses([...otherExpenses, { type: "", amount: "" }]);
  };

  const removeOtherExpense = (index) => {
    setOtherExpenses(otherExpenses.filter((_, i) => i !== index));
  };

  const updateOtherExpense = (index, field, value) => {
    const updated = [...otherExpenses];
    updated[index][field] = value;
    setOtherExpenses(updated);
  };

  const addAdvancePayment = () => {
    setAdvancePayments([...advancePayments, { type: "", amount: "" }]);
  };

  const removeAdvancePayment = (index) => {
    setAdvancePayments(advancePayments.filter((_, i) => i !== index));
  };

  const updateAdvancePayment = (index, field, value) => {
    const updated = [...advancePayments];
    updated[index][field] = value;
    setAdvancePayments(updated);
  };

  const addCheckPayment = () => {
    setCheckPayments([...checkPayments, { checkNo: "", amount: "" }]);
  };

  const removeCheckPayment = (index) => {
    setCheckPayments(checkPayments.filter((_, i) => i !== index));
  };

  const updateCheckPayment = (index, field, value) => {
    const updated = [...checkPayments];
    updated[index][field] = value;
    setCheckPayments(updated);
  };

  const addCashDeposit = () => {
    setCashDeposits([...cashDeposits, { refNo: "", amount: "" }]);
  };

  const removeCashDeposit = (index) => {
    setCashDeposits(cashDeposits.filter((_, i) => i !== index));
  };

  const updateCashDeposit = (index, field, value) => {
    const updated = [...cashDeposits];
    updated[index][field] = value;
    setCashDeposits(updated);
  };

  const addOtherIncome = () => {
    setOtherIncomes([...otherIncomes, { reason: "", amount: "" }]);
  };

  const removeOtherIncome = (index) => {
    setOtherIncomes(otherIncomes.filter((_, i) => i !== index));
  };

  const updateOtherIncome = (index, field, value) => {
    const updated = [...otherIncomes];
    updated[index][field] = value;
    setOtherIncomes(updated);
  };

  const addMachineReading = () => {
    setMachineReadings([...machineReadings, { machine: "", currentReading: "", oldReading: "", diff: "" }]);
  };

  const removeMachineReading = (index) => {
    setMachineReadings(machineReadings.filter((_, i) => i !== index));
  };

  const updateMachineReading = (index, field, value) => {
    const updated = [...machineReadings];
    updated[index][field] = value;
    
    // Auto-calculate diff when current or old reading changes
    if (field === "currentReading" || field === "oldReading") {
      const current = parseFloat(updated[index].currentReading) || 0;
      const old = parseFloat(updated[index].oldReading) || 0;
      updated[index].diff = (current - old).toString();
    }
    
    setMachineReadings(updated);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCashImage(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert image to base64 if exists
      let imageData = null;
      if (cashImage) {
        imageData = await convertFileToBase64(cashImage);
      }

      // Prepare daily expense items with amounts - map to expensive format
      const expensiveData = dailyExpenseItems
        .filter(item => dailyItemAmounts[item.expenseItemId])
        .map(item => ({
          itemName: item.name,
          price: parseFloat(dailyItemAmounts[item.expenseItemId]) || 0
        }));

      // Prepare the payload - match backend DailyExpenseRequest structure
      const payload = {
        date: currentDate,
        branch: selectedBranch || null,
        cashInHand: parseFloat(cashInHand) || 0,
        image: imageData,
        totalCash: parseFloat(totalCash) || 0,
        expensive: expensiveData,
        otherExpensive: otherExpenses
          .filter(exp => exp.type && exp.amount)
          .map(exp => ({
            type: exp.type,
            amount: parseFloat(exp.amount) || 0
          })) || [],
        advancePaid: advancePayments
          .filter(ap => ap.type && ap.amount)
          .map(ap => ({
            type: ap.type,
            amount: parseFloat(ap.amount) || 0
          })) || [],
        checkPayment: checkPayments
          .filter(cp => cp.checkNo && cp.amount)
          .map(cp => ({
            checkNo: cp.checkNo,
            amount: parseFloat(cp.amount) || 0
          })) || [],
        cashDeposit: cashDeposits
          .filter(cd => cd.refNo && cd.amount)
          .map(cd => ({
            refNo: cd.refNo,
            amount: parseFloat(cd.amount) || 0
          })) || [],
        otherIncomes: otherIncomes
          .filter(oi => oi.reason && oi.amount)
          .map(oi => ({
            reason: oi.reason,
            amount: parseFloat(oi.amount) || 0
          })) || [],
        machineReading: machineReadings
          .filter(mr => mr.machine && mr.currentReading)
          .map(mr => ({
            machine: mr.machine,
            currentReading: parseFloat(mr.currentReading) || 0,
            oldReading: parseFloat(mr.oldReading) || 0,
            difference: parseFloat(mr.diff) || 0
          })) || []
      };

      console.log("Sending payload:", JSON.stringify(payload, null, 2));

      const response = await saveDailyExpenses(payload);
      if (response.status === 200 || response.status === 201) {
        toast.success("Daily expenses saved successfully!");
        resetForm();
      }
    } catch (error) {
      console.error("Error saving daily expenses:", error);
      toast.error("Failed to save daily expenses");
    } finally {
      setLoading(false);
    }
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const resetForm = () => {
    setCurrentDate(new Date().toISOString().split('T')[0]);
    setSelectedBranch("");
    setCashInHand("");
    setCashImage(null);
    setTotalCash("");
    setDailyItemAmounts({});
    setOtherExpenses([{ type: "", amount: "" }]);
    setAdvancePayments([{ type: "", amount: "" }]);
    setCheckPayments([{ checkNo: "", amount: "" }]);
    setCashDeposits([{ refNo: "", amount: "" }]);
    setOtherIncomes([{ reason: "", amount: "" }]);
    setMachineReadings([{ machine: "", currentReading: "", oldReading: "", diff: "" }]);
  };

  return (
    <div className="add-daily-expenses-container">
      <div className="daily-expenses-header">
        <h2>
          <i className="bi bi-calendar-check me-2"></i>
          Add Daily Expenses
        </h2>
        <p>Record your daily expenses, payments, and machine readings</p>
      </div>

      {/* Total Cash - Top Right Corner */}
      <div className="total-cash-corner">
        <label className="total-cash-label">Total Cash</label>
        <div className="input-group">
          <span className="input-group-text">₹</span>
          <input
            type="number"
            className="form-control total-cash-input"
            placeholder="0.00"
            value={totalCash}
            onChange={(e) => setTotalCash(e.target.value)}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="daily-expenses-form">
        {/* Date and Branch Section */}
        <div className="form-section">
          <h3 className="section-title">
            <i className="bi bi-info-circle me-2"></i>
            Basic Information
          </h3>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-control"
                value={currentDate}
                onChange={(e) => setCurrentDate(e.target.value)}
                required
              />
            </div>
            <div className="col-md-6">
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
          </div>
        </div>

        {/* Cash in Hand and Image Section */}
        <div className="form-section">
          <h3 className="section-title">
            <i className="bi bi-cash me-2"></i>
            Cash Information
          </h3>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Cash in Hand (₹)</label>
              <input
                type="number"
                className="form-control"
                placeholder="Enter cash in hand..."
                value={cashInHand}
                onChange={(e) => setCashInHand(e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">Upload Image</label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
          </div>
        </div>

        {/* Daily Type Expense Items Section */}
        <div className="form-section">
          <h3 className="section-title">
            <i className="bi bi-list-check me-2"></i>
            Daily Expense Items
          </h3>
          <div className="expense-items-grid">
            {dailyExpenseItems.map((item) => (
              <div key={item.expenseItemId} className="expense-item-row">
                <label className="expense-item-label">{item.name}</label>
                <div className="input-group">
                  <span className="input-group-text">₹</span>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Amount"
                    value={dailyItemAmounts[item.expenseItemId] || ""}
                    onChange={(e) =>
                      setDailyItemAmounts({
                        ...dailyItemAmounts,
                        [item.expenseItemId]: e.target.value
                      })
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Other Expenses and Advance Payments Section */}
        <div className="form-section">
          <div className="row">
            {/* Other Expenses - Left Side */}
            <div className="col-md-6">
              <h3 className="section-title">
                <i className="bi bi-plus-circle me-2"></i>
                Other Expenses
              </h3>
              {otherExpenses.map((expense, index) => (
                <div key={index} className="dynamic-row">
                  <div className="row g-2">
                    <div className="col-md-6">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Type"
                        value={expense.type}
                        onChange={(e) => updateOtherExpense(index, "type", e.target.value)}
                      />
                    </div>
                    <div className="col-md-5">
                      <div className="input-group">
                        <span className="input-group-text">₹</span>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Amount"
                          value={expense.amount}
                          onChange={(e) => updateOtherExpense(index, "amount", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="col-md-1">
                      {otherExpenses.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => removeOtherExpense(index)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-outline-primary btn-sm mt-2"
                onClick={addOtherExpense}
              >
                <i className="bi bi-plus-lg me-1"></i>
                Add Expense
              </button>
            </div>

            {/* Advance Payments - Right Side */}
            <div className="col-md-6">
              <h3 className="section-title">
                <i className="bi bi-currency-rupee me-2"></i>
                Advance Payments
              </h3>
              {advancePayments.map((payment, index) => (
                <div key={index} className="dynamic-row">
                  <div className="row g-2">
                    <div className="col-md-6">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Type"
                        value={payment.type}
                        onChange={(e) => updateAdvancePayment(index, "type", e.target.value)}
                      />
                    </div>
                    <div className="col-md-5">
                      <div className="input-group">
                        <span className="input-group-text">₹</span>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Amount"
                          value={payment.amount}
                          onChange={(e) => updateAdvancePayment(index, "amount", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="col-md-1">
                      {advancePayments.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => removeAdvancePayment(index)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-outline-primary btn-sm mt-2"
                onClick={addAdvancePayment}
              >
                <i className="bi bi-plus-lg me-1"></i>
                Add Advance Payment
              </button>
            </div>
          </div>
        </div>

        {/* Check Payments and Cash Deposits Section */}
        <div className="form-section">
          <div className="row">
            {/* Check Payments - Left Side */}
            <div className="col-md-6">
              <h3 className="section-title">
                <i className="bi bi-card-checklist me-2"></i>
                Check Payments
              </h3>
              {checkPayments.map((payment, index) => (
                <div key={index} className="dynamic-row">
                  <div className="row g-2">
                    <div className="col-md-6">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Check Number"
                        value={payment.checkNo}
                        onChange={(e) => updateCheckPayment(index, "checkNo", e.target.value)}
                      />
                    </div>
                    <div className="col-md-5">
                      <div className="input-group">
                        <span className="input-group-text">₹</span>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Amount"
                          value={payment.amount}
                          onChange={(e) => updateCheckPayment(index, "amount", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="col-md-1">
                      {checkPayments.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => removeCheckPayment(index)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-outline-primary btn-sm mt-2"
                onClick={addCheckPayment}
              >
                <i className="bi bi-plus-lg me-1"></i>
                Add Check Payment
              </button>
            </div>

            {/* Cash Deposits - Right Side */}
            <div className="col-md-6">
              <h3 className="section-title">
                <i className="bi bi-bank me-2"></i>
                Cash Deposits
              </h3>
              {cashDeposits.map((deposit, index) => (
                <div key={index} className="dynamic-row">
                  <div className="row g-2">
                    <div className="col-md-6">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Reference Number"
                        value={deposit.refNo}
                        onChange={(e) => updateCashDeposit(index, "refNo", e.target.value)}
                      />
                    </div>
                    <div className="col-md-5">
                      <div className="input-group">
                        <span className="input-group-text">₹</span>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Amount"
                          value={deposit.amount}
                          onChange={(e) => updateCashDeposit(index, "amount", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="col-md-1">
                      {cashDeposits.length > 1 && (
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={() => removeCashDeposit(index)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-outline-primary btn-sm mt-2"
                onClick={addCashDeposit}
              >
                <i className="bi bi-plus-lg me-1"></i>
                Add Cash Deposit
              </button>
            </div>
          </div>
        </div>

        {/* Other Incomes Section */}
        <div className="form-section">
          <h3 className="section-title">
            <i className="bi bi-graph-up-arrow me-2"></i>
            Other Incomes
          </h3>
          {otherIncomes.map((income, index) => (
            <div key={index} className="dynamic-row">
              <div className="row g-2">
                <div className="col-md-6">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Reason"
                    value={income.reason}
                    onChange={(e) => updateOtherIncome(index, "reason", e.target.value)}
                  />
                </div>
                <div className="col-md-5">
                  <div className="input-group">
                    <span className="input-group-text">₹</span>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Amount"
                      value={income.amount}
                      onChange={(e) => updateOtherIncome(index, "amount", e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-1">
                  {otherIncomes.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => removeOtherIncome(index)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-outline-primary btn-sm mt-2"
            onClick={addOtherIncome}
          >
            <i className="bi bi-plus-lg me-1"></i>
            Add Income
          </button>
        </div>

        {/* Machine Readings Section */}
        <div className="form-section">
          <h3 className="section-title">
            <i className="bi bi-gear me-2"></i>
            Machine Readings
          </h3>
          {machineReadings.map((reading, index) => (
            <div key={index} className="dynamic-row machine-reading-row">
              <div className="row g-2">
                <div className="col-md-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Machine"
                    value={reading.machine}
                    onChange={(e) => updateMachineReading(index, "machine", e.target.value)}
                  />
                </div>
                <div className="col-md-2">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Current"
                    value={reading.currentReading}
                    onChange={(e) => updateMachineReading(index, "currentReading", e.target.value)}
                  />
                </div>
                <div className="col-md-2">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Old"
                    value={reading.oldReading}
                    onChange={(e) => updateMachineReading(index, "oldReading", e.target.value)}
                  />
                </div>
                <div className="col-md-2">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Diff"
                    value={reading.diff}
                    readOnly
                  />
                </div>
                <div className="col-md-2">
                  {machineReadings.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => removeMachineReading(index)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-outline-primary btn-sm mt-2"
            onClick={addMachineReading}
          >
            <i className="bi bi-plus-lg me-1"></i>
            Add Machine Reading
          </button>
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
                Save Daily Expenses
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddDailyExpenses;
