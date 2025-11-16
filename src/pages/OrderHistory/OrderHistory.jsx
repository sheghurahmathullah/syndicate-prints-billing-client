import "./OrderHistory.css";
import { useEffect, useState } from "react";
import { latestOrders } from "../../Service/OrderService.js";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await latestOrders();
        setOrders(response.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const formatItems = (items) => {
    return items.map((item) => `${item.name} x ${item.quantity}`).join(", ");
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  // Pagination logic
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = orders.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const goToPrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // Compute sliding window of up to 3 page numbers
  const getPageNumbers = () => {
    if (totalPages <= 3) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    let start = Math.max(1, Math.min(currentPage - 1, totalPages - 2));
    let end = Math.min(totalPages, start + 2);
    if (end - start < 2) {
      start = Math.max(1, end - 2);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  if (loading) {
    return (
      <div className="orders-history-container">
        <div className="loading-state">
          <i className="bi bi-hourglass-split"></i>
          Loading orders...
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="orders-history-container">
        <div className="empty-state">
          <i className="bi bi-inbox"></i>
          No orders found
        </div>
      </div>
    );
  }

  return (
    <div className="orders-history-container">
      <h2>
        <i className="bi bi-clock-history"></i>
        Order History
      </h2>

      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>Order Id</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.map((order) => (
              <tr key={order.orderId}>
                <td>{order.orderId}</td>
                <td>
                  {order.customerName} <br />
                  <small className="text-muted">{order.phoneNumber}</small>
                </td>
                <td>{formatItems(order.items)}</td>
                <td>₹{order.grandTotal}</td>
                <td>{order.paymentMethod}</td>
                <td>
                  <span
                    className={`badge ${
                      order.paymentDetails?.status === "COMPLETED"
                        ? "bg-success"
                        : "bg-warning text-dark"
                    }`}
                  >
                    {order.paymentDetails?.status || "PENDING"}
                  </span>
                </td>
                <td>{formatDate(order.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination-container">
          <button
            onClick={goToPrevious}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            <i className="bi bi-chevron-left"></i> Previous
          </button>

          <div className="page-numbers">
            {getPageNumbers().map((page) => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`page-number ${
                  currentPage === page ? "active" : ""
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={goToNext}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next <i className="bi bi-chevron-right"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
