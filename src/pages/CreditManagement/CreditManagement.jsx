import "./CreditManagement.css";
import { useEffect, useState } from "react";
import { getPendingCreditOrders, completeCreditOrder } from "../../Service/OrderService.js";
import toast from "react-hot-toast";
import ReceiptPopup from "../../components/ReceiptPopup/ReceiptPopup.jsx";

const CreditManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const loadPendingCreditOrders = async () => {
    try {
      setLoading(true);
      const response = await getPendingCreditOrders();
      setOrders(response.data || []);
    } catch (error) {
      console.error("Error loading pending credit orders:", error);
      toast.error("Failed to load pending credit orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingCreditOrders();
  }, []);

  const handleCompleteOrder = async (orderId) => {
    if (!window.confirm("Mark this order as completed? This action cannot be undone.")) {
      return;
    }

    try {
      setUpdatingOrderId(orderId);
      const response = await completeCreditOrder(orderId);
      toast.success("Order marked as completed");
      // Remove the order from the list
      setOrders(orders.filter(order => order.orderId !== orderId));
    } catch (error) {
      console.error("Error completing order:", error);
      toast.error("Failed to complete order");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handlePrintInvoice = (order) => {
    setSelectedOrder(order);
    setShowInvoice(true);
  };

  const handleCloseInvoice = () => {
    setShowInvoice(false);
    setSelectedOrder(null);
  };

  const handlePrint = () => {
    window.print();
  };

  const totalPendingAmount = orders.reduce((sum, order) => {
    return sum + (order.pendingAmount || 0);
  }, 0);

  const totalPaidAmount = orders.reduce((sum, order) => {
    return sum + (order.paidAmount || 0);
  }, 0);

  const totalGrandTotal = orders.reduce((sum, order) => {
    return sum + (order.grandTotal || 0);
  }, 0);

  if (loading) {
    return (
      <div className="credit-management-wrapper">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading pending credit orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="credit-management-wrapper">
      <div className="credit-management-container">
        <div className="credit-header">
          <h2>
            <i className="bi bi-credit-card"></i> Credit Management
          </h2>
          <button
            className="btn btn-primary refresh-btn"
            onClick={loadPendingCreditOrders}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise"></i> Refresh
          </button>
        </div>

        {/* Summary Cards */}
        <div className="credit-summary-grid">
          <div className="summary-card">
            <div className="summary-icon pending">
              <i className="bi bi-clock-history"></i>
            </div>
            <div className="summary-content">
              <h3>Pending Orders</h3>
              <p className="summary-value">{orders.length}</p>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon total">
              <i className="bi bi-currency-rupee"></i>
            </div>
            <div className="summary-content">
              <h3>Total Amount</h3>
              <p className="summary-value">₹{totalGrandTotal.toFixed(2)}</p>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon paid">
              <i className="bi bi-check-circle"></i>
            </div>
            <div className="summary-content">
              <h3>Paid Amount</h3>
              <p className="summary-value">₹{totalPaidAmount.toFixed(2)}</p>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-icon balance">
              <i className="bi bi-exclamation-circle"></i>
            </div>
            <div className="summary-content">
              <h3>Balance Amount</h3>
              <p className="summary-value">₹{totalPendingAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="credit-orders-section">
          <h3 className="section-title">
            <i className="bi bi-list-ul"></i> Pending Credit Orders
          </h3>

          {orders.length === 0 ? (
            <div className="no-orders-message">
              <i className="bi bi-inbox"></i>
              <p>No pending credit orders</p>
            </div>
          ) : (
            <div className="orders-table-container">
              <table className="credit-orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Total Amount</th>
                    <th>Paid Amount</th>
                    <th>Balance</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.orderId}>
                      <td>
                        <span className="order-id">{order.orderId.substring(0, 12)}...</span>
                      </td>
                      <td>{order.customerName}</td>
                      <td>{order.phoneNumber}</td>
                      <td className="amount-cell">₹{order.grandTotal.toFixed(2)}</td>
                      <td className="amount-cell paid-amount">
                        ₹{(order.paidAmount || 0).toFixed(2)}
                      </td>
                      <td className="amount-cell balance-amount">
                        ₹{(order.pendingAmount || 0).toFixed(2)}
                      </td>
                      <td>
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn btn-sm btn-info invoice-btn"
                            onClick={() => handlePrintInvoice(order)}
                            title="View Invoice"
                          >
                            <i className="bi bi-receipt"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-success complete-btn"
                            onClick={() => handleCompleteOrder(order.orderId)}
                            disabled={updatingOrderId === order.orderId}
                            title="Mark as Completed"
                          >
                            {updatingOrderId === order.orderId ? (
                              <i className="bi bi-hourglass-split"></i>
                            ) : (
                              <i className="bi bi-check-circle"></i>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Popup */}
      {showInvoice && selectedOrder && (
        <ReceiptPopup
          orderDetails={selectedOrder}
          onClose={handleCloseInvoice}
          onPrint={handlePrint}
        />
      )}
    </div>
  );
};

export default CreditManagement;

