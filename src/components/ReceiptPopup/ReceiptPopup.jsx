import "./ReceiptPopup.css";
import { assets } from "../../assets/assets.js";

const ReceiptPopup = ({ orderDetails, onClose }) => {
  // Shop constants
  const SHOP_NAME = "SYNDICATE PRINTERS";
  const SHOP_ADDRESS_LINE1 = "BHARATHY SALAI, OPP JAMBAZAR POLICE STATION,";
  const SHOP_ADDRESS_LINE2 = "ROYAPETTAH, CHENNAI - 14";
  const SHOP_CONTACT =
    "PH: +91 9840031990 | EMAIL: printsyndicate2023@gmail.com";
  const SHOP_GSTIN = "33ALSPS7215E1ZW";
  const handlePrintReceipt = () => {
    window.print();
  };

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
  const isNonGst =
    taxPercent < 1 && (!orderDetails.tax || orderDetails.tax < 0.01);

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

  // Extract EST NO from invoice number (format: XX-XX)
  const extractEstNo = (invoiceNumber) => {
    if (!invoiceNumber) return "N/A";
    // Try to extract pattern like "14-24" from invoice number
    const match = invoiceNumber.match(/(\d+)-(\d+)/);
    if (match) {
      return match[0];
    }
    // If no pattern found, use last part or return as is
    return invoiceNumber.split("-").slice(-2).join("-") || invoiceNumber;
  };

  const estNo = extractEstNo(billNumber);

  // Render Non-GST Bill (BILL ESTIMATE format)
  if (isNonGst) {
    return (
      <div className="receipt-popup-overlay">
        <div className="receipt-popup non-gst-receipt">
          <style>{`
            @media print {
              .bill-estimate-title {
                font-size: 9px !important;
                letter-spacing: 0.6px !important;
              }
              .non-gst-transaction-row {
                font-size: 9px !important;
              }
              .non-gst-table th,
              .non-gst-table td {
                font-size: 9px !important;
              }
              .non-gst-summary {
                margin: 2px 0 !important;
                padding: 1px 0 !important;
              }
              .non-gst-summary-row {
                padding: 1px 0 !important;
                margin: 0 !important;
                font-size: 10px !important;
              }
              .non-gst-total-amount-row {
                padding: 1px 0 !important;
                margin: 0 !important;
                font-size: 11px !important;
              }
              .non-gst-footer-message {
                font-size: 9px !important;
              }
            }
          `}</style>
          <div id="receipt-print-area" className="receipt-print-area">
            {/* BILL ESTIMATE Header */}
            <div className="non-gst-header">
              <h1
                className="bill-estimate-title"
                style={{ fontSize: "15px", fontWeight: "bold" }}
              >
                BILL ESTIMATE
              </h1>
            </div>

            {/* Transaction Details */}
            <div className="non-gst-transaction-details">
              <div className="non-gst-transaction-row">
                <span className="non-gst-left">
                  <strong>EST NO :</strong> {estNo}
                </span>
                <span className="non-gst-right">
                  <strong>DATE :</strong>{" "}
                  {formatDateTime(orderDetails.createdAt)}
                </span>
              </div>
              <div className="non-gst-transaction-row">
                <span className="non-gst-left">
                  <strong>ATTENDED BY :</strong> {orderDetails.username || "1"}
                </span>
                <span className="non-gst-right">
                  <strong>CUSTOMER :</strong> {orderDetails.customerName}
                </span>
              </div>
            </div>

            {/* Items Table */}
            <div className="non-gst-table-container">
              <table className="non-gst-table">
                <thead>
                  <tr>
                    <th>ITEM</th>
                    <th className="text-center">QTY</th>
                    <th className="text-right">RATE</th>
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
                          <td className="text-right">
                            ₹{item.price.toFixed(2)}
                          </td>
                          <td className="text-right">
                            ₹{itemAmount.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div
              className="non-gst-summary"
              style={{ margin: "3px 0", padding: "2px 0" }}
            >
              <div
                className="non-gst-summary-row non-gst-total-amount-row"
                style={{ padding: "2px 0", margin: "0" }}
              >
                <span>
                  <strong>TOTAL AMOUNT</strong>
                </span>
                <span>₹{orderDetails.grandTotal.toFixed(2)}</span>
              </div>
              {orderDetails.creditType === "CREDIT" && creditAmount > 0 && (
                <div
                  className="non-gst-summary-row"
                  style={{ padding: "2px 0", margin: "0" }}
                >
                  <span>
                    <strong>CREDIT</strong>
                  </span>
                  <span>₹{creditAmount.toFixed(2)}</span>
                </div>
              )}
              {orderDetails.creditType === "CREDIT" && (
                <>
                  <div
                    className="non-gst-summary-row"
                    style={{ padding: "2px 0", margin: "0" }}
                  >
                    <span>
                      <strong>NET AMOUNT</strong>
                    </span>
                    <span>₹{netAmount.toFixed(0)}</span>
                  </div>
                </>
              )}
              <div
                className="non-gst-summary-row"
                style={{ padding: "3px 0", margin: "0" }}
              >
                <span>
                  <strong>TOTAL PAID</strong>
                </span>
                <span>₹{totalPaid.toFixed(2)}</span>
              </div>
            </div>

            {/* Footer */}
            <div
              className="non-gst-footer"
              style={{ margin: "4px 0", paddingTop: "4px" }}
            >
              <p
                className="non-gst-footer-message"
                style={{ marginTop: "3px", paddingTop: "3px" }}
              >
                * GST EXTRA AS APPLICABLE
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="d-flex justify-content-center gap-3 mt-4 no-print">
            <button className="btn btn-warning" onClick={handlePrintReceipt}>
              Print Receipt
            </button>
            <button className="btn btn-danger" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render GST Bill (Current design)
  return (
    <div className="receipt-popup-overlay">
      <div className="receipt-popup">
        <div id="receipt-print-area" className="receipt-print-area">
          {/* Company Header */}
          <div className="receipt-company-header">
            <div className="company-logo-name">
              {assets.logo && (
                <img src={assets.logo} alt="Syndicate Printers Logo" className="company-logo" />
              )}
              <h1 className="company-name">{SHOP_NAME.toUpperCase()}</h1>
            </div>
            <p className="company-address">{SHOP_ADDRESS_LINE1}</p>
            <p className="company-address">{SHOP_ADDRESS_LINE2}</p>
            <p className="company-contact">{SHOP_CONTACT}</p>
            <p className="company-gstin">
              <strong>GSTIN:</strong> {SHOP_GSTIN || "N/A"}
            </p>
            {orderDetails.gstin && !isNonGst && (
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
                          {taxPercent >= 1 ? `${taxPercent.toFixed(0)}%` : "0%"}
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
        </div>

        {/* Action Buttons */}
        <div className="d-flex justify-content-center gap-3 mt-4 no-print">
          <button className="btn btn-warning" onClick={handlePrintReceipt}>
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
