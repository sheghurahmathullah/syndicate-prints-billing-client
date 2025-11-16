import "./Analytics.css";
import { useEffect, useState } from "react";
import { fetchDashboardData } from "../../Service/Dashboard.js";
import toast from "react-hot-toast";

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("month");
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchDashboardData();
        setData(response.data);
        setOrders(response.data.recentOrders || []);
      } catch (error) {
        console.error(error);
        toast.error("Unable to load analytics data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Calculate payment breakdown
  const getPaymentBreakdown = () => {
    const breakdown = { CASH: 0, UPI: 0, CARD: 0 };
    orders.forEach((order) => {
      const mode = order.paymentMethod?.toUpperCase();
      if (mode && breakdown.hasOwnProperty(mode)) {
        breakdown[mode] += order.grandTotal || 0;
      }
    });
    const total = breakdown.CASH + breakdown.UPI + breakdown.CARD;
    return {
      CASH: {
        amount: breakdown.CASH,
        percentage: total > 0 ? (breakdown.CASH / total) * 100 : 0,
      },
      UPI: {
        amount: breakdown.UPI,
        percentage: total > 0 ? (breakdown.UPI / total) * 100 : 0,
      },
      CARD: {
        amount: breakdown.CARD,
        percentage: total > 0 ? (breakdown.CARD / total) * 100 : 0,
      },
    };
  };

  // Calculate revenue by employee
  const getEmployeeRevenue = () => {
    const revenueByUser = {};
    orders.forEach((order) => {
      const user = order.username || "Unknown";
      if (!revenueByUser[user]) {
        revenueByUser[user] = { revenue: 0, orders: 0 };
      }
      revenueByUser[user].revenue += order.grandTotal || 0;
      revenueByUser[user].orders += 1;
    });
    return Object.entries(revenueByUser)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  };

  // Calculate top products
  const getTopProducts = () => {
    const productStats = {};
    orders.forEach((order) => {
      const items = order.items || order.orderItems || order.cartItems || [];
      if (Array.isArray(items)) {
        items.forEach((item) => {
          const name =
            item.name || item.itemName || item.productName || "Unknown";
          if (!productStats[name]) {
            productStats[name] = { revenue: 0, quantity: 0 };
          }
          const price =
            item.total ?? item.price * item.quantity ?? item.amount ?? 0;
          productStats[name].revenue += price;
          productStats[name].quantity += item.quantity || 1;
        });
      }
    });
    return Object.entries(productStats)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  };

  // Calculate revenue trend (last 7 days)
  const getRevenueTrend = () => {
    const trend = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayRevenue = orders
        .filter((order) => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= date && orderDate < nextDate;
        })
        .reduce((sum, order) => sum + order.grandTotal, 0);

      trend.push({
        date: date.toLocaleDateString("en-US", { weekday: "short" }),
        revenue: dayRevenue,
      });
    }
    return trend;
  };

  // Calculate order status distribution
  const getOrderStatusDistribution = () => {
    const statusCount = { COMPLETED: 0, PENDING: 0 };
    orders.forEach((order) => {
      const status = order.paymentDetails?.status || "PENDING";
      if (statusCount.hasOwnProperty(status)) {
        statusCount[status] += 1;
      }
    });
    const total = statusCount.COMPLETED + statusCount.PENDING;
    return {
      COMPLETED: {
        count: statusCount.COMPLETED,
        percentage: total > 0 ? (statusCount.COMPLETED / total) * 100 : 0,
      },
      PENDING: {
        count: statusCount.PENDING,
        percentage: total > 0 ? (statusCount.PENDING / total) * 100 : 0,
      },
    };
  };

  if (loading) {
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

  const paymentBreakdown = getPaymentBreakdown();
  const employeeRevenue = getEmployeeRevenue();
  const topProducts = getTopProducts();
  const revenueTrend = getRevenueTrend();
  const orderStatus = getOrderStatusDistribution();
  const totalRevenue = orders.reduce((sum, order) => sum + order.grandTotal, 0);
  const maxTrendRevenue = Math.max(...revenueTrend.map((d) => d.revenue), 1);

  return (
    <div className="analytics-container">
      {/* Header */}
      <div className="analytics-header">
        <div className="header-content">
          <h1>
            <i className="bi bi-graph-up-arrow"></i>
            Analytics Dashboard
          </h1>
          <p className="header-subtitle">
            Comprehensive business insights and performance metrics
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card primary">
          <div className="metric-icon">
            <i className="bi bi-currency-rupee"></i>
          </div>
          <div className="metric-content">
            <h3>Total Revenue</h3>
            <p className="metric-value">₹{totalRevenue.toFixed(2)}</p>
            <span className="metric-label">All time</span>
          </div>
        </div>

        <div className="metric-card secondary">
          <div className="metric-icon">
            <i className="bi bi-cart-check"></i>
          </div>
          <div className="metric-content">
            <h3>Total Orders</h3>
            <p className="metric-value">{orders.length}</p>
            <span className="metric-label">All time</span>
          </div>
        </div>

        <div className="metric-card success">
          <div className="metric-icon">
            <i className="bi bi-check-circle"></i>
          </div>
          <div className="metric-content">
            <h3>Completed</h3>
            <p className="metric-value">{orderStatus.COMPLETED.count}</p>
            <span className="metric-label">
              {orderStatus.COMPLETED.percentage.toFixed(1)}% of orders
            </span>
          </div>
        </div>

        <div className="metric-card warning">
          <div className="metric-icon">
            <i className="bi bi-clock-history"></i>
          </div>
          <div className="metric-content">
            <h3>Pending</h3>
            <p className="metric-value">{orderStatus.PENDING.count}</p>
            <span className="metric-label">
              {orderStatus.PENDING.percentage.toFixed(1)}% of orders
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        {/* Revenue Trend Chart */}
        <div className="chart-card wide">
          <div className="chart-header">
            <h3>
              <i className="bi bi-graph-up"></i>
              Revenue Trend (Last 7 Days)
            </h3>
          </div>
          <div className="chart-content">
            <div className="bar-chart">
              {revenueTrend.map((day, index) => (
                <div key={index} className="bar-item">
                  <div className="bar-wrapper">
                    <div
                      className="bar"
                      style={{
                        height: `${(day.revenue / maxTrendRevenue) * 100}%`,
                      }}
                      data-value={`₹${day.revenue.toFixed(0)}`}
                    ></div>
                  </div>
                  <span className="bar-label">{day.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Method Distribution */}
        <div className="chart-card wide">
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
                    background: `conic-gradient(
                      #10b981 0% ${paymentBreakdown.CASH.percentage}%,
                      #3b82f6 ${paymentBreakdown.CASH.percentage}% ${
                      paymentBreakdown.CASH.percentage +
                      paymentBreakdown.UPI.percentage
                    }%,
                      #f59e0b ${
                        paymentBreakdown.CASH.percentage +
                        paymentBreakdown.UPI.percentage
                      }% 100%
                    )`,
                  }}
                >
                  <div className="pie-chart-center">
                    <div className="pie-chart-total">
                      <span className="pie-total-label">Total</span>
                      <span className="pie-total-value">
                        ₹{totalRevenue.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="pie-chart-legend">
                <div className="legend-item">
                  <div className="legend-marker cash"></div>
                  <div className="legend-content">
                    <div className="legend-header">
                      <span className="legend-label">
                        <i className="bi bi-cash"></i> Cash
                      </span>
                      <span className="legend-percentage">
                        {paymentBreakdown.CASH.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <span className="legend-value">
                      ₹{paymentBreakdown.CASH.amount.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="legend-item">
                  <div className="legend-marker upi"></div>
                  <div className="legend-content">
                    <div className="legend-header">
                      <span className="legend-label">
                        <i className="bi bi-phone"></i> UPI
                      </span>
                      <span className="legend-percentage">
                        {paymentBreakdown.UPI.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <span className="legend-value">
                      ₹{paymentBreakdown.UPI.amount.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="legend-item">
                  <div className="legend-marker card"></div>
                  <div className="legend-content">
                    <div className="legend-header">
                      <span className="legend-label">
                        <i className="bi bi-credit-card"></i> Card
                      </span>
                      <span className="legend-percentage">
                        {paymentBreakdown.CARD.percentage.toFixed(1)}%
                      </span>
                    </div>
                    <span className="legend-value">
                      ₹{paymentBreakdown.CARD.amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="tables-grid">
        {/* Top Employees */}
        <div className="table-card">
          <div className="table-header">
            <h3>
              <i className="bi bi-person-badge"></i>
              Top Employees by Revenue
            </h3>
          </div>
          <div className="table-content">
            {employeeRevenue.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Employee</th>
                    <th>Orders</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {employeeRevenue.map((employee, index) => (
                    <tr key={index}>
                      <td>
                        <span className={`rank-badge rank-${index + 1}`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="employee-name">{employee.name}</td>
                      <td>{employee.orders}</td>
                      <td className="revenue-cell">
                        ₹{employee.revenue.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-data">
                <i className="bi bi-inbox"></i>
                <p>No employee data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="table-card">
          <div className="table-header">
            <h3>
              <i className="bi bi-box-seam"></i>
              Top Products by Revenue
            </h3>
          </div>
          <div className="table-content">
            {topProducts.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Product</th>
                    <th>Sold</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((product, index) => (
                    <tr key={index}>
                      <td>
                        <span className={`rank-badge rank-${index + 1}`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="product-name">{product.name}</td>
                      <td>{product.quantity}</td>
                      <td className="revenue-cell">
                        ₹{product.revenue.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-data">
                <i className="bi bi-inbox"></i>
                <p>No product data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
