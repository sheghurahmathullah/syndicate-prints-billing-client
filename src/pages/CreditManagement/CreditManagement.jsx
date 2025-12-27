import "./CreditManagement.css";
import { useEffect, useState } from "react";
import { getPendingCreditOrders, completeCreditOrder } from "../../Service/OrderService.js";
import toast from "react-hot-toast";
import ReceiptPopup from "../../components/ReceiptPopup/ReceiptPopup.jsx";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal.jsx";

const CreditManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [orderToComplete, setOrderToComplete] = useState(null);

  const loadPendingCreditOrders = async () => {
    try {
      setLoading(true);
      const response = await getPendingCreditOrders();
      const ordersData = response.data || [];
      setOrders(ordersData);
      setFilteredOrders(ordersData);
    } catch (error) {
      console.error("Error loading pending credit orders:", error);
      toast.error("Failed to load pending credit orders");
      setOrders([]);
      setFilteredOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingCreditOrders();
  }, []);

  const handleCompleteOrderClick = (orderId) => {
    const order = orders.find(o => o.orderId === orderId);
    setOrderToComplete({ orderId, order });
    setShowConfirmModal(true);
  };

  const handleConfirmComplete = async () => {
    if (!orderToComplete) return;

    const { orderId } = orderToComplete;
    setShowConfirmModal(false);

    try {
      setUpdatingOrderId(orderId);
      const response = await completeCreditOrder(orderId);
      toast.success("Order marked as completed");
      // Remove the order from both lists
      const updatedOrders = orders.filter(order => order.orderId !== orderId);
      setOrders(updatedOrders);
      setFilteredOrders(updatedOrders.filter(order => {
        // Keep the order in filtered list if it matches current search
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        const customerName = (order.customerName || "").toLowerCase();
        const phoneNumber = (order.phoneNumber || "").toLowerCase();
        return customerName.includes(searchLower) || phoneNumber.includes(searchLower);
      }));
    } catch (error) {
      console.error("Error completing order:", error);
      toast.error("Failed to complete order");
    } finally {
      setUpdatingOrderId(null);
      setOrderToComplete(null);
    }
  };

  const handleCancelComplete = () => {
    setShowConfirmModal(false);
    setOrderToComplete(null);
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

  // Generate unique customer suggestions from orders
  const getCustomerSuggestions = () => {
    const customerMap = new Map();
    orders.forEach(order => {
      const key = `${order.customerName}_${order.phoneNumber}`;
      if (!customerMap.has(key)) {
        customerMap.set(key, {
          name: order.customerName,
          phoneNumber: order.phoneNumber,
          displayText: `${order.customerName} (${order.phoneNumber})`
        });
      }
    });
    return Array.from(customerMap.values());
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.trim() === "") {
      setFilteredOrders(orders);
      setShowSuggestions(false);
      setSuggestions([]);
      return;
    }

    const searchLower = value.toLowerCase();
    
    // Filter orders by customer name or phone number
    const filtered = orders.filter(order => {
      const customerName = (order.customerName || "").toLowerCase();
      const phoneNumber = (order.phoneNumber || "").toLowerCase();
      return customerName.includes(searchLower) || phoneNumber.includes(searchLower);
    });
    
    setFilteredOrders(filtered);

    // Generate suggestions for autocomplete
    const allSuggestions = getCustomerSuggestions();
    const filteredSuggestions = allSuggestions.filter(customer => {
      const nameMatch = customer.name.toLowerCase().includes(searchLower);
      const phoneMatch = customer.phoneNumber.includes(searchLower);
      return nameMatch || phoneMatch;
    });
    
    setSuggestions(filteredSuggestions);
    setShowSuggestions(filteredSuggestions.length > 0 && value.length > 0);
  };

  // Handle suggestion click
  const handleSuggestionClick = (customer) => {
    setSearchTerm(customer.displayText);
    setShowSuggestions(false);
    
    // Filter orders for selected customer
    const filtered = orders.filter(order => {
      const orderName = (order.customerName || "").toLowerCase().trim();
      const orderPhone = (order.phoneNumber || "").replace(/\D/g, '');
      const customerName = customer.name.toLowerCase().trim();
      const customerPhone = customer.phoneNumber.replace(/\D/g, '');
      
      return (orderName === customerName && orderPhone === customerPhone);
    });
    
    setFilteredOrders(filtered);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm("");
    setFilteredOrders(orders);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const totalPendingAmount = filteredOrders.reduce((sum, order) => {
    return sum + (order.pendingAmount || 0);
  }, 0);

  const totalPaidAmount = filteredOrders.reduce((sum, order) => {
    return sum + (order.paidAmount || 0);
  }, 0);

  const totalGrandTotal = filteredOrders.reduce((sum, order) => {
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
              <p className="summary-value">{filteredOrders.length}</p>
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
          <div className="section-header-with-search">
            <h3 className="section-title">
              <i className="bi bi-list-ul"></i> Pending Credit Orders
            </h3>
            
            {/* Search/Filter Input */}
            <div className="credit-search-container">
              <div className="credit-search-wrapper">
                <i className="bi bi-search credit-search-icon"></i>
                <input
                  type="text"
                  className="credit-search-input"
                  placeholder="Search by customer name or phone number..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={() => {
                    if (suggestions.length > 0 && searchTerm.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  onBlur={() => {
                    // Delay hiding suggestions to allow click events
                    setTimeout(() => setShowSuggestions(false), 200);
                  }}
                />
                {searchTerm && (
                  <button
                    className="credit-search-clear"
                    onClick={handleClearSearch}
                    title="Clear search"
                  >
                    <i className="bi bi-x-circle"></i>
                  </button>
                )}
              </div>
              
              {/* Autocomplete Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="credit-suggestions-dropdown">
                  {suggestions.map((customer, index) => (
                    <div
                      key={index}
                      className="credit-suggestion-item"
                      onClick={() => handleSuggestionClick(customer)}
                    >
                      <i className="bi bi-person"></i>
                      <div className="suggestion-content">
                        <span className="suggestion-name">{customer.name}</span>
                        <span className="suggestion-phone">{customer.phoneNumber}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="no-orders-message">
              <i className="bi bi-inbox"></i>
              <p>{searchTerm ? "No orders found matching your search" : "No pending credit orders"}</p>
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
                  {filteredOrders.map((order) => (
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
                            onClick={() => handleCompleteOrderClick(order.orderId)}
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
        />
      )}

      {/* Confirm Complete Order Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={handleCancelComplete}
        onConfirm={handleConfirmComplete}
        title="Mark Order as Completed"
        message={orderToComplete?.order ? 
          `Are you sure you want to mark order ${orderToComplete.order.orderId.substring(0, 12)}... for customer "${orderToComplete.order.customerName}" as completed? This action cannot be undone.` :
          "Mark this order as completed? This action cannot be undone."}
        confirmText="Mark as Completed"
        cancelText="Cancel"
        confirmButtonClass="btn-success"
      />
    </div>
  );
};

export default CreditManagement;

