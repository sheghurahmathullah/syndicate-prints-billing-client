import { useState, useEffect } from "react";
import { fetchDailyReports, downloadDailyExpensePdf } from "../../Service/ExpenseService.js";
import { fetchBranches } from "../../Service/BranchService.js";
import toast from "react-hot-toast";
import "./DailyExpenseReport.css";

const DailyExpenseReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState([]);
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
      toast.error("Failed to load branches");
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetchDailyReports(filters.startDate, filters.endDate, filters.branch);
      setData(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching daily expense report:", error);
      toast.error("Failed to fetch daily expense report");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = () => {
    loadData();
  };

  const handleDownloadPdf = async (id) => {
    try {
      const response = await downloadDailyExpensePdf(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `daily-expense-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("PDF Downloaded successfully!");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("Failed to download PDF");
    }
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

  const totals = data.reduce(
    (acc, row) => {
      acc.totalSales += row.totalSales || 0;
      acc.cashInHand += row.cashInHand || 0;
      
      expenseKeys.forEach(key => {
        acc.expenseTotals[key] = (acc.expenseTotals[key] || 0) + ((row.expenses && row.expenses[key]) || 0);
      });
      
      return acc;
    },
    {
      totalSales: 0,
      cashInHand: 0,
      expenseTotals: {}
    }
  );

  return (
    <div className="daily-expense-container fade-in">
      {/* Banner */}
      <div className="report-banner position-relative text-center text-white mb-4 rounded px-3 py-4 shadow-sm">
        <h4 className="fw-bold mb-2 text-uppercase tracking-wider">
          Daily Expense Report
        </h4>
        <p className="mb-0 text-white-50" style={{ fontSize: "0.9rem" }}>
          Real-time overview of daily sales, cash in hand, and expenses across branches
        </p>
      </div>

      {/* Filters */}
      <div className="filter-card mb-4 bg-white p-3 rounded shadow-sm">
        <div className="row g-3 align-items-end">
          <div className="col-md-3">
            <label className="form-label text-muted fw-bold small mb-1">START DATE</label>
            <input
              type="date"
              className="form-control form-control-sm shadow-sm"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label text-muted fw-bold small mb-1">END DATE</label>
            <input
              type="date"
              className="form-control form-control-sm shadow-sm"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label text-muted fw-bold small mb-1">BRANCH</label>
            <select
              className="form-select form-select-sm shadow-sm"
              name="branch"
              value={filters.branch}
              onChange={handleFilterChange}
            >
              <option value="">All Branches</option>
              {branches.map((b) => (
                <option key={b.id || b.branchName} value={b.branchName || b.name}>
                  {b.branchName || b.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <button className="btn btn-sm btn-primary w-100 shadow-sm d-flex align-items-center justify-content-center" onClick={handleSearch} disabled={loading} style={{ height: "31px" }}>
              {loading ? (
                <span><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Loading...</span>
              ) : (
                <span><i className="bi bi-search me-2"></i>Search</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive rounded shadow-sm bg-white pb-2">
        <table className="bills-table data-table w-100 table mb-0 text-center">
          <thead>
            <tr>
              <th className="py-3">Date</th>
              <th className="py-3">Branch</th>
              <th className="py-3">Total Sales</th>
              <th className="py-3">Cash In Hand</th>
              {expenseKeys.map(key => (
                <th key={key} className="py-3 text-uppercase">{key}</th>
              ))}
              <th className="py-3 text-center" style={{ width: "80px" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="12" className="p-0">
                  <div className="premium-loader-container">
                    <div className="premium-loader"></div>
                    <span className="loader-text mt-3 text-muted">Fetching Daily Expenses...</span>
                  </div>
                </td>
              </tr>
            ) : data.length > 0 ? (
              <>
                {data.map((row, index) => (
                  <tr key={index} className="table-row-hover border-bottom">
                    <td className="text-muted small">{row.date ? new Date(row.date).toLocaleDateString() : '-'}</td>
                    <td className="fw-semibold text-dark">{row.branch || '-'}</td>
                    <td className="text-success fw-bold">₹{row.totalSales?.toFixed(2) || '0.00'}</td>
                    <td className="text-info fw-bold">₹{row.cashInHand?.toFixed(2) || '0.00'}</td>
                    {expenseKeys.map(key => (
                      <td key={key} className="text-danger fw-semibold">
                        ₹{(row.expenses && row.expenses[key]) ? row.expenses[key].toFixed(2) : '0.00'}
                      </td>
                    ))}
                    <td>
                      <div className="d-flex justify-content-center">
                        <button 
                          className="btn btn-sm btn-outline-danger action-btn"
                          style={{ padding: "0.25rem 0.5rem" }}
                          onClick={() => handleDownloadPdf(row.dailyExpenseId)}
                          title="Download PDF"
                        >
                          <i className="bi bi-file-earmark-pdf-fill"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {/* Totals Row */}
                <tr className="totals-row">
                  <td colSpan="2" className="text-end py-3 text-muted text-uppercase">Total</td>
                  <td className="text-success py-3">₹{totals.totalSales.toFixed(2)}</td>
                  <td className="text-info py-3">₹{totals.cashInHand.toFixed(2)}</td>
                  {expenseKeys.map(key => (
                    <td key={key} className="text-danger py-3">₹{(totals.expenseTotals[key] || 0).toFixed(2)}</td>
                  ))}
                  <td className="py-3">-</td>
                </tr>
              </>
            ) : (
              <tr>
                <td colSpan="12" className="text-center py-5 text-muted">
                  <i className="bi bi-inbox fs-3 d-block mb-2 text-secondary"></i>
                  No data found for the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DailyExpenseReport;
