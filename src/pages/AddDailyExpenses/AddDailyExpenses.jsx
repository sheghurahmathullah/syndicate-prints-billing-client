import "./AddDailyExpenses.css";
import { useState, useEffect } from "react";
import { fetchBranches } from "../../Service/BranchService.js";
import { fetchExpenseItemsByType, saveDailyExpenses, fetchLastClosedAmount } from "../../Service/DailyExpensesService.js";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner.jsx";

const AddDailyExpenses = () => {
  // Basic Info
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [branches, setBranches] = useState([]);
  
  // Cash & Image
  const [cashInHand, setCashInHand] = useState("");
  const [lastClosed, setLastClosed] = useState("");
  const [shortage, setShortage] = useState("");
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
  const [initialLoading, setInitialLoading] = useState(true);

  // Fetch branches on mount
  useEffect(() => {
    const initData = async () => {
      setInitialLoading(true);
      await Promise.all([loadBranches(), loadDailyExpenseItems()]);
      setInitialLoading(false);
    };
    initData();
  }, []);

  // Auto-fetch Last Closed whenever currentDate or selectedBranch changes
  useEffect(() => {
    const loadLastClosed = async () => {
      if (!currentDate) return;
      try {
        const response = await fetchLastClosedAmount(selectedBranch, currentDate);
        if (response.data && response.data.lastClosed !== undefined) {
          setLastClosed(response.data.lastClosed || 0);
        }
      } catch (error) {
        console.error("Error auto-fetching last closed amount:", error);
      }
    };
    loadLastClosed();
  }, [currentDate, selectedBranch]);

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

  const preventNegativeAndExpKeys = (e) => {
    if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
      e.preventDefault();
    }
  };

  const disableWheelScroll = (e) => {
    e.target.blur();
  };

  // Dynamic row handlers
  const addOtherExpense = () => {
    setOtherExpenses([...otherExpenses, { type: "", amount: "" }]);
  };

  const removeOtherExpense = (index) => {
    setOtherExpenses(otherExpenses.filter((_, i) => i !== index));
  };

  const updateOtherExpense = (index, field, value) => {
    if (field === "amount" && value !== "" && parseFloat(value) < 0) return;
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
    if (field === "amount" && value !== "" && parseFloat(value) < 0) return;
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
    if (field === "amount" && value !== "" && parseFloat(value) < 0) return;
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
    if (field === "amount" && value !== "" && parseFloat(value) < 0) return;
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
    if (field === "amount" && value !== "" && parseFloat(value) < 0) return;
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
    if ((field === "currentReading" || field === "oldReading") && value !== "" && parseFloat(value) < 0) return;
    const updated = [...machineReadings];
    updated[index][field] = value;
    
    // Auto-calculate diff when current or old reading changes
    if (field === "currentReading" || field === "oldReading") {
      const currentStr = updated[index].currentReading;
      const oldStr = updated[index].oldReading;
      if (currentStr !== "" || oldStr !== "") {
        const current = parseFloat(currentStr) || 0;
        const old = parseFloat(oldStr) || 0;
        updated[index].diff = (current - old).toString();
      } else {
        updated[index].diff = "0";
      }
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
        lastClosed: parseFloat(lastClosed) || 0,
        shortage: parseFloat(shortage) || 0,
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
    setLastClosed("");
    setShortage("");
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

  if (initialLoading) {
    return (
      <div className="add-daily-expenses-container p-4">
        <LoadingSpinner message="Initializing daily expenses ledger & branch metadata..." minHeight="400px" />
      </div>
    );
  }

  return (
    <div className="add-daily-expenses-container fade-in">
      {/* Header Banner */}
      <div className="daily-expenses-header">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div>
            <h2 className="mb-1">Daily Operations Expense Ledger</h2>
            <p className="mb-0">Record cash balances, itemized daily expenses, payments & machine counter readings</p>
          </div>
          
          {/* Top Cash Card Widget */}
          <div className="total-cash-widget">
            <div className="widget-label">
              Total Cash Balance
            </div>
            <div className="widget-input-group">
              <span className="currency-prefix">₹</span>
              <input
                type="number"
                min="0"
                onKeyDown={preventNegativeAndExpKeys}
                onWheel={disableWheelScroll}
                className="widget-input"
                placeholder="0.00"
                value={totalCash}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val !== "" && parseFloat(val) < 0) return;
                  setTotalCash(val);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="daily-expenses-form">
        {/* Date & Branch Card */}
        <div className="ops-card mb-4">
          <h4 className="ops-card-title">
            Branch & Ledger Date
          </h4>
          <div className="row g-3">
            <div className="col-md-6">
              <div className="rich-form-group">
                <label className="rich-form-label">Ledger Date <span className="text-danger">*</span></label>
                <div className="rich-input-group">
                  <input
                    type="date"
                    className="rich-form-control"
                    value={currentDate}
                    onChange={(e) => setCurrentDate(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="rich-form-group">
                <label className="rich-form-label">Operating Branch <span className="text-danger">*</span></label>
                <div className="rich-input-group">
                  <select
                    className="rich-form-control"
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    required
                  >
                    <option value="">Select Operating Branch</option>
                    {branches.map((branch) => (
                      <option key={branch.branchId || branch.id} value={branch.branchName || branch.name || branch.branchId}>
                        {branch.branchName || branch.name || branch.branchId}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cash in Hand, Last Closed, Shortage & Image Card */}
        <div className="ops-card mb-4">
          <h4 className="ops-card-title">
            Cash Balances, Last Closed, Shortage & Voucher Receipt
          </h4>
          <div className="row g-3">
            <div className="col-md-4">
              <div className="rich-form-group">
                <label className="rich-form-label">Cash in Hand</label>
                <div className="ops-amount-group">
                  <span className="ops-currency-addon">₹</span>
                  <input
                    type="number"
                    min="0"
                    onKeyDown={preventNegativeAndExpKeys}
                    onWheel={disableWheelScroll}
                    className="ops-amount-input"
                    placeholder="0.00"
                    value={cashInHand}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val !== "" && parseFloat(val) < 0) return;
                      setCashInHand(val);
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="rich-form-group">
                <label className="rich-form-label d-flex align-items-center justify-content-between">
                  <span>Last Closed</span>
                  <span className="badge bg-light text-primary border me-1 fw-semibold" style={{ fontSize: "11px" }}>
                    Auto-calculated
                  </span>
                </label>
                <div className="ops-amount-group">
                  <span className="ops-currency-addon">₹</span>
                  <input
                    type="number"
                    className="ops-amount-input bg-light text-secondary fw-bold"
                    placeholder="0.00"
                    value={lastClosed !== "" ? lastClosed : 0}
                    readOnly
                    tabIndex="-1"
                  />
                </div>
                <small className="text-muted fs-7 mt-1 d-block">
                  Previous day's Cash in Hand
                </small>
              </div>
            </div>
            <div className="col-md-4">
              <div className="rich-form-group">
                <label className="rich-form-label">Shortage</label>
                <div className="ops-amount-group">
                  <span className="ops-currency-addon">₹</span>
                  <input
                    type="number"
                    min="0"
                    onKeyDown={preventNegativeAndExpKeys}
                    onWheel={disableWheelScroll}
                    className="ops-amount-input"
                    placeholder="0.00"
                    value={shortage}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val !== "" && parseFloat(val) < 0) return;
                      setShortage(val);
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="col-md-12 mt-2">
              <div className="rich-form-group">
                <label className="rich-form-label">Upload Proof Image / Receipt</label>
                <label className="custom-file-upload-box">
                  <div className="upload-text-box">
                    <span className="upload-title">
                      {cashImage ? cashImage.name : "Click to select receipt / voucher photo"}
                    </span>
                    <span className="upload-sub">
                      {cashImage ? "File selected • Click to change" : "Supports JPG, PNG, WEBP files"}
                    </span>
                  </div>
                  <input
                    type="file"
                    className="d-none"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Type Expense Items Section */}
        {dailyExpenseItems.length > 0 && (
          <div className="ops-card mb-4">
            <h4 className="ops-card-title">
              Itemized Daily Operating Expenses
            </h4>
            <div className="expense-items-grid">
              {dailyExpenseItems.map((item) => (
                <div key={item.expenseItemId} className="ops-item-box">
                  <label className="ops-item-label">{item.name}</label>
                  <div className="ops-amount-group">
                    <span className="ops-currency-addon">₹</span>
                    <input
                      type="number"
                      min="0"
                      onKeyDown={preventNegativeAndExpKeys}
                      onWheel={disableWheelScroll}
                      className="ops-amount-input"
                      placeholder="0.00"
                      value={dailyItemAmounts[item.expenseItemId] || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val !== "" && parseFloat(val) < 0) return;
                        setDailyItemAmounts({
                          ...dailyItemAmounts,
                          [item.expenseItemId]: val
                        });
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Other Expenses and Advance Payments Card */}
        <div className="ops-card mb-4">
          <div className="row g-4">
            {/* Other Expenses */}
            <div className="col-lg-6">
              <h5 className="ops-subcard-title mb-3">
                Other Ad-hoc Expenses
              </h5>
              {otherExpenses.map((expense, index) => (
                <div key={index} className="ops-dynamic-row mb-2">
                  {index === 0 && (
                    <div className="row g-2 mb-1 px-1 text-muted fw-bold text-uppercase" style={{ fontSize: "0.72rem", letterSpacing: "0.03em" }}>
                      <div className="col-6">Expense Category</div>
                      <div className="col-5">Amount (₹)</div>
                      <div className="col-1"></div>
                    </div>
                  )}
                  <div className="row g-2 align-items-center">
                    <div className="col-6">
                      <input
                        type="text"
                        className="form-control form-control-sm ops-inner-input"
                        placeholder="Expense Purpose / Category"
                        value={expense.type}
                        onChange={(e) => updateOtherExpense(index, "type", e.target.value)}
                      />
                    </div>
                    <div className="col-5">
                      <div className="input-group input-group-sm">
                        <span className="input-group-text ops-light-addon fw-bold">₹</span>
                        <input
                          type="number"
                          min="0"
                          onKeyDown={preventNegativeAndExpKeys}
                          onWheel={disableWheelScroll}
                          className="form-control ops-inner-input"
                          placeholder="Amount"
                          value={expense.amount}
                          onChange={(e) => updateOtherExpense(index, "amount", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="col-1 text-end">
                      {otherExpenses.length > 1 && (
                        <button
                          type="button"
                          className="btn-trash-icon"
                          onClick={() => removeOtherExpense(index)}
                          title="Remove Row"
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
                className="btn btn-ops-outline mt-2"
                onClick={addOtherExpense}
              >
                + Add Other Expense
              </button>
            </div>

            {/* Advance Payments */}
            <div className="col-lg-6">
              <h5 className="ops-subcard-title mb-3">
                Staff / Vendor Advance Payments
              </h5>
              {advancePayments.map((payment, index) => (
                <div key={index} className="ops-dynamic-row mb-2">
                  {index === 0 && (
                    <div className="row g-2 mb-1 px-1 text-muted fw-bold text-uppercase" style={{ fontSize: "0.72rem", letterSpacing: "0.03em" }}>
                      <div className="col-6">Beneficiary / Purpose</div>
                      <div className="col-5">Amount (₹)</div>
                      <div className="col-1"></div>
                    </div>
                  )}
                  <div className="row g-2 align-items-center">
                    <div className="col-6">
                      <input
                        type="text"
                        className="form-control form-control-sm ops-inner-input"
                        placeholder="Advance Beneficiary / Purpose"
                        value={payment.type}
                        onChange={(e) => updateAdvancePayment(index, "type", e.target.value)}
                      />
                    </div>
                    <div className="col-5">
                      <div className="input-group input-group-sm">
                        <span className="input-group-text ops-light-addon fw-bold">₹</span>
                        <input
                          type="number"
                          min="0"
                          onKeyDown={preventNegativeAndExpKeys}
                          onWheel={disableWheelScroll}
                          className="form-control ops-inner-input"
                          placeholder="Amount"
                          value={payment.amount}
                          onChange={(e) => updateAdvancePayment(index, "amount", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="col-1 text-end">
                      {advancePayments.length > 1 && (
                        <button
                          type="button"
                          className="btn-trash-icon"
                          onClick={() => removeAdvancePayment(index)}
                          title="Remove Row"
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
                className="btn btn-ops-outline mt-2"
                onClick={addAdvancePayment}
              >
                + Add Advance Payment
              </button>
            </div>
          </div>
        </div>

        {/* Check Payments & Cash Deposits */}
        <div className="ops-card mb-4">
          <div className="row g-4">
            {/* Check Payments */}
            <div className="col-lg-6">
              <h5 className="ops-subcard-title mb-3">
                Cheque Payments Issued
              </h5>
              {checkPayments.map((payment, index) => (
                <div key={index} className="ops-dynamic-row mb-2">
                  {index === 0 && (
                    <div className="row g-2 mb-1 px-1 text-muted fw-bold text-uppercase" style={{ fontSize: "0.72rem", letterSpacing: "0.03em" }}>
                      <div className="col-6">Cheque No.</div>
                      <div className="col-5">Amount (₹)</div>
                      <div className="col-1"></div>
                    </div>
                  )}
                  <div className="row g-2 align-items-center">
                    <div className="col-6">
                      <input
                        type="text"
                        className="form-control form-control-sm ops-inner-input"
                        placeholder="Cheque No."
                        value={payment.checkNo}
                        onChange={(e) => updateCheckPayment(index, "checkNo", e.target.value)}
                      />
                    </div>
                    <div className="col-5">
                      <div className="input-group input-group-sm">
                        <span className="input-group-text ops-light-addon fw-bold">₹</span>
                        <input
                          type="number"
                          min="0"
                          onKeyDown={preventNegativeAndExpKeys}
                          onWheel={disableWheelScroll}
                          className="form-control ops-inner-input"
                          placeholder="Amount"
                          value={payment.amount}
                          onChange={(e) => updateCheckPayment(index, "amount", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="col-1 text-end">
                      {checkPayments.length > 1 && (
                        <button
                          type="button"
                          className="btn-trash-icon"
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
                className="btn btn-ops-outline mt-2"
                onClick={addCheckPayment}
              >
                + Add Cheque Payment
              </button>
            </div>

            {/* Cash Deposits */}
            <div className="col-lg-6">
              <h5 className="ops-subcard-title mb-3">
                Bank Cash Deposits
              </h5>
              {cashDeposits.map((deposit, index) => (
                <div key={index} className="ops-dynamic-row mb-2">
                  {index === 0 && (
                    <div className="row g-2 mb-1 px-1 text-muted fw-bold text-uppercase" style={{ fontSize: "0.72rem", letterSpacing: "0.03em" }}>
                      <div className="col-6">Deposit Ref / Sl. No.</div>
                      <div className="col-5">Amount (₹)</div>
                      <div className="col-1"></div>
                    </div>
                  )}
                  <div className="row g-2 align-items-center">
                    <div className="col-6">
                      <input
                        type="text"
                        className="form-control form-control-sm ops-inner-input"
                        placeholder="Deposit Ref / Sl. No."
                        value={deposit.refNo}
                        onChange={(e) => updateCashDeposit(index, "refNo", e.target.value)}
                      />
                    </div>
                    <div className="col-5">
                      <div className="input-group input-group-sm">
                        <span className="input-group-text ops-light-addon fw-bold">₹</span>
                        <input
                          type="number"
                          min="0"
                          onKeyDown={preventNegativeAndExpKeys}
                          onWheel={disableWheelScroll}
                          className="form-control ops-inner-input"
                          placeholder="Amount"
                          value={deposit.amount}
                          onChange={(e) => updateCashDeposit(index, "amount", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="col-1 text-end">
                      {cashDeposits.length > 1 && (
                        <button
                          type="button"
                          className="btn-trash-icon"
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
                className="btn btn-ops-outline mt-2"
                onClick={addCashDeposit}
              >
                + Add Bank Cash Deposit
              </button>
            </div>
          </div>
        </div>

        {/* Other Incomes & Machine Readings */}
        <div className="ops-card mb-4">
          <div className="row g-4">
            {/* Other Incomes */}
            <div className="col-lg-6">
              <h5 className="ops-subcard-title mb-3">
                Other Ancillary Incomes
              </h5>
              {otherIncomes.map((income, index) => (
                <div key={index} className="ops-dynamic-row mb-2">
                  {index === 0 && (
                    <div className="row g-2 mb-1 px-1 text-muted fw-bold text-uppercase" style={{ fontSize: "0.72rem", letterSpacing: "0.03em" }}>
                      <div className="col-6">Source / Reason</div>
                      <div className="col-5">Amount (₹)</div>
                      <div className="col-1"></div>
                    </div>
                  )}
                  <div className="row g-2 align-items-center">
                    <div className="col-6">
                      <input
                        type="text"
                        className="form-control form-control-sm ops-inner-input"
                        placeholder="Source / Reason"
                        value={income.reason}
                        onChange={(e) => updateOtherIncome(index, "reason", e.target.value)}
                      />
                    </div>
                    <div className="col-5">
                      <div className="input-group input-group-sm">
                        <span className="input-group-text ops-light-addon fw-bold">₹</span>
                        <input
                          type="number"
                          min="0"
                          onKeyDown={preventNegativeAndExpKeys}
                          onWheel={disableWheelScroll}
                          className="form-control ops-inner-input"
                          placeholder="Amount"
                          value={income.amount}
                          onChange={(e) => updateOtherIncome(index, "amount", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="col-1 text-end">
                      {otherIncomes.length > 1 && (
                        <button
                          type="button"
                          className="btn-trash-icon"
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
                className="btn btn-ops-outline mt-2"
                onClick={addOtherIncome}
              >
                + Add Income
              </button>
            </div>

            {/* Machine Readings */}
            <div className="col-lg-6">
              <h5 className="ops-subcard-title mb-3">
                Machine Counter Meter Readings
              </h5>
              {machineReadings.map((reading, index) => (
                <div key={index} className="ops-dynamic-row mb-2">
                  {index === 0 && (
                    <div className="row g-2 mb-1 px-1 text-muted fw-bold text-uppercase" style={{ fontSize: "0.72rem", letterSpacing: "0.03em" }}>
                      <div className="col-4">Machine Name</div>
                      <div className="col-3">Current</div>
                      <div className="col-2">Old</div>
                      <div className="col-2 text-center">Diff</div>
                      <div className="col-1"></div>
                    </div>
                  )}
                  <div className="row g-2 align-items-center">
                    <div className="col-4">
                      <input
                        type="text"
                        className="form-control form-control-sm ops-inner-input"
                        placeholder="Machine Name"
                        value={reading.machine}
                        onChange={(e) => updateMachineReading(index, "machine", e.target.value)}
                      />
                    </div>
                    <div className="col-3">
                      <input
                        type="number"
                        min="0"
                        onKeyDown={preventNegativeAndExpKeys}
                        onWheel={disableWheelScroll}
                        className="form-control form-control-sm ops-inner-input"
                        placeholder="Current"
                        value={reading.currentReading}
                        onChange={(e) => updateMachineReading(index, "currentReading", e.target.value)}
                      />
                    </div>
                    <div className="col-2">
                      <input
                        type="number"
                        min="0"
                        onKeyDown={preventNegativeAndExpKeys}
                        onWheel={disableWheelScroll}
                        className="form-control form-control-sm ops-inner-input"
                        placeholder="Old"
                        value={reading.oldReading}
                        onChange={(e) => updateMachineReading(index, "oldReading", e.target.value)}
                      />
                    </div>
                    <div className="col-2">
                      <span className="ops-diff-badge">
                        {reading.diff !== undefined && reading.diff !== "" ? (
                          parseFloat(reading.diff) > 0 ? `+${reading.diff}` : `${reading.diff}`
                        ) : '0'}
                      </span>
                    </div>
                    <div className="col-1 text-end">
                      {machineReadings.length > 1 && (
                        <button
                          type="button"
                          className="btn-trash-icon"
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
                className="btn btn-ops-outline mt-2"
                onClick={addMachineReading}
              >
                + Add Machine Counter
              </button>
            </div>
          </div>
        </div>

        {/* Submit Actions Footer */}
        <div className="d-flex align-items-center justify-content-end gap-3 my-4">
          <button
            type="button"
            className="btn btn-light border px-4 py-2 fw-bold"
            onClick={resetForm}
            disabled={loading}
          >
            Reset Form
          </button>
          <button
            type="submit"
            className="btn btn-ops-primary btn-lg px-5 shadow"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Saving Daily Expenses...
              </>
            ) : (
              "Save Daily Expenses Ledger"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddDailyExpenses;
