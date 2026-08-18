import React, { useState, useEffect } from "react";
import { getEmployeeWiseData } from "../../Service/BillService";
import { fetchEmployeeNames } from "../../Service/EmployeeService";
import toast from "react-hot-toast";
import "./EmployeeView.css";

const EmployeeView = () => {
  const [employeesData, setEmployeesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  
  const [dateFilter, setDateFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  
  const [employeeNames, setEmployeeNames] = useState([]);

  useEffect(() => {
    const getEmployees = async () => {
      try {
        const res = await fetchEmployeeNames();
        const data = res.data || [];
        setEmployeeNames(data);
      } catch (err) {
        console.error("Error fetching employee names:", err);
      }
    };
    getEmployees();
  }, []);

  const loadEmployeeData = async () => {
    setLoading(true);
    try {
      const response = await getEmployeeWiseData(page, pageSize, dateFilter, startDate, endDate, employeeFilter);
      const data = response.data;

      if (data) {
        setEmployeesData(data.content || []);
        setTotalPages(data.page?.totalPages || data.totalPages || 0);
        setTotalElements(data.page?.totalElements || data.totalElements || data.content?.length || 0);
      }
    } catch (error) {
      console.error("Error fetching employee wise data:", error);
      toast.error("Failed to load employee wise data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployeeData();
  }, [page, pageSize, dateFilter, startDate, endDate, employeeFilter]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  const handleDateFilterChange = (e) => {
    setDateFilter(e.target.value);
    if (e.target.value !== "custom_range") {
      setStartDate("");
      setEndDate("");
    }
    setPage(0);
  };

  return (
    <div className="employee-view-container fade-in">
      <div className="employee-banner position-relative text-center text-white mb-4 rounded px-3 py-4 shadow-sm">
        <h4 className="fw-bold mb-2 text-uppercase tracking-wider">
          Employee Insights
        </h4>
        <p className="mb-0 text-white-50" style={{ fontSize: "0.9rem" }}>
          Comprehensive overview of employee-wise billing, revenue, and credits
        </p>
      </div>

      <div className="filter-card mb-4 bg-white p-3 rounded shadow-sm d-flex flex-wrap gap-3 align-items-end">
        <div className="filter-group">
          <label htmlFor="dateFilter" className="form-label mb-1 fw-bold text-muted small">
            <i className="bi bi-calendar-event text-primary me-1"></i> Date Filter:
          </label>
          <select
            id="dateFilter"
            className="form-select form-select-sm shadow-sm"
            value={dateFilter}
            onChange={handleDateFilterChange}
            style={{ width: "160px" }}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="this_week">This Week</option>
            <option value="last_week">Last Week</option>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="this_year">This Year</option>
            <option value="custom_range">Custom Range</option>
          </select>
        </div>

        {dateFilter === "custom_range" && (
          <>
            <div className="filter-group">
              <label htmlFor="startDate" className="form-label mb-1 fw-bold text-muted small">Start Date:</label>
              <input
                type="date"
                id="startDate"
                className="form-control form-control-sm shadow-sm"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setPage(0); }}
              />
            </div>
            <div className="filter-group">
              <label htmlFor="endDate" className="form-label mb-1 fw-bold text-muted small">End Date:</label>
              <input
                type="date"
                id="endDate"
                className="form-control form-control-sm shadow-sm"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setPage(0); }}
              />
            </div>
          </>
        )}

        <div className="filter-group">
          <label htmlFor="employeeFilter" className="form-label mb-1 fw-bold text-muted small">
            <i className="bi bi-person-badge text-primary me-1"></i> Employee:
          </label>
          <select
            id="employeeFilter"
            className="form-select form-select-sm shadow-sm"
            value={employeeFilter}
            onChange={(e) => {
              setEmployeeFilter(e.target.value);
              setPage(0);
            }}
            style={{ width: "180px" }}
          >
            <option value="">All Employees</option>
            {employeeNames.map((emp, idx) => (
              <option key={idx} value={emp.fullName}>{emp.fullName}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-responsive rounded shadow-sm bg-white pb-2">
        <table className="employees-table data-table w-100 table mb-0">
          <thead>
            <tr>
              <th className="text-center" style={{ width: "60px" }}>S.No</th>
              <th>Employee Name</th>
              <th>Total Bills</th>
              <th>Total Amount (₹)</th>
              <th>Credit Orders</th>
              <th>Credit Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="p-0">
                  <div className="premium-loader-container">
                    <div className="premium-loader"></div>
                    <span className="loader-text mt-3">Fetching Employee Data...</span>
                  </div>
                </td>
              </tr>
            ) : employeesData.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-5 text-muted">
                  <i className="bi bi-person-x fs-3 d-block mb-2 text-secondary"></i>
                  No employee data found matching your filters.
                </td>
              </tr>
            ) : (
              employeesData.map((emp, index) => (
                <tr key={index} className="table-row-hover border-bottom">
                  <td className="text-center fw-semibold text-muted">
                    {page * pageSize + index + 1}
                  </td>
                  <td className="fw-bold text-primary">{emp.employeeName || "Unknown"}</td>
                  <td>{emp.totalBillsCount}</td>
                  <td className="fw-semibold text-success">
                    ₹{emp.totalAmount ? emp.totalAmount.toFixed(2) : "0.00"}
                  </td>
                  <td>{emp.creditOrderCount}</td>
                  <td className={`fw-semibold ${emp.creditAmount > 0 ? "text-danger" : "text-muted"}`}>
                    ₹{emp.creditAmount ? emp.creditAmount.toFixed(2) : "0.00"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="custom-pagination-container mt-4 mb-3 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          <label htmlFor="pageSize" className="form-label mb-0 small fw-bold text-muted">
            Rows per page:
          </label>
          <select
            id="pageSize"
            className="form-select form-select-sm shadow-sm"
            style={{ width: "auto" }}
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(0);
            }}
          >
            <option value="15">15</option>
            <option value="30">30</option>
            <option value="50">50</option>
          </select>
          <span className="text-muted small ms-2">
            Total records: <strong>{totalElements}</strong>
          </span>
        </div>

        {totalPages > 0 && (
          <div className="custom-pagination d-flex align-items-center gap-1">
            <button
              className="page-nav-btn btn btn-sm btn-light border fw-semibold"
              disabled={page === 0}
              onClick={() => handlePageChange(page - 1)}
            >
              <i className="bi bi-chevron-left me-1"></i> PREV
            </button>

            <div className="page-numbers d-flex gap-1 mx-2">
              {Array.from({ length: totalPages }).map((_, idx) => {
                if (
                  totalPages > 7 &&
                  idx !== 0 &&
                  idx !== totalPages - 1 &&
                  Math.abs(page - idx) > 1
                ) {
                  if (idx === 1 || idx === totalPages - 2)
                    return <span key={idx} className="text-muted px-1">...</span>;
                  return null;
                }

                return (
                  <button
                    key={idx}
                    className={`btn btn-sm ${page === idx ? "btn-primary shadow-sm" : "btn-light border"
                      } fw-semibold`}
                    style={{ width: "32px", height: "32px", padding: "0" }}
                    onClick={() => handlePageChange(idx)}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <button
              className="page-nav-btn btn btn-sm btn-light border fw-semibold"
              disabled={page >= totalPages - 1}
              onClick={() => handlePageChange(page + 1)}
            >
              NEXT <i className="bi bi-chevron-right ms-1"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeView;
