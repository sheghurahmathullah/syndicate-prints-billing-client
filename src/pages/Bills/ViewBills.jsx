import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllBills } from "../../Service/BillService";
import { fetchCustomers } from "../../Service/CustomerService";
import toast from "react-hot-toast";
import "./ViewBills.css";
import BillDetailsModal from "./BillDetailsModal.jsx";
import ReceiptPopup from "../../components/ReceiptPopup/ReceiptPopup.jsx";

const ViewBills = () => {
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [dateFilter, setDateFilter] = useState("today");
  const [customerFilter, setCustomerFilter] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [pageSize, setPageSize] = useState(15);
  const [selectedBill, setSelectedBill] = useState(null);
  const [printBill, setPrintBill] = useState(null);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const response = await getAllBills(page, pageSize, dateFilter, null, null, null, customerFilter);
      const pageData = response.data.page || response.data;
      setBills(response.data.content || []);
      setTotalPages(pageData.totalPages || 0);
      setTotalElements(pageData.totalElements || 0);
    } catch (error) {
      console.error("Error fetching bills:", error);
      toast.error("Failed to load bills");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, [page, dateFilter, pageSize, customerFilter]);

  useEffect(() => {
    const getCustomers = async () => {
      try {
        const res = await fetchCustomers();
        const data = res.data.content || res.data || [];
        setCustomers(data);
      } catch (err) {
        console.error("Error fetching customers:", err);
      }
    };
    getCustomers();
  }, []);

  const handleFilterChange = (e) => {
    setDateFilter(e.target.value);
    setPage(0); // Reset to first page when filter changes
  };

  const handleCustomerSearchChange = (e) => {
    const val = e.target.value;
    setCustomerSearch(val);
    if (val === "") {
      setCustomerFilter("");
      setPage(0);
      setShowCustomerDropdown(false);
    } else {
      setShowCustomerDropdown(true);
    }
  };

  const handleCustomerSelect = (customerName) => {
    setCustomerSearch(customerName);
    setCustomerFilter(customerName);
    setShowCustomerDropdown(false);
    setPage(0);
  };

  const handlePrintClick = (bill) => {
    let particulars = [];
    try {
      if (typeof bill.particulars === "string") {
        particulars = JSON.parse(bill.particulars);
      } else if (Array.isArray(bill.particulars)) {
        particulars = bill.particulars;
      }
    } catch (error) {
      console.error("Error parsing particulars:", error);
    }

    const items = particulars.map(p => ({
      name: p.name || p.particularName,
      quantity: p.qty || 1,
      price: p.price || 0
    }));

    const orderDetails = {
      invoiceNumber: bill.billNumber,
      orderId: bill.id,
      createdAt: bill.createdAt || bill.date,
      username: bill.employee,
      customerName: bill.customerName || "CASH CUSTOMER",
      grandTotal: bill.total || 0,
      paidAmount: bill.totalPaid || 0,
      tax: bill.gstAmount || ((bill.total || 0) - (bill.totalWithGst || 0)),
      items: items,
      creditType: bill.creditAmount > 0 ? "CREDIT" : "CASH",
      pendingAmount: bill.creditAmount || 0,
      taxPercent: bill.gstPercentage || 0,
      subtotal: bill.totalWithGst || bill.total || 0,
      gstin: bill.customerGstNo || ""
    };

    setPrintBill(orderDetails);
  };

  const filteredCustomers = customers.filter(c =>
    c.name && c.name.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit"
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="view-bills-container fade-in">
      <div className="machine-banner position-relative text-center text-white mb-4 rounded px-3 py-4 shadow-sm" style={{ backgroundColor: '#002142' }}>
        <h4 className="fw-bold mb-2 text-uppercase tracking-wider">All Bills Management</h4>
        <p className="mb-0 text-white-50" style={{ fontSize: '0.9rem' }}>Comprehensive oversight, filtering, and administration of all your generated bills</p>
      </div>

      <div className="filter-card mb-4">
        <div className="filter-group">
          <label htmlFor="dateFilter" className="filter-label">
            <i className="bi bi-calendar-event text-primary"></i> Date:
          </label>
          <select
            id="dateFilter"
            className="form-select form-select-sm shadow-sm modern-select"
            value={dateFilter}
            onChange={handleFilterChange}
            style={{ width: "180px" }}
          >
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

        <div className="filter-divider"></div>

        <div className="filter-group">
          <label htmlFor="customerSearch" className="filter-label">
            <i className="bi bi-person-badge text-primary"></i> Customer:
          </label>
          <div className="customer-search-wrapper">
            <input
              id="customerSearch"
              type="text"
              className="form-control form-control-sm shadow-sm modern-select w-100"
              placeholder="Search customers..."
              value={customerSearch}
              onChange={handleCustomerSearchChange}
              onFocus={() => { if (customerSearch.trim().length > 0) setShowCustomerDropdown(true); }}
              onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 200)}
            />
            {customerSearch && (
              <i
                className="bi bi-x-circle-fill text-muted position-absolute"
                style={{ right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: '0.85rem' }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  setCustomerSearch("");
                  setCustomerFilter("");
                  setPage(0);
                  setShowCustomerDropdown(false);
                }}
              ></i>
            )}
            {showCustomerDropdown && customerSearch.trim().length > 0 && (
              <ul className="customer-dropdown-list">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((cust, idx) => (
                    <li
                      key={idx}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleCustomerSelect(cust.name);
                      }}
                    >
                      {cust.name}
                    </li>
                  ))
                ) : (
                  <li className="no-results">No customers found</li>
                )}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="table-responsive rounded shadow-sm bg-white pb-2">
        <table className="bills-table data-table">
          <thead>
            <tr>
              <th className="text-center" style={{ width: '60px' }}>S.No</th>
              <th>Bill Number</th>
              <th>Customer Name</th>
              <th>Amount (₹)</th>
              <th>Created At</th>
              <th>Employee</th>
              <th className="text-center" style={{ width: '120px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="p-0">
                  <div className="premium-loader-container">
                    <div className="premium-loader"></div>
                    <span className="loader-text mt-3">Fetching Bills...</span>
                  </div>
                </td>
              </tr>
            ) : bills.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-5 text-muted">
                  <i className="bi bi-folder-x fs-3 d-block mb-2 text-secondary"></i>
                  No bills found for the selected filter.
                </td>
              </tr>
            ) : (
              bills.map((bill, index) => (
                <tr key={bill.id} className="table-row-hover">
                  <td className="text-center fw-semibold text-muted">{page * pageSize + index + 1}</td>
                  <td className="fw-bold text-primary">{bill.billNumber}</td>
                  <td>{bill.customerName || "-"}</td>
                  <td className="fw-semibold text-success">₹{bill.total ? bill.total.toFixed(2) : "0.00"}</td>
                  <td className="text-muted small">{formatDate(bill.createdAt || bill.date)}</td>
                  <td>
                    {bill.employee ? (
                      <span className="badge bg-light text-dark border">{bill.employee}</span>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td>
                    <div className="d-flex justify-content-center gap-2">
                      <button
                        className="btn btn-sm btn-outline-secondary modern-action-btn"
                        title="Print"
                        onClick={() => handlePrintClick(bill)}
                      >
                        <i className="bi bi-printer"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-primary modern-action-btn"
                        title="View"
                        onClick={() => setSelectedBill(bill)}
                      >
                        <i className="bi bi-eye"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger modern-action-btn"
                        title="Edit"
                        onClick={() => navigate(`/bills/edit/${bill.id}`, { state: { bill } })}
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="custom-pagination-container mt-4 mb-3 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          <label htmlFor="pageSize" className="form-label mb-0 small fw-bold text-muted">Rows per page:</label>
          <select
            id="pageSize"
            className="form-select form-select-sm shadow-sm"
            style={{ width: "auto" }}
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(0); // Reset to first page when size changes
            }}
          >
            <option value="15">15</option>
            <option value="30">30</option>
            <option value="50">50</option>
          </select>
          <span className="text-muted small ms-2">Total records: <strong>{totalElements}</strong></span>
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
                // Show a limited number of pages to prevent overflow, but keep it simple if totalPages is small
                if (totalPages > 7 && (idx !== 0 && idx !== totalPages - 1 && Math.abs(page - idx) > 1)) {
                  if (idx === 1 || idx === totalPages - 2) return <span key={idx} className="text-muted px-1">...</span>;
                  return null;
                }

                return (
                  <button
                    key={idx}
                    className={`btn btn-sm ${page === idx ? 'btn-primary shadow-sm' : 'btn-light border'} fw-semibold`}
                    style={{ width: '32px', height: '32px', padding: '0' }}
                    onClick={() => handlePageChange(idx)}
                  >
                    {idx + 1}
                  </button>
                )
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

      {selectedBill && (
        <BillDetailsModal
          bill={selectedBill}
          onClose={() => setSelectedBill(null)}
        />
      )}

      {printBill && (
        <ReceiptPopup
          orderDetails={printBill}
          onClose={() => setPrintBill(null)}
        />
      )}
    </div>
  );
};

export default ViewBills;

