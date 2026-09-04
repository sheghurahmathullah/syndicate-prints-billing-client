import { useState, useEffect } from "react";
// Commented out existing backend PDF downloader as requested by user
// import { fetchDailyReports, downloadDailyExpensePdf } from "../../Service/ExpenseService.js";
import { fetchDailyReports } from "../../Service/ExpenseService.js";
import { fetchBranches } from "../../Service/BranchService.js";
import { exportDailyExpensesToExcel, exportSingleDailyExpenseToExcel } from "../../utils/excelExport.js";
import { exportSingleDailyExpenseToPdf } from "../../utils/pdfExport.js";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner.jsx";
import "./DailyExpenseReport.css";

const DailyExpenseReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null); // For Full-Page View Details
  const [viewMode, setViewMode] = useState("list"); // "list" | "detail"
  const [activeFilterPill, setActiveFilterPill] = useState("all");

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    branch: "",
  });

  useEffect(() => {
    loadBranches();
    loadData();
  }, []);

  const loadBranches = async () => {
    try {
      const response = await fetchBranches(0, 100);
      const branchList = response.data.content || response.data || [];
      setBranches(branchList);
    } catch (error) {
      console.error("Error fetching branches:", error);
      toast.error("Failed to load operating branches");
    }
  };

  const loadData = async (filterOverride = null) => {
    try {
      setLoading(true);
      const activeFilters = filterOverride || filters;
      const response = await fetchDailyReports(
        activeFilters.startDate,
        activeFilters.endDate,
        activeFilters.branch
      );
      setData(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching daily expense report:", error);
      toast.error("Failed to fetch daily expense ledgers");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setActiveFilterPill("custom");
  };

  const handleSearch = () => {
    loadData();
  };

  const handleResetFilters = () => {
    const resetState = { startDate: "", endDate: "", branch: "" };
    setFilters(resetState);
    setActiveFilterPill("all");
    loadData(resetState);
  };

  const handleQuickFilter = (type) => {
    setActiveFilterPill(type);
    const today = new Date();
    let start = "";
    let end = today.toISOString().split("T")[0];

    if (type === "today") {
      start = end;
    } else if (type === "last7") {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      start = d.toISOString().split("T")[0];
    } else if (type === "thisMonth") {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      start = firstDay.toISOString().split("T")[0];
    } else if (type === "all") {
      start = "";
      end = "";
    }

    const updated = { ...filters, startDate: start, endDate: end };
    setFilters(updated);
    loadData(updated);
  };

  /*
  // Existing backend PDF downloader commented out as requested by user
  const handleDownloadPdf = async (id) => {
    if (!id) return;
    try {
      const response = await downloadDailyExpensePdf(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `daily-expense-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Daily Ledger PDF downloaded!");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("Failed to download PDF report");
    }
  };
  */

  // New Single-Day PDF Generator Handler
  const handleDownloadSingleDayPdf = (row) => {
    if (!row) return;
    exportSingleDailyExpenseToPdf(row);
    toast.success("Single-day Daily Ledger PDF downloaded!");
  };

  const handleExportAllExcel = () => {
    if (!data || data.length === 0) {
      toast.error("No daily expense data available to export");
      return;
    }
    exportDailyExpensesToExcel(data, `Daily_Expenses_Report_${new Date().toISOString().split("T")[0]}.csv`);
    toast.success("Daily Expense Report exported to Excel!");
  };

  const handleExportSingleExcel = (row) => {
    exportSingleDailyExpenseToExcel(row);
    toast.success("Single Record exported to Excel!");
  };

  const openFullPageView = (row) => {
    setSelectedRecord(row);
    setViewMode("detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const backToListView = () => {
    setSelectedRecord(null);
    setViewMode("list");
  };

  // Extract unique expense keys across all rows
  const expenseKeys = Array.from(
    new Set(
      data.reduce((keys, row) => {
        if (row.expenses) {
          Object.keys(row.expenses).forEach((key) => keys.add(key));
        }
        return keys;
      }, new Set())
    )
  ).sort();

  // Aggregate Executive Totals
  const totals = data.reduce(
    (acc, row) => {
      acc.totalSales += row.totalSales || 0;
      acc.cashInHand += row.cashInHand || 0;
      acc.lastClosed += row.lastClosed || 0;
      acc.shortage += row.shortage || 0;

      let rowExpTotal = 0;
      expenseKeys.forEach((key) => {
        const val = (row.expenses && row.expenses[key]) || 0;
        acc.expenseTotals[key] = (acc.expenseTotals[key] || 0) + val;
        rowExpTotal += val;
      });

      if (Array.isArray(row.otherExpenses)) {
        row.otherExpenses.forEach((oe) => {
          rowExpTotal += parseFloat(oe.amount) || 0;
        });
      }

      acc.totalExpenses += rowExpTotal;
      return acc;
    },
    {
      totalSales: 0,
      cashInHand: 0,
      lastClosed: 0,
      shortage: 0,
      totalExpenses: 0,
      expenseTotals: {},
    }
  );

  // Helper to check if an array has non-zero data
  const hasValidArrayData = (arr, valField = "amount") => {
    if (!Array.isArray(arr) || arr.length === 0) return false;
    return arr.some((item) => {
      const val = parseFloat(item[valField]);
      return (!isNaN(val) && val > 0) || (item.type && item.type.trim() !== "") || (item.reason && item.reason.trim() !== "") || (item.refNo && item.refNo.trim() !== "") || (item.checkNo && item.checkNo.trim() !== "");
    });
  };

  // Helper to check if object has non-zero expense values
  const hasValidObjectData = (obj) => {
    if (!obj || typeof obj !== "object") return false;
    return Object.values(obj).some((v) => parseFloat(v) > 0);
  };

  // Calculate single record total expense
  const calculateRecordTotalExpense = (row) => {
    if (!row) return 0;
    let total = 0;
    if (row.expenses) {
      Object.values(row.expenses).forEach((v) => (total += parseFloat(v) || 0));
    }
    if (Array.isArray(row.otherExpenses)) {
      row.otherExpenses.forEach((e) => (total += parseFloat(e.amount) || 0));
    }
    if (Array.isArray(row.advancePayments)) {
      row.advancePayments.forEach((p) => (total += parseFloat(p.amount) || 0));
    }
    if (Array.isArray(row.checkPayments)) {
      row.checkPayments.forEach((c) => (total += parseFloat(c.amount) || 0));
    }
    return total;
  };

  /* ======================================================================== */
  /* RENDER FULL PAGE EXPENSES VIEW MODE                                      */
  /* ======================================================================== */
  if (viewMode === "detail" && selectedRecord) {
    const singleTotalExp = calculateRecordTotalExpense(selectedRecord);

    return (
      <div className="fullpage-expense-view fade-in">
        {/* Full Page Header Banner */}
        <div className="fullpage-view-header">
          <div className="d-flex align-items-center gap-3">
            <button type="button" className="btn-back-link" onClick={backToListView}>
              <i className="bi bi-arrow-left"></i> Back to All Ledgers
            </button>
            <div>
              <h3 className="mb-0 text-white fw-bold">
                Daily Operations Detailed Ledger
              </h3>
              <p className="mb-0 text-blue-200 small">
                Branch: <span className="fw-bold text-white me-3">{selectedRecord.branch || "N/A"}</span>
                Ledger Date: <span className="fw-bold text-white">{selectedRecord.date ? new Date(selectedRecord.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "N/A"}</span>
              </p>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn-banner-excel shadow-sm"
              onClick={() => handleExportSingleExcel(selectedRecord)}
            >
              <i className="bi bi-file-earmark-excel-fill"></i> Download Excel
            </button>
            <button
              type="button"
              className="btn btn-danger px-3 py-2 fw-bold shadow-sm"
              style={{ borderRadius: "12px", height: "42px" }}
              onClick={() => handleDownloadSingleDayPdf(selectedRecord)}
            >
              <i className="bi bi-file-earmark-pdf-fill me-1"></i> Download PDF
            </button>
          </div>
        </div>

        {/* Top Summary Stat Cards */}
        <div className="fp-summary-grid">
          <div className="fp-stat-card earned">
            <div className="fp-stat-icon blue">
              <i className="bi bi-graph-up-arrow"></i>
            </div>
            <div>
              <div className="fp-stat-title">Total Sales (Earned)</div>
              <div className="fp-stat-value text-primary">
                ₹{(selectedRecord.totalSales || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div className="fp-stat-card cash">
            <div className="fp-stat-icon cyan">
              <i className="bi bi-wallet2"></i>
            </div>
            <div>
              <div className="fp-stat-title">Cash In Hand</div>
              <div className="fp-stat-value text-info">
                ₹{(selectedRecord.cashInHand || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div className="fp-stat-card cash">
            <div className="fp-stat-icon blue">
              <i className="bi bi-door-closed-fill"></i>
            </div>
            <div>
              <div className="fp-stat-title">Last Closed</div>
              <div className="fp-stat-value text-secondary">
                ₹{(selectedRecord.lastClosed || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div className="fp-stat-card spent">
            <div className="fp-stat-icon red">
              <i className="bi bi-exclamation-triangle-fill"></i>
            </div>
            <div>
              <div className="fp-stat-title">Shortage</div>
              <div className="fp-stat-value text-warning">
                ₹{(selectedRecord.shortage || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div className="fp-stat-card spent">
            <div className="fp-stat-icon red">
              <i className="bi bi-receipt-cutoff"></i>
            </div>
            <div>
              <div className="fp-stat-title">Total Daily Expenses</div>
              <div className="fp-stat-value text-danger">
                ₹{singleTotalExp.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>

        {/* Full Page Details Grid (Skipping Zero / Empty Data) */}
        <div className="fp-details-grid">
          {/* 1. Catalog Operating Expenses */}
          {hasValidObjectData(selectedRecord.expenses) && (
            <div className="fp-detail-card">
              <h5 className="fp-detail-card-title text-danger">
                <i className="bi bi-tags-fill me-2"></i> Catalog Operating Expenses
              </h5>
              {Object.entries(selectedRecord.expenses)
                .filter(([_, amt]) => (parseFloat(amt) || 0) > 0)
                .map(([item, amt]) => (
                  <div key={item} className="fp-mini-item">
                    <span className="fp-item-label">{item}</span>
                    <span className="fp-item-value text-danger">₹{parseFloat(amt).toFixed(2)}</span>
                  </div>
                ))}
            </div>
          )}

          {/* 2. Other Ad-hoc Expenses */}
          {hasValidArrayData(selectedRecord.otherExpenses) && (
            <div className="fp-detail-card">
              <h5 className="fp-detail-card-title text-danger">
                <i className="bi bi-node-plus-fill me-2"></i> Other Ad-hoc Expenses
              </h5>
              {selectedRecord.otherExpenses
                .filter((exp) => (parseFloat(exp.amount) || 0) > 0)
                .map((exp, idx) => (
                  <div key={idx} className="fp-mini-item">
                    <span className="fp-item-label">{exp.type || "Ad-hoc Expense"}</span>
                    <span className="fp-item-value text-danger">₹{parseFloat(exp.amount).toFixed(2)}</span>
                  </div>
                ))}
            </div>
          )}

          {/* 3. Staff / Vendor Advance Payments */}
          {hasValidArrayData(selectedRecord.advancePayments) && (
            <div className="fp-detail-card">
              <h5 className="fp-detail-card-title text-danger">
                <i className="bi bi-cash-coin me-2"></i> Staff / Vendor Advance Payments
              </h5>
              {selectedRecord.advancePayments
                .filter((p) => (parseFloat(p.amount) || 0) > 0)
                .map((p, idx) => (
                  <div key={idx} className="fp-mini-item">
                    <span className="fp-item-label">{p.type || "Advance Beneficiary"}</span>
                    <span className="fp-item-value text-danger">₹{parseFloat(p.amount).toFixed(2)}</span>
                  </div>
                ))}
            </div>
          )}

          {/* 4. Cheque Payments Issued */}
          {hasValidArrayData(selectedRecord.checkPayments) && (
            <div className="fp-detail-card">
              <h5 className="fp-detail-card-title text-danger">
                <i className="bi bi-card-checklist me-2"></i> Cheque Payments Issued
              </h5>
              {selectedRecord.checkPayments
                .filter((c) => (parseFloat(c.amount) || 0) > 0)
                .map((c, idx) => (
                  <div key={idx} className="fp-mini-item">
                    <span className="fp-item-label">Cheque No: {c.checkNo || "N/A"}</span>
                    <span className="fp-item-value text-danger">₹{parseFloat(c.amount).toFixed(2)}</span>
                  </div>
                ))}
            </div>
          )}

          {/* 5. Bank Cash Deposits */}
          {hasValidArrayData(selectedRecord.cashDeposits) && (
            <div className="fp-detail-card">
              <h5 className="fp-detail-card-title text-primary">
                <i className="bi bi-bank2 me-2"></i> Bank Cash Deposits
              </h5>
              {selectedRecord.cashDeposits
                .filter((d) => (parseFloat(d.amount) || 0) > 0)
                .map((d, idx) => (
                  <div key={idx} className="fp-mini-item">
                    <span className="fp-item-label">Ref / Sl No: {d.refNo || "N/A"}</span>
                    <span className="fp-item-value text-primary">₹{parseFloat(d.amount).toFixed(2)}</span>
                  </div>
                ))}
            </div>
          )}

          {/* 6. Other Ancillary Incomes */}
          {hasValidArrayData(selectedRecord.otherIncomes) && (
            <div className="fp-detail-card">
              <h5 className="fp-detail-card-title text-success">
                <i className="bi bi-graph-up-arrow me-2"></i> Other Ancillary Incomes
              </h5>
              {selectedRecord.otherIncomes
                .filter((inc) => (parseFloat(inc.amount) || 0) > 0)
                .map((inc, idx) => (
                  <div key={idx} className="fp-mini-item">
                    <span className="fp-item-label">{inc.reason || "Income Reason"}</span>
                    <span className="fp-item-value text-success">₹{parseFloat(inc.amount).toFixed(2)}</span>
                  </div>
                ))}
            </div>
          )}

          {/* 6.5 Customer Credits Given */}
          {hasValidObjectData(selectedRecord.credits) && (
            <div className="fp-detail-card">
              <h5 className="fp-detail-card-title text-info">
                <i className="bi bi-person-lines-fill me-2"></i> Customer Credits Given
              </h5>
              {Object.entries(selectedRecord.credits)
                .filter(([_, amt]) => (parseFloat(amt) || 0) > 0)
                .map(([customer, amt]) => (
                  <div key={customer} className="fp-mini-item">
                    <span className="fp-item-label">{customer}</span>
                    <span className="fp-item-value text-info">₹{parseFloat(amt).toFixed(2)}</span>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* 7. Machine Counter Readings Table (Full Width) */}
        {hasValidArrayData(selectedRecord.machineReadings, "currentReading") && (
          <div className="fp-detail-card mb-4">
            <h5 className="fp-detail-card-title text-dark">
              <i className="bi bi-speedometer2 me-2 text-primary"></i> Machine Counter Meter Readings
            </h5>
            <div className="table-responsive">
              <table className="table table-bordered align-middle text-center mb-0">
                <thead className="bg-light text-dark fw-bold">
                  <tr>
                    <th>Machine Name</th>
                    <th>Current Reading</th>
                    <th>Old Reading</th>
                    <th>Meter Units Run</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedRecord.machineReadings.map((m, idx) => {
                    const cur = parseFloat(m.currentReading) || 0;
                    const old = parseFloat(m.oldReading) || 0;
                    const diff = cur - old;
                    return (
                      <tr key={idx}>
                        <td className="fw-bold">{m.machine || "Machine"}</td>
                        <td className="text-primary fw-bold">{cur}</td>
                        <td className="text-muted">{old}</td>
                        <td className="fw-bold text-success">+{diff >= 0 ? diff : 0}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bottom Actions Footer */}
        <div className="d-flex align-items-center justify-content-between my-4">
          <button type="button" className="btn btn-outline-secondary px-4 py-2 fw-bold" style={{ borderRadius: "10px" }} onClick={backToListView}>
            <i className="bi bi-arrow-left me-1"></i> Back to Ledger List
          </button>
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn-banner-excel shadow-sm"
              onClick={() => handleExportSingleExcel(selectedRecord)}
            >
              <i className="bi bi-file-earmark-excel-fill"></i> Export Record to Excel
            </button>
            <button
              type="button"
              className="btn btn-danger px-3 py-2 fw-bold shadow-sm"
              style={{ borderRadius: "12px", height: "42px" }}
              onClick={() => handleDownloadSingleDayPdf(selectedRecord)}
            >
              <i className="bi bi-file-earmark-pdf-fill me-1"></i> Download PDF
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ======================================================================== */
  /* RENDER MAIN DASHBOARD LEDGER LIST VIEW                                   */
  /* ======================================================================== */
  return (
    <div className="daily-expense-container fade-in">
      {/* Executive Royal Blue Banner */}
      <div className="daily-report-banner mb-4">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="banner-icon-badge-blue">
              <i className="bi bi-bar-chart-line-fill"></i>
            </div>
            <div>
              <h2 className="mb-1">Daily Operations Expense & Ledger Analytics</h2>
              <p className="mb-0">
                Track daily cash collections, sales revenue, itemized operational expenses & ledger settlements
              </p>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <button
              className="btn-banner-excel shadow-sm"
              onClick={handleExportAllExcel}
              disabled={data.length === 0}
            >
              <i className="bi bi-file-earmark-excel-fill fs-5"></i> Download All Excel
            </button>
          </div>
        </div>
      </div>



      {/* Filter Card */}
      <div className="filter-card-blue mb-4">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
          <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
            <i className="bi bi-funnel-fill"></i> Filter & Search Ledgers
          </h6>
          <div className="quick-filter-pills">
            <button
              className={`pill-filter-btn ${activeFilterPill === "all" ? "active" : ""}`}
              onClick={() => handleQuickFilter("all")}
            >
              All Ledgers
            </button>
            <button
              className={`pill-filter-btn ${activeFilterPill === "today" ? "active" : ""}`}
              onClick={() => handleQuickFilter("today")}
            >
              Today
            </button>
            <button
              className={`pill-filter-btn ${activeFilterPill === "last7" ? "active" : ""}`}
              onClick={() => handleQuickFilter("last7")}
            >
              Last 7 Days
            </button>
            <button
              className={`pill-filter-btn ${activeFilterPill === "thisMonth" ? "active" : ""}`}
              onClick={() => handleQuickFilter("thisMonth")}
            >
              This Month
            </button>
          </div>
        </div>

        <div className="row g-3 align-items-end">
          <div className="col-md-3 col-sm-6">
            <label className="filter-label">
              <i className="bi bi-calendar-event"></i> Start Date
            </label>
            <input
              type="date"
              className="form-control filter-input"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </div>
          <div className="col-md-3 col-sm-6">
            <label className="filter-label">
              <i className="bi bi-calendar-check"></i> End Date
            </label>
            <input
              type="date"
              className="form-control filter-input"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </div>
          <div className="col-md-3 col-sm-6">
            <label className="filter-label">
              <i className="bi bi-building"></i> Operating Branch
            </label>
            <select
              className="form-select filter-input"
              name="branch"
              value={filters.branch}
              onChange={handleFilterChange}
            >
              <option value="">All Operating Branches</option>
              {branches.map((b) => (
                <option key={b.id || b.branchName} value={b.branchName || b.name}>
                  {b.branchName || b.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3 col-sm-6">
            <div className="search-action-group">
              <button
                className="btn-search-royal"
                onClick={handleSearch}
                disabled={loading}
              >
                {loading ? (
                  <span>
                    <span className="spinner-border spinner-border-sm me-1" role="status"></span> Loading...
                  </span>
                ) : (
                  <span>
                    <i className="bi bi-search me-1"></i> Search Ledgers
                  </span>
                )}
              </button>
              <button
                className="btn-reset-royal"
                onClick={handleResetFilters}
                title="Reset All Filters"
              >
                <i className="bi bi-arrow-counterclockwise"></i> Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="table-card-container">
        <div className="table-responsive">
          <table className="table daily-ledger-table align-middle text-center mb-0">
            <thead>
              <tr>
                <th className="py-3">Date</th>
                <th className="py-3">Branch</th>
                <th className="py-3">Total Sales (Earned)</th>
                <th className="py-3">Cash In Hand</th>
                <th className="py-3">Last Closed</th>
                <th className="py-3">Shortage</th>
                {expenseKeys.map((key) => (
                  <th key={key} className="py-3 text-uppercase">
                    {key}
                  </th>
                ))}
                <th className="py-3 text-center" style={{ minWidth: "220px" }}>
                  Actions & Ledger Details
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7 + expenseKeys.length} className="p-0">
                    <LoadingSpinner message="Fetching daily expense ledgers..." minHeight="240px" />
                  </td>
                </tr>
              ) : data.length > 0 ? (
                <>
                  {data.map((row, index) => (
                    <tr key={row.dailyExpenseId || index}>
                      <td className="fw-bold text-dark">
                        {row.date ? new Date(row.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-"}
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border px-2 py-1 fw-bold">
                          <i className="bi bi-building me-1 text-primary"></i>
                          {row.branch || "-"}
                        </span>
                      </td>
                      <td className="text-primary fw-bold">
                        ₹{(row.totalSales || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="text-info fw-bold">
                        ₹{(row.cashInHand || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="text-secondary fw-bold">
                        ₹{(row.lastClosed || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="text-warning fw-bold">
                        ₹{(row.shortage || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      {expenseKeys.map((key) => {
                        const val = (row.expenses && row.expenses[key]) || 0;
                        return (
                          <td key={key} className={`fw-semibold ${val > 0 ? "text-danger" : "text-muted opacity-50"}`}>
                            ₹{val.toFixed(2)}
                          </td>
                        );
                      })}
                      <td>
                        <div className="d-flex align-items-center justify-content-center gap-2">
                          {/* View Details Button */}
                          <button
                            type="button"
                            className="btn-view-details"
                            onClick={() => openFullPageView(row)}
                            title="View Full Ledger Metrics"
                          >
                            <i className="bi bi-eye-fill"></i> View Details
                          </button>

                          {/* Single Record Excel Download Button */}
                          <button
                            type="button"
                            className="btn-excel-row-redesigned"
                            onClick={() => handleExportSingleExcel(row)}
                            title="Download Record in Excel"
                          >
                            <i className="bi bi-file-earmark-excel-fill"></i> Excel
                          </button>

                          {/* Single-Day PDF Download Button */}
                          <button
                            type="button"
                            className="btn-pdf-red-redesigned"
                            onClick={() => handleDownloadSingleDayPdf(row)}
                            title="Download Single-day PDF Report"
                          >
                            <i className="bi bi-file-earmark-pdf-fill"></i> PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {/* Totals Row */}
                  <tr className="totals-row-blue">
                    <td colSpan="2" className="text-end text-uppercase fw-bold py-3">
                      Ledger Summary Totals:
                    </td>
                    <td className="text-primary py-3">
                      ₹{totals.totalSales.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="text-info py-3">
                      ₹{totals.cashInHand.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="text-secondary py-3">
                      ₹{totals.lastClosed.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="text-warning py-3">
                      ₹{totals.shortage.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                    {expenseKeys.map((key) => (
                      <td key={key} className="text-danger py-3">
                        ₹{(totals.expenseTotals[key] || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                    ))}
                    <td className="py-3">-</td>
                  </tr>
                </>
              ) : (
                <tr>
                  <td colSpan={7 + expenseKeys.length} className="text-center py-5 text-muted">
                    <i className="bi bi-inbox text-secondary display-4 d-block mb-3"></i>
                    <h6 className="fw-bold text-dark">No Daily Expense Records Found</h6>
                    <p className="mb-0 text-muted small">
                      Try selecting a different date range or operating branch filter.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DailyExpenseReport;
