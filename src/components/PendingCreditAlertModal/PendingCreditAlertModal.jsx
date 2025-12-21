import "./PendingCreditAlertModal.css";
import { createPortal } from "react-dom";

const PendingCreditAlertModal = ({ 
  isOpen, 
  onClose, 
  onProceed, 
  customerName, 
  phoneNumber, 
  pendingOrdersCount, 
  totalPendingAmount, 
  oldestOrderDate 
}) => {
  if (!isOpen) return null;

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (e) {
      return dateString;
    }
  };

  return typeof document !== "undefined" && createPortal(
    <div className="pending-credit-modal-overlay" onClick={onClose}>
      <div className="pending-credit-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="pending-credit-modal-header">
          <div className="pending-credit-modal-icon">
            <i className="bi bi-exclamation-triangle-fill"></i>
          </div>
          <h3>Pending Credit Payment Alert</h3>
        </div>
        
        <div className="pending-credit-modal-body">
          <p className="pending-credit-warning-text">
            This customer already has existing pending credit payment(s).
          </p>
          
          <div className="pending-credit-details">
            <div className="pending-credit-detail-row">
              <span className="detail-label">Customer Name:</span>
              <span className="detail-value">{customerName}</span>
            </div>
            <div className="pending-credit-detail-row">
              <span className="detail-label">Phone Number:</span>
              <span className="detail-value">{phoneNumber}</span>
            </div>
            <div className="pending-credit-detail-row">
              <span className="detail-label">Pending Orders:</span>
              <span className="detail-value highlight">{pendingOrdersCount}</span>
            </div>
            <div className="pending-credit-detail-row">
              <span className="detail-label">Total Pending Amount:</span>
              <span className="detail-value highlight amount">₹{totalPendingAmount.toFixed(2)}</span>
            </div>
            <div className="pending-credit-detail-row">
              <span className="detail-label">Oldest Pending Order Date:</span>
              <span className="detail-value">{formatDate(oldestOrderDate)}</span>
            </div>
          </div>
          
          <div className="pending-credit-notice">
            <i className="bi bi-info-circle"></i>
            <span>Please complete the existing pending payment(s) before creating a new credit order.</span>
          </div>
        </div>
        
        <div className="pending-credit-modal-footer">
          <button 
            className="btn btn-secondary pending-credit-btn-cancel" 
            onClick={onClose}
          >
            <i className="bi bi-x-circle"></i> Cancel Payment
          </button>
          <button 
            className="btn btn-primary pending-credit-btn-proceed" 
            onClick={onProceed}
          >
            <i className="bi bi-check-circle"></i> It's OK, Proceed
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PendingCreditAlertModal;

