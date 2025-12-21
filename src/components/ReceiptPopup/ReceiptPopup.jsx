import "./ReceiptPopup.css";
import "./Print.css";
import { AppConstants } from "../../util/constants.js";
import { assets } from "../../assets/assets.js";

const ReceiptPopup = ({ orderDetails, onClose, onPrint }) => {
  // Format date and time to match receipt format: YYYY-MM-DD HH:MM:S
  const formatDateTime = (dateString) => {
    if (!dateString) return new Date().toLocaleString();
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = date.getSeconds(); // No padding to match image format
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // Calculate tax percentage
  const calculateTaxPercent = () => {
    if (
      orderDetails.taxPercent !== undefined &&
      orderDetails.taxPercent !== null
    ) {
      const percent = Number(orderDetails.taxPercent);
      return isNaN(percent) || percent < 0 ? 0 : percent;
    }
    if (
      orderDetails.subtotal &&
      orderDetails.subtotal > 0 &&
      orderDetails.tax !== undefined &&
      orderDetails.tax !== null
    ) {
      const calculatedPercent =
        (orderDetails.tax / orderDetails.subtotal) * 100;
      return isNaN(calculatedPercent) || calculatedPercent < 0
        ? 0
        : calculatedPercent;
    }
    return 0;
  };

  const taxPercent = calculateTaxPercent();
  const showGST = taxPercent >= 1;

  // Calculate net amount and credit
  // For credit orders: NET AMOUNT = GRAND TOTAL - CREDIT (pending amount)
  // CREDIT = pendingAmount
  // TOTAL PAID = paidAmount
  const creditAmount =
    orderDetails.creditType === "CREDIT" ? orderDetails.pendingAmount || 0 : 0;
  const netAmount =
    orderDetails.creditType === "CREDIT" && creditAmount > 0
      ? orderDetails.grandTotal - creditAmount
      : orderDetails.grandTotal;
  const totalPaid =
    orderDetails.creditType === "CREDIT"
      ? orderDetails.paidAmount || 0
      : orderDetails.grandTotal;

  // Get bill number - use invoiceNumber if available, otherwise use orderId
  const billNumber =
    orderDetails.invoiceNumber || orderDetails.orderId || "N/A";

  return (
    <div className="receipt-popup-overlay">
      <div className="receipt-popup">
        {/* Company Header */}
        <div className="receipt-company-header">
          <div className="company-logo-name">
            <img
              src={assets.logo}
              alt="Company Logo"
              className="company-logo"
            />
            <h1 className="company-name">
              {AppConstants.SHOP_NAME.toUpperCase()}
            </h1>
          </div>
          <p className="company-address">{AppConstants.SHOP_ADDRESS_LINE1}</p>
          <p className="company-address">{AppConstants.SHOP_ADDRESS_LINE2}</p>
          <p className="company-contact">{AppConstants.SHOP_CONTACT}</p>
          <p className="company-gstin">
            <strong>GSTIN:</strong> {AppConstants.SHOP_GSTIN || "N/A"}
          </p>
          {orderDetails.gstin && (
            <p className="customer-gstin">
              <strong>CUSTOMER GSTIN:</strong> {orderDetails.gstin}
            </p>
          )}
        </div>

        {/* Transaction Details */}
        <div className="receipt-transaction-details">
          <div className="transaction-row-two-columns">
            <span className="transaction-left">
              <strong>BILL NO:</strong> {billNumber}
            </span>
            <span className="transaction-right">
              <strong>DATE:</strong> {formatDateTime(orderDetails.createdAt)}
            </span>
          </div>

          {/* Divider */}
          <div className="receipt-divider"></div>

          <div className="transaction-row-two-columns">
            <span className="transaction-left">
              <strong>ATTENDED BY:</strong> {orderDetails.username || "STAFF"}
            </span>
            <span className="transaction-right">
              <strong>CUSTOMER:</strong> {orderDetails.customerName}
            </span>
          </div>
        </div>

        {/* Divider after transaction details */}
        <div className="receipt-divider"></div>

        {/* Items Table */}
        <div className="receipt-table-container">
          <table className="receipt-table">
            <thead>
              <tr>
                <th>ITEM</th>
                <th className="text-center">QTY</th>
                <th className="text-right">RATE</th>
                <th className="text-right">GST</th>
                <th className="text-right">AMT</th>
              </tr>
            </thead>
            <tbody>
              {orderDetails.items &&
                orderDetails.items.map((item, index) => {
                  const itemAmount = item.price * item.quantity;
                  return (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td className="text-center">{item.quantity}</td>
                      <td className="text-right">₹{item.price.toFixed(2)}</td>
                      <td className="text-right">
                        {showGST ? `${taxPercent.toFixed(0)}%` : "0%"}
                      </td>
                      <td className="text-right">₹{itemAmount.toFixed(2)}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="receipt-summary">
          <div className="receipt-summary-row">
            <span>
              <strong>GST (SGST + CGST):</strong>
            </span>
            <span>
              ₹{orderDetails.tax ? orderDetails.tax.toFixed(2) : "0.00"}
            </span>
          </div>
          <div className="receipt-summary-row receipt-total-amount-row">
            <span>
              <strong>TOTAL AMOUNT:</strong>
            </span>
            <span>₹{orderDetails.grandTotal.toFixed(2)}</span>
          </div>
          <div className="receipt-divider"></div>
          {orderDetails.creditType === "CREDIT" && creditAmount > 0 && (
            <div className="receipt-summary-row">
              <span>
                <strong>CREDIT:</strong>
              </span>
              <span>₹{creditAmount.toFixed(2)}</span>
            </div>
          )}
          {orderDetails.creditType === "CREDIT" && (
            <>
              <div className="receipt-summary-row">
                <span>
                  <strong>NET AMOUNT:</strong>
                </span>
                <span>₹{netAmount.toFixed(2)}</span>
              </div>
              <div className="receipt-divider"></div>
            </>
          )}
          <div className="receipt-summary-row">
            <span>
              <strong>TOTAL PAID:</strong>
            </span>
            <span>₹{totalPaid.toFixed(2)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="receipt-footer">
          <p className="footer-message">
            THANKS FOR CHOOSING US..WELCOME AGAIN
          </p>
        </div>

        {/* Action Buttons */}
        <div className="d-flex justify-content-center gap-3 mt-4">
          <button className="btn btn-warning" onClick={onPrint}>
            Print Receipt
          </button>
          <button className="btn btn-danger" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPopup;
