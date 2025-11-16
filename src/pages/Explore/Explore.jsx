import "./Explore.css";
import { useContext, useState, useEffect } from "react";
import { AppContext } from "../../context/AppContext.jsx";
import DisplayCategory from "../../components/DisplayCategory/DisplayCategory.jsx";
import DisplayItems from "../../components/DisplayItems/DisplayItems.jsx";
import CustomerForm from "../../components/CustomerForm/CustomerForm.jsx";
import CartItems from "../../components/CartItems/CartItems.jsx";
import CartSummary from "../../components/CartSummary/CartSummary.jsx";
import ReceiptPopup from "../../components/ReceiptPopup/ReceiptPopup.jsx";

const Explore = () => {
  const {categories, cartItems } = useContext(AppContext);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [taxPercent, setTaxPercent] = useState(1);
  const [username, setUsername] = useState("");

  // QR Modal states - managed at Explore page level
  const [showUpiOptions, setShowUpiOptions] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeImage, setQRCodeImage] = useState(null);

  // Receipt popup state - managed at Explore page level
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptOrderDetails, setReceiptOrderDetails] = useState(null);

  // Calculate total amount for QR modal
  const totalAmount = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const displayTax = totalAmount * (taxPercent / 100);
  const displayGrandTotal = totalAmount + displayTax;

  // Load QR code from Settings on component mount
  useEffect(() => {
    const savedPaymentConfig = localStorage.getItem("paymentConfig");
    if (savedPaymentConfig) {
      const config = JSON.parse(savedPaymentConfig);
      setQRCodeImage(config.qrCode);
    }
  }, []);

  // Listen for receipt show event
  useEffect(() => {
    const handleShowReceipt = (e) => {
      setReceiptOrderDetails(e.detail);
      setShowReceipt(true);
    };

    window.addEventListener("showReceipt", handleShowReceipt);

    return () => {
      window.removeEventListener("showReceipt", handleShowReceipt);
    };
  }, []);

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleCloseReceipt = () => {
    setShowReceipt(false);
    setReceiptOrderDetails(null);
  };

  return (
    <div className="explore-container text-light">
      <div className="left-column">
        <p className="text-dark fs-4 fst-italic">Categories</p>
        <div className="first-row" style={{ overflowY: "auto" }}>
          <DisplayCategory
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            categories={categories}
          />
        </div>
        <hr className="horizontal-line" />
        <div className="second-row" style={{ overflowY: "auto" }}>
          <DisplayItems selectedCategory={selectedCategory} />
        </div>
      </div>
      <div className="right-column">
        <div className="customer-form-section">
          <CustomerForm
            customerName={customerName}
            mobileNumber={mobileNumber}
            username={username}
            setUsername={setUsername}
            setMobileNumber={setMobileNumber}
            setCustomerName={setCustomerName}
            taxPercent={taxPercent}
            setTaxPercent={setTaxPercent}
          />
        </div>
        <hr className="my-3 text-dark" />
        <div className="cart-items-section">
          <CartItems />
        </div>
        <div className="cart-summary-section">
          <CartSummary
            customerName={customerName}
            mobileNumber={mobileNumber}
            username={username}
            setUsername={setUsername}
            setMobileNumber={setMobileNumber}
            setCustomerName={setCustomerName}
            taxPercent={taxPercent}
            setTaxPercent={setTaxPercent}
            showUpiOptions={showUpiOptions}
            setShowUpiOptions={setShowUpiOptions}
            showQRModal={showQRModal}
            setShowQRModal={setShowQRModal}
            qrCodeImage={qrCodeImage}
          />
        </div>
      </div>

      {/* QR Modals - Rendered at page level, not in cart container */}
      {showUpiOptions && (
        <div
          className="explore-qr-modal-overlay"
          onClick={() => setShowUpiOptions(false)}
        >
          <div
            className="explore-qr-modal-content upi-options-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="explore-qr-modal-header">
              <h3>
                <i className="bi bi-phone"></i>
                Select UPI Payment Method
              </h3>
              <button
                className="explore-qr-close-btn"
                onClick={() => setShowUpiOptions(false)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="explore-qr-modal-body">
              <p className="upi-options-subtitle">
                Choose how you want to receive payment
              </p>
              <div className="upi-options-grid">
                <button
                  className="upi-option-card"
                  onClick={() => {
                    setShowUpiOptions(false);
                    // Trigger online UPI in CartSummary
                    const event = new CustomEvent("upiOptionSelected", {
                      detail: "online",
                    });
                    window.dispatchEvent(event);
                  }}
                >
                  <div className="upi-option-icon">
                    <i className="bi bi-credit-card-2-front"></i>
                  </div>
                  <h4>Online UPI</h4>
                  <p>Payment via Razorpay</p>
                </button>
                <button
                  className="upi-option-card"
                  onClick={() => {
                    setShowUpiOptions(false);
                    setShowQRModal(true);
                  }}
                  disabled={!qrCodeImage}
                >
                  <div className="upi-option-icon">
                    <i className="bi bi-qr-code"></i>
                  </div>
                  <h4>Scan QR Code</h4>
                  <p>
                    {qrCodeImage ? "Customer scans QR" : "QR not configured"}
                  </p>
                </button>
              </div>
              {!qrCodeImage && (
                <div className="qr-warning">
                  <i className="bi bi-exclamation-triangle"></i>
                  <span>
                    Please configure QR code in Settings to use this option
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showQRModal && qrCodeImage && (
        <div
          className="explore-qr-modal-overlay"
          onClick={() => setShowQRModal(false)}
        >
          <div
            className="explore-qr-modal-content qr-display-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="explore-qr-modal-header">
              <h3>
                <i className="bi bi-qr-code-scan"></i>
                Scan QR Code to Pay
              </h3>
              <button
                className="explore-qr-close-btn"
                onClick={() => setShowQRModal(false)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="explore-qr-modal-body">
              <div className="qr-amount-display">
                <span className="qr-amount-label">Amount to Pay:</span>
                <span className="qr-amount-value">
                  ₹{displayGrandTotal.toFixed(2)}
                </span>
              </div>
              <div className="qr-code-display">
                <img src={qrCodeImage} alt="UPI QR Code" />
              </div>
              <p className="qr-instruction">
                <i className="bi bi-info-circle"></i>
                Ask customer to scan this QR code using any UPI app
              </p>
              <div className="qr-action-buttons">
                <button
                  className="btn-qr-received"
                  onClick={() => {
                    setShowQRModal(false);
                    // Trigger QR payment received in CartSummary
                    const event = new CustomEvent("qrPaymentReceived");
                    window.dispatchEvent(event);
                  }}
                >
                  <i className="bi bi-check-circle"></i>
                  Payment Received
                </button>
                <button
                  className="btn-qr-cancel"
                  onClick={() => {
                    setShowQRModal(false);
                    // Trigger QR payment cancel in CartSummary
                    const event = new CustomEvent("qrPaymentCancelled");
                    window.dispatchEvent(event);
                  }}
                >
                  <i className="bi bi-x-circle"></i>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Popup - Rendered at page level, not in cart container */}
      {showReceipt && receiptOrderDetails && (
        <div className="explore-receipt-overlay">
          <ReceiptPopup
            orderDetails={receiptOrderDetails}
            onClose={handleCloseReceipt}
            onPrint={handlePrintReceipt}
          />
        </div>
      )}
    </div>
  );
};

export default Explore;
