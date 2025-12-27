import "./PaymentSummary.css";

const PaymentSummary = ({ 
  cartItems, 
  taxPercent, 
  setTaxPercent, 
  enableCredit = false, 
  paidAmount = "", 
  displayGrandTotal,
  gstType = "withGst",
  setGstType
}) => {
  const totalAmount = cartItems.reduce(
    (total, item) => {
      const unitPrice = item.customPrice !== null && item.customPrice !== undefined ? item.customPrice : item.price;
      return total + unitPrice * item.quantity;
    },
    0
  );
  
  // Calculate tax based on GST type
  const effectiveTaxPercent = gstType === "withGst" ? taxPercent : 0;
  const displayTax = totalAmount * (effectiveTaxPercent / 100);
  const grandTotal = displayGrandTotal || (totalAmount + displayTax);
  
  // Calculate credit amounts
  const paidAmountNum = parseFloat(paidAmount) || 0;
  const balanceAmount = Math.max(0, grandTotal - paidAmountNum);
  const totalPaidCredits = enableCredit ? paidAmountNum : 0;
  const totalCredits = enableCredit ? balanceAmount : 0;


  return (
    <div className="payment-summary-container">
      <div className="payment-summary-header">
        <h5>Payment Summary</h5>
      </div>
      <div className="payment-summary-details">
        <div className="summary-row">
          <span className="summary-label">Total Items:</span>
          <span className="summary-value" style={{fontSize: '1.2rem'}}>{cartItems.length}</span>
        </div>
        <div className="summary-row">
          <span className="summary-label">Total Bills without GST:</span>
          <span className="summary-value"style={{fontSize: '1.2rem'}}>₹{totalAmount.toFixed(2)}</span>
        </div>
        
        {/* GST Details - Only show when With GST is selected */}
        {gstType === "withGst" && (
          <div className="summary-row summary-row-tax">
            <div className="tax-control-wrapper">
              <span className="summary-label">GST (SGST + CGST):</span>
              <input
                type="number"
                className="form-control form-control-sm tax-input"
                value={taxPercent}
                min="0"
                step="0.1"
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  if (setTaxPercent) {
                    setTaxPercent(Number.isFinite(v) ? Math.max(0, v) : 0);
                  }
                }}
                aria-label="Tax percentage"
                title="Set tax percentage"
              />
              <span className="tax-percent-symbol">%</span>
            </div>
            <span className="summary-value" style={{fontSize: '1.2rem'}}>₹{displayTax.toFixed(2)}</span>
          </div>
        )}

        {enableCredit && (
          <>
            <div className="summary-row">
              <span className="summary-label">Total Paid Credits:</span>
              <span className="summary-value" style={{fontSize: '1.2rem'}}>₹{totalPaidCredits.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Total Credits:</span>
              <span className="summary-value" style={{fontSize: '1.2rem'}}>₹{totalCredits.toFixed(2)}</span>
            </div>
          </>
        )}
        <div className="summary-row summary-row-total">
          <span className="summary-label-total">Total To Pay:</span>
          <span className="summary-value-total" style={{fontSize: '1.2rem'}}>₹{grandTotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentSummary;

