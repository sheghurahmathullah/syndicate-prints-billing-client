import './ReceiptPopup.css';
import './Print.css';
import {assets} from "../../assets/assets.js";
import {AppConstants} from "../../util/constants.js";

const ReceiptPopup = ({orderDetails, onClose, onPrint}) => {
    // Format date and time
    const formatDateTime = (dateString) => {
        if (!dateString) return new Date().toLocaleString();
        const date = new Date(dateString);
        return date.toLocaleString('en-IN');
    };

    // Calculate tax percentage
    const calculateTaxPercent = () => {
        // If taxPercent is explicitly provided (including 0), use it
        if (orderDetails.taxPercent !== undefined && orderDetails.taxPercent !== null) {
            const percent = Number(orderDetails.taxPercent);
            // Return 0 if it's NaN or negative, otherwise return the value
            return isNaN(percent) || percent < 0 ? 0 : percent;
        }
        // Otherwise calculate from tax and subtotal
        if (orderDetails.subtotal && orderDetails.subtotal > 0 && orderDetails.tax !== undefined && orderDetails.tax !== null) {
            const calculatedPercent = (orderDetails.tax / orderDetails.subtotal) * 100;
            return isNaN(calculatedPercent) || calculatedPercent < 0 ? 0 : calculatedPercent;
        }
        // Default to 0 if no tax information
        return 0;
    };

    const taxPercent = calculateTaxPercent();
    // Show GST only if tax is 1% or more (hide if 0%)
    const showGST = taxPercent >= 1;
    const invoiceTitle = showGST ? "TAX INVOICE" : "INVOICE";

    return (
        <div className="receipt-popup-overlay text-dark">
            <div className="receipt-popup">
                {/* Header with Logo */}
                <div className="receipt-company-header">
                    <img src={assets.logo} alt="Company Logo" className="company-logo" />
                    <div className="company-info">
                        <h3 className="company-name">{AppConstants.SHOP_NAME}</h3>
                        <p className="company-address">{AppConstants.SHOP_ADDRESS}</p>
                        <p className="company-contact">{AppConstants.SHOP_CONTACT}</p>
                    </div>
                </div>

                {/* Divider */}
                <div className="receipt-divider"></div>

                {/* Receipt Title */}
                <div className="receipt-title-section">
                    <h2 className="receipt-title">{invoiceTitle}</h2>
                </div>

                {/* Order Info */}
                <div className="receipt-info-grid">
                    <div>
                        <p><strong>Invoice No:</strong> {orderDetails.orderId || 'N/A'}</p>
                        <p><strong>Date & Time:</strong> {formatDateTime(orderDetails.createdAt)}</p>
                    </div>
                    <div>
                        <p><strong>Customer Name:</strong> {orderDetails.customerName}</p>
                        <p><strong>Phone:</strong> {orderDetails.phoneNumber}</p>
                        {orderDetails.gstin && (
                            <p><strong>GSTIN:</strong> {orderDetails.gstin}</p>
                        )}
                    </div>
                </div>

                {/* Divider */}
                <div className="receipt-divider"></div>

                {/* Items Table */}
                <div className="receipt-table-container">
                    <table className="receipt-table">
                        <thead>
                            <tr>
                                <th>Sr.</th>
                                <th>Item Name</th>
                                <th className="text-center">Qty</th>
                                <th className="text-right">Rate</th>
                                <th className="text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orderDetails.items && orderDetails.items.map((item, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{item.name}</td>
                                    <td className="text-center">{item.quantity}</td>
                                    <td className="text-right">₹{item.price.toFixed(2)}</td>
                                    <td className="text-right">₹{(item.price * item.quantity).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Divider */}
                <div className="receipt-divider"></div>

                {/* Summary */}
                <div className="receipt-summary">
                    <div className="receipt-summary-row">
                        <span>Subtotal:</span>
                        <span>₹{orderDetails.subtotal.toFixed(2)}</span>
                    </div>
                    {showGST && (
                        <div className="receipt-summary-row">
                            <span>GST ({taxPercent.toFixed(2)}%):</span>
                            <span>₹{orderDetails.tax.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="receipt-summary-row receipt-total-row">
                        <span>Total Amount:</span>
                        <span>₹{orderDetails.grandTotal.toFixed(2)}</span>
                    </div>
                </div>

                {/* Payment Details */}
                <div className="receipt-divider"></div>
                <div className="receipt-payment-info">
                    <p><strong>Payment Method:</strong> {orderDetails.paymentMethod}</p>
                </div>

                {/* Footer */}
                <div className="receipt-footer">
                    <p className="thank-you">Thank You for Your Business!</p>
                    {/* <p className="footer-note">This is a computer generated receipt</p> */}
                </div>

                {/* Action Buttons */}
                {/* <div className="receipt-actions">
                    <button className="btn btn-primary btn-print" onClick={onPrint}>
                        <i className="bi bi-printer"></i> Print Receipt
                    </button>

                        <button
                            className="btn btn-close btn-danger "
                            style={{ padding: '0 2px',  color: 'white', width: '20%' }}
                            onClick={onClose}
                        >
                            Close
                        </button>
                </div> */}
                <div className="d-flex justify-content-center gap-3 mt-4">
                    <button className="btn btn-warning" onClick={onPrint}>Print Receipt</button>
                    <button className="btn btn-danger" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    )
}

export default ReceiptPopup;