import "./Analytics.css";
import { useEffect, useState } from "react";
import { fetchAnalyticsData } from "../../Service/Dashboard.js";
import toast from "react-hot-toast";

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("this_month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCustomDate, setIsCustomDate] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const filterToSend = isCustomDate ? "custom_range" : filter;
      const response = await fetchAnalyticsData(filterToSend, isCustomDate ? startDate : null, isCustomDate ? endDate : null);
      setData(response.data);
    } catch (error) {
      console.error(error);
      toast.error("Unable to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isCustomDate) {
      loadData();
    }
  }, [filter, isCustomDate]);

  const handleFilterChange = (e) => {
    const value = e.target.value;
    if (value === "custom_range") {
      setIsCustomDate(true);
    } else {
      setIsCustomDate(false);
      setFilter(value);
    }
  };

  const handleApplyCustomDate = () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }
    loadData();
  };

  if (loading && !data) {
    return (
      <div className="analytics-container">
        <div className="loading-state">
          <i className="bi bi-hourglass-split"></i>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="analytics-container">
        <div className="error-state">
          <i className="bi bi-exclamation-triangle"></i>
          <p>Failed to load analytics data</p>
        </div>
      </div>
    );
  }

  const { kpi, paymentWiseData, last7DaysSales, customerWiseData, employeeWiseData } = data;

  const totalRevenue = kpi.totalAmount || 0;

  // Max for revenue trend
  const maxTrendRevenue = Math.max(...last7DaysSales.map((d) => d.amount), 1);
  const total7DaysRevenue = last7DaysSales ? last7DaysSales.reduce((sum, day) => sum + day.amount, 0) : 0;
  const avg7DaysRevenue = last7DaysSales && last7DaysSales.length > 0 ? total7DaysRevenue / last7DaysSales.length : 0;

  // Max for employee bar chart
  const maxEmployeeRevenue = Math.max(...(employeeWiseData || []).map((d) => d.totalAmount), 1);

  // Payment breakdown logic
  const paymentKeys = Object.keys(paymentWiseData || {});
  const totalPayment = paymentKeys.reduce((sum, key) => sum + (paymentWiseData[key] || 0), 0);
  const getPercentage = (amt) => totalPayment > 0 ? (amt / totalPayment) * 100 : 0;

  const paymentColors = {
    CASH: "#10b981",
    UPI: "#3b82f6",
    CARD: "#f59e0b",
    CREDIT: "#8b5cf6",
    CHEQUE: "#e64051"
  };

  const paymentIcons = {
    CASH: "bi-cash",
    UPI: "bi-phone",
    CARD: "bi-credit-card",
    CREDIT: "bi-journal-text",
    CHEQUE: "bi-bank"
  };

  let currentPercent = 0;
  const pieGradient = paymentKeys.map(key => {
    const start = currentPercent;
    currentPercent += getPercentage(paymentWiseData[key] || 0);
    const color = paymentColors[key.toUpperCase()] || "#94a3b8";
    return `${color} ${start}% ${currentPercent}%`;
  }).join(", ");

  return (
    <div className="analytics-container">
      {/* Header */}
      <div className="analytics-header mb-4">
        <div className="header-content">
          <h1>
            Analytics Dashboard
          </h1>
          <p className="header-subtitle">
            Comprehensive business insights and performance metrics
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filter-card mb-4 bg-white rounded shadow-sm border-0 overflow-hidden">
        <div className="d-flex flex-wrap align-items-center justify-content-between p-3" style={{ borderLeft: "4px solid #e64051" }}>
          
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <div className="d-flex align-items-center">
              <div className="bg-light rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '45px', height: '45px', color: '#e64051' }}>
                <i className="bi bi-calendar3 fs-5"></i>
              </div>
              <div>
                <h6 className="mb-0 fw-bold" style={{ color: '#002142', fontSize: '0.95rem' }}>Time Period</h6>
                <small className="text-muted" style={{ fontSize: '0.8rem' }}>Filter analytics data</small>
              </div>
            </div>

            <div className="vr d-none d-md-block mx-2" style={{ height: '30px', opacity: 0.1 }}></div>

            <div className="d-flex align-items-center">
              <select 
                value={isCustomDate ? "custom_range" : filter} 
                onChange={handleFilterChange} 
                className="form-select fw-semibold shadow-none cursor-pointer py-2"
                style={{ minWidth: '160px', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#002142' }}
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
          </div>
          
          {isCustomDate && (
            <div className="d-flex align-items-center gap-3 mt-3 mt-md-0 bg-light p-2 rounded-3 border flex-wrap">
              <div className="d-flex align-items-center">
                <span className="text-muted fw-bold me-2" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>FROM</span>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                  className="form-control form-control-sm border-0 shadow-sm" 
                  style={{ borderRadius: '6px', height: '32px' }}
                />
              </div>
              <div className="text-muted d-none d-sm-block"><i className="bi bi-arrow-right"></i></div>
              <div className="d-flex align-items-center">
                <span className="text-muted fw-bold me-2" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>TO</span>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)} 
                  className="form-control form-control-sm border-0 shadow-sm" 
                  style={{ borderRadius: '6px', height: '32px' }}
                />
              </div>
              <button 
                onClick={handleApplyCustomDate} 
                className="btn btn-sm text-white px-4 fw-bold shadow-sm" 
                style={{ background: "linear-gradient(135deg, #e64051 0%, #c23544 100%)", borderRadius: '6px', border: "none", height: '32px' }}
              >
                Apply
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card primary">
          <div className="metric-icon">
            <i className="bi bi-currency-rupee"></i>
          </div>
          <div className="metric-content">
            <h3>Total Amount</h3>
            <p className="metric-value">₹{kpi.totalAmount.toFixed(2)}</p>
          </div>
        </div>

        <div className="metric-card success">
          <div className="metric-icon">
            <i className="bi bi-cash-coin"></i>
          </div>
          <div className="metric-content">
            <h3>Paid Amount</h3>
            <p className="metric-value">₹{kpi.paidAmount.toFixed(2)}</p>
          </div>
        </div>

        <div className="metric-card warning">
          <div className="metric-icon">
            <i className="bi bi-credit-card-2-front"></i>
          </div>
          <div className="metric-content">
            <h3>Credit Amount</h3>
            <p className="metric-value">₹{kpi.creditAmount.toFixed(2)}</p>
          </div>
        </div>

        <div className="metric-card secondary">
          <div className="metric-icon">
            <i className="bi bi-cart-check"></i>
          </div>
          <div className="metric-content">
            <h3>Completed Orders</h3>
            <p className="metric-value">{kpi.completedOrders}</p>
          </div>
        </div>

        <div className="metric-card primary">
          <div className="metric-icon">
            <i className="bi bi-bag-check"></i>
          </div>
          <div className="metric-content">
            <h3>Total Orders</h3>
            <p className="metric-value">{kpi.todayOrderCount}</p>
          </div>
        </div>

        <div className="metric-card warning">
          <div className="metric-icon">
            <i className="bi bi-bag-x"></i>
          </div>
          <div className="metric-content">
            <h3>Total Credit Orders</h3>
            <p className="metric-value">{kpi.todayCreditOrderCount}</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        {/* Revenue Trend Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>
              <i className="bi bi-graph-up"></i>
              Revenue Trend (Last 7 Days)
            </h3>
          </div>
          <div className="chart-content">
            <div className="bar-chart">
              {last7DaysSales.map((day, index) => {
                const dateObj = new Date(day.date);
                const shortDate = dateObj.toLocaleDateString("en-US", { weekday: "short", day: "numeric" });
                return (
                  <div key={index} className="bar-item">
                    <div className="bar-wrapper">
                      <div
                        className="bar"
                        style={{
                          height: `${(day.amount / maxTrendRevenue) * 100}%`,
                        }}
                        data-value={`₹${day.amount.toFixed(2)} | ${day.day}`}
                      >
                        <span className="bar-value-above">₹{day.amount.toFixed(0)}</span>
                      </div>
                    </div>
                    <span className="bar-label">{shortDate}</span>
                  </div>
                );
              })}
            </div>

            {/* Trend Summary */}
            <div className="trend-summary mt-4 pt-3 border-top d-flex justify-content-around align-items-center">
              <div className="trend-stat text-center">
                <span className="d-block text-muted small fw-bold text-uppercase mb-1">Total 7 Days Sales</span>
                <span className="fs-5 fw-bolder text-primary">₹{total7DaysRevenue.toFixed(2)}</span>
              </div>
              <div className="trend-stat text-center border-start ps-4">
                <span className="d-block text-muted small fw-bold text-uppercase mb-1">Daily Average</span>
                <span className="fs-5 fw-bolder text-success">₹{avg7DaysRevenue.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>


        {/* Payment Method Distribution */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>
              <i className="bi bi-pie-chart"></i>
              Payment Methods Distribution
            </h3>
          </div>
          <div className="chart-content">
            <div className="pie-chart-container">
              {/* Pie Chart */}
              <div className="pie-chart-wrapper">
                <div
                  className="pie-chart"
                  style={{
                    background: `conic-gradient(${pieGradient || '#f8fafc 0% 100%'})`,
                  }}
                >
                  <div className="pie-chart-center">
                    <div className="pie-chart-total">
                      <span className="pie-total-label">Total</span>
                      <span className="pie-total-value">
                        ₹{totalPayment.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="pie-chart-legend">
                {paymentKeys.map(key => (
                  <div className="legend-item" key={key}>
                    <div className="legend-marker" style={{ background: paymentColors[key.toUpperCase()] || "#94a3b8" }}></div>
                    <div className="legend-content">
                      <div className="legend-header">
                        <span className="legend-label">
                          <i className={`bi ${paymentIcons[key.toUpperCase()] || "bi-wallet2"}`}></i> {key}
                        </span>
                        <span className="legend-percentage">
                          {getPercentage(paymentWiseData[key]).toFixed(1)}%
                        </span>
                      </div>
                      <span className="legend-value">
                        ₹{(paymentWiseData[key] || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Employee Wise Data Chart */}
        <div className="chart-card wide">
          <div className="chart-header">
            <h3>
              <i className="bi bi-person-workspace"></i>
              Employee Performance (Revenue)
            </h3>
          </div>
          <div className="chart-content">
            {employeeWiseData && employeeWiseData.length > 0 ? (
              <div className="bar-chart employee-chart">
                {employeeWiseData.map((emp, index) => (
                  <div key={index} className="bar-item">
                    <div className="bar-wrapper">
                      <div
                        className="bar employee-bar"
                        style={{
                          height: `${(emp.totalAmount / maxEmployeeRevenue) * 100}%`,
                        }}
                        data-value={`₹${emp.totalAmount.toFixed(2)}`}
                      >
                        <span className="bar-value-above">₹{emp.totalAmount.toFixed(0)}</span>
                      </div>
                    </div>
                    <span className="bar-label">{emp.employeeName}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-data">
                <i className="bi bi-inbox"></i>
                <p>No employee data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="tables-grid">
        {/* Top Customers */}
        <div className="table-card">
          <div className="table-header">
            <h3>
              <i className="bi bi-people"></i>
              Top Customers by Revenue
            </h3>
          </div>
          <div className="table-content">
            {customerWiseData && customerWiseData.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Customer</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {customerWiseData.map((customer, index) => (
                    <tr key={index}>
                      <td>
                        <span className={`rank-badge rank-${index + 1 > 5 ? 'other' : index + 1}`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="customer-name">{customer.customer}</td>
                      <td className="revenue-cell">
                        ₹{customer.totalAmount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-data">
                <i className="bi bi-inbox"></i>
                <p>No customer data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
