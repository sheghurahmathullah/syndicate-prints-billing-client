import "./CartSummary.css";
import { useContext, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AppContext } from "../../context/AppContext.jsx";
import { createOrder } from "../../Service/OrderService.js";
import toast from "react-hot-toast";
import PendingCreditAlertModal from "../PendingCreditAlertModal/PendingCreditAlertModal.jsx";

const CartSummary = ({
  customerName,
  mobileNumber,
  customerGstin,
  username,
  setUsername,
  setMobileNumber,
  setCustomerName,
  showUpiOptions,
  setShowUpiOptions,
  showQRModal,
  setShowQRModal,
  qrCodeImage,
  taxPercent,
  setTaxPercent,
  hideSummary = false,
  enableCredit: enableCreditProp,
  setEnableCredit: setEnableCreditProp,
  paidAmount: paidAmountProp,
  setPaidAmount: setPaidAmountProp
}) => {
  const { cartItems, clearCart } = useContext(AppContext);

  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmPaymentType, setConfirmPaymentType] = useState(null);
  
  // Use props if provided, otherwise use local state
  const [enableCreditLocal, setEnableCreditLocal] = useState(false);
  const [paidAmountLocal, setPaidAmountLocal] = useState("");
  
  const enableCredit = enableCreditProp !== undefined ? enableCreditProp : enableCreditLocal;
  const setEnableCredit = setEnableCreditProp || setEnableCreditLocal;
  const paidAmount = paidAmountProp !== undefined ? paidAmountProp : paidAmountLocal;
  const setPaidAmount = setPaidAmountProp || setPaidAmountLocal;
  const [showPendingCreditModal, setShowPendingCreditModal] = useState(false);
  const [pendingCreditData, setPendingCreditData] = useState(null);
  const [pendingOrderData, setPendingOrderData] = useState(null);

  const validateCustomerAndCart = () => {
    if (!customerName || !mobileNumber) {
      toast.error("Please enter customer details");
      return false;
    }

    if(username.trim().length === 0) {
      toast.error("Username cannot be empty! Please select user.");
      return false;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return false;
    }

    return true;
  };

  // Listen for QR proceed event - show confirmation dialog
  useEffect(() => {
    const handleQRProceed = () => {
      setConfirmPaymentType("upi");
      setShowConfirm(true);
    };

    window.addEventListener("qrProceedClicked", handleQRProceed);

    return () => {
      window.removeEventListener("qrProceedClicked", handleQRProceed);
    };
  }, []); 
  
  // Empty dependency array to prevent multiple API calls
  // Commented out unnecessary event listeners to prevent multiple API calls
  // useEffect(() => {
  //   const handleUpiOptionSelected = (e) => {
  //     if (e.detail === "online") {
  //       processPayment("upi");
  //     }
  //   };

  //   const handleQRPaymentReceived = () => {
  //     processQRPayment();
  //   };

  //   const handleQRPaymentCancelled = () => {
  //     toast.info("Payment cancelled");
  //   };

  //   window.addEventListener("upiOptionSelected", handleUpiOptionSelected);
  //   window.addEventListener("qrPaymentReceived", handleQRPaymentReceived);
  //   window.addEventListener("qrPaymentCancelled", handleQRPaymentCancelled);

  //   return () => {
  //     window.removeEventListener("qrPaymentReceived", handleQRPaymentReceived);
  //     window.removeEventListener(
  //       "qrPaymentCancelled",
  //       handleQRPaymentCancelled
  //     );
  //   };
  // }, [customerName, mobileNumber, cartItems, username, taxPercent]);

  const totalAmount = cartItems.reduce(
    (total, item) => {
      const unitPrice = item.customPrice !== null && item.customPrice !== undefined ? item.customPrice : item.price;
      return total + unitPrice * item.quantity;
    },
    0
  );
      // window.removeEventListener("upiOptionSelected", handleUpiOptionSelected);
  const tax = totalAmount * 0.01;
  const grandTotal = totalAmount + tax;

  const clearAll = () => {
    setCustomerName("");
    setMobileNumber("");
    setUsername(null);
    setSelectedPayment(null);
    setEnableCredit(false);
    setPaidAmount("");
    clearCart();
  };

  const handlePlaceOrder = () => {
    if (isProcessing) {
      return;
    }

    if (!selectedPayment) {
      toast.error("Please select a payment method");
      return;
    }

    if (!validateCustomerAndCart()) {
      return;
    }

    // If credit is enabled with payment, validate paid amount
    if (enableCredit && selectedPayment !== "credit") {
      const paid = parseFloat(paidAmount);
      if (!paidAmount || isNaN(paid) || paid < 0) {
        toast.error("Please enter a valid paid amount");
        return;
      }
      if (paid > displayGrandTotal) {
        toast.error("Paid amount cannot exceed total amount");
        return;
      }
    }

    if (selectedPayment === "cash" || selectedPayment === "card" || selectedPayment === "credit") {
      setConfirmPaymentType(selectedPayment);
      setShowConfirm(true);
    } else if (selectedPayment === "upi") {
      
      if (!qrCodeImage) {
        toast.error("UPI QR not configured. Please add it in Settings.");
        return;
      }
      setShowQRModal(true);
    }
  };

  // Commented out - now using processPayment("upi") with confirmation dialog
  // const processQRPayment = async () => {
  //   if (!validateCustomerAndCart()) {
  //     return;
  //   }

  //   const orderData = {
  //     customerName,
  //     username,
  //     phoneNumber: mobileNumber,
  //     cartItems,
  //     subtotal: totalAmount,
  //     tax: displayTax,
  //     grandTotal: displayGrandTotal,
  //     paymentMethod: "UPI",
  //   };

  //   setIsProcessing(true);
  //   try {
  //     const response = await createOrder(orderData);
  //     const savedData = response.data;

  //     if (response.status === 201) {
  //       toast.success("Payment received successfully");
  //       await printAndClear(savedData);
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     toast.error("Payment processing failed");
  //   } finally {
  //     setIsProcessing(false);
  //   }
  // };

  const handleConfirmNo = () => {
    setShowConfirm(false);
    setConfirmPaymentType(null);
  };

  const handleConfirmYes = async () => {
    setShowConfirm(false);
    await processPayment(confirmPaymentType);
    setConfirmPaymentType(null);
  };

  const printAndClear = async (savedOrder) => {
    // Dispatch event to show receipt at Explore page level
    // Use nullish coalescing to allow 0 as a valid value (not default to 1)
    const taxPercentValue = taxPercent !== null && taxPercent !== undefined ? Number(taxPercent) : 0;
    const event = new CustomEvent("showReceipt", {
      detail: {
        ...savedOrder,
        taxPercent: taxPercentValue,
      },
    });
    window.dispatchEvent(event);

    console.log(savedOrder);
    console.log(username);

    // small delay to ensure popup is visible
    // await new Promise((r) => setTimeout(r, 1300));
    // try {
    //   // window.print();
    //   await new Promise((r) => setTimeout(r, 600));
    //   // window.print();
    // } catch (e) {
    //   console.error("Print failed", e);
    // }

    clearAll();
  };

  // Razorpay / online gateway helpers have been removed for now to keep
  // the implementation fully manual for CASH, CARD and UPI payments.

  const displayTax = totalAmount * (taxPercent / 100);
  const displayGrandTotal = totalAmount + displayTax;

  // Helper function to parse error message and extract pending credit info
  const parsePendingCreditError = (errorMessage) => {
    try {
      // Parse the error message format:
      // "Customer 'Name' (Phone: 1234567890) already has X pending credit order(s) with total pending amount of ₹Y. Oldest pending order date: Z. Please complete..."
      const customerMatch = errorMessage.match(/Customer '([^']+)' \(Phone: ([^)]+)\)/);
      const countMatch = errorMessage.match(/already has (\d+) pending credit order/);
      const amountMatch = errorMessage.match(/total pending amount of ₹([\d.]+)/);
      const dateMatch = errorMessage.match(/Oldest pending order date: ([^.]+)/);

      if (customerMatch && countMatch && amountMatch && dateMatch) {
        return {
          customerName: customerMatch[1],
          phoneNumber: customerMatch[2],
          pendingOrdersCount: parseInt(countMatch[1]),
          totalPendingAmount: parseFloat(amountMatch[1]),
          oldestOrderDate: dateMatch[1].trim()
        };
      }
    } catch (e) {
      console.error("Error parsing pending credit error:", e);
    }
    return null;
  };

  // Function to actually create the order (called after user confirms or if no pending orders)
  const createOrderWithData = async (orderData, forceProceed = false) => {
    if (forceProceed) {
      orderData.forceProceed = true;
    }

    setIsProcessing(true);
    try {
      console.log(username);
      console.log("order created", orderData);
      const response = await createOrder(orderData);
      const savedData = response.data;
      return { response, savedData };
    } catch (error) {
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const processPayment = async (paymentMode, forceProceed = false) => {
    if (!validateCustomerAndCart()) {
      return;
    }

    const orderData = {
      customerName,
      username,
      phoneNumber: mobileNumber,
      gstin: customerGstin || null,
      cartItems,
      subtotal: totalAmount,
      tax: displayTax,
      grandTotal: displayGrandTotal,
      paymentMethod: paymentMode.toUpperCase(),
    };

    // Add credit information if credit is enabled
    if (enableCredit && paymentMode !== "credit") {
      const paid = parseFloat(paidAmount) || 0;
      orderData.creditType = "CREDIT";
      orderData.paidAmount = paid;
    } else if (paymentMode === "credit") {
      orderData.creditType = "CREDIT";
      orderData.paidAmount = 0;
    }

    try {
      const { response, savedData } = await createOrderWithData(orderData, forceProceed);

      if (response.status === 201 && paymentMode === "cash") {
        console.log("Cash")
        if (enableCredit) {
          toast.success("Order created with credit payment");
        } else {
          toast.success("Cash received");
        }
        await printAndClear(savedData);
      } else if (response.status === 201 && paymentMode === "card") {
        console.log("Card")
        if (enableCredit) {
          toast.success("Order created with credit payment");
        } else {
          toast.success("Card payment received");
        }
        await printAndClear(savedData);
      } else if (response.status === 201 && paymentMode === "upi") {
        console.log("UPI")
        if (enableCredit) {
          toast.success("Order created with credit payment");
        } else {
          toast.success("UPI payment Successfully done");
        }
        await printAndClear(savedData);
      } else if (response.status === 201 && paymentMode === "credit") {
        console.log("Credit")
        toast.success("Credit order created");
        await printAndClear(savedData);
      }
    } catch (error) {
      console.error(error);
      
      // Check if this is a pending credit order error (for both credit and non-credit orders)
      if (error.response && error.response.status === 400) {
        const errorData = error.response.data;
        const errorMessage = errorData?.message || "";
        
        // Check if error message contains pending credit order information
        if (errorMessage.includes("already has") && errorMessage.includes("pending credit order")) {
          const pendingData = parsePendingCreditError(errorMessage);
          
          if (pendingData) {
            // Extract pending orders list from error response if available
            if (errorData?.pendingOrders && Array.isArray(errorData.pendingOrders)) {
              pendingData.pendingOrders = errorData.pendingOrders;
            }
            
            // Store order data and show modal
            setPendingOrderData({ orderData, paymentMode });
            setPendingCreditData(pendingData);
            setShowPendingCreditModal(true);
            setIsProcessing(false);
            return; // Don't show toast, modal will handle it
          }
        }
      }
      
      // Extract error message from API response for other errors
      let errorMessage = "Payment processing failed";
      
      if (error.response) {
        const errorData = error.response.data;
        if (errorData && errorData.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (error.response.status === 400) {
          errorMessage = errorData?.message || "Invalid request. Please check your input.";
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Show error toast with the specific message
      toast.error(errorMessage, {
        duration: 6000,
        style: {
          maxWidth: '500px',
          whiteSpace: 'pre-wrap',
        }
      });
      setIsProcessing(false);
    }
  };

  // Handle proceed from pending credit modal
  const handleProceedWithPendingCredit = async () => {
    setShowPendingCreditModal(false);
    if (pendingOrderData) {
      await processPayment(pendingOrderData.paymentMode, true);
    }
    setPendingOrderData(null);
    setPendingCreditData(null);
  };

  // Handle cancel from pending credit modal
  const handleCancelPendingCredit = () => {
    setShowPendingCreditModal(false);
    setPendingOrderData(null);
    setPendingCreditData(null);
    setIsProcessing(false);
  };

  return (
    <div className="mt-2">
      <style>{`
                /* Modern overlay + slide-from-top animation */
                .confirm-overlay {
                    position: fixed;
                    inset: 0;
                    display: flex;
                    align-items: center; /* final vertical center */
                    justify-content: center;
                    background: rgba(0,0,0,0.38);
                    backdrop-filter: blur(6px) saturate(120%);
                    z-index: 9999;
                    padding: 2rem;
                }
                .confirm-box {
                    width: min(480px, 92%);
                    background: linear-gradient(180deg, rgba(255,255,255,0.95), rgba(250,250,250,0.9));
                    border-radius: 14px;
                    padding: 20px;
                    box-shadow: 0 10px 30px rgba(10,10,10,0.18);
                    transform: translateY(-30vh);
                    opacity: 0;
                    animation: slideDown 420ms cubic-bezier(.22,.9,.26,1) forwards;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                    border: 1px solid rgba(0,0,0,0.06);
                }
                @keyframes slideDown {
                    from { transform: translateY(-30vh); opacity: 0; }
                    to   { transform: translateY(0);     opacity: 1; }
                }

                .modern-btn {
                    padding: 10px 14px;
                    border-radius: 10px;
                    font-weight: 600;
                    box-shadow: 0 6px 18px rgba(51,153,204,0.12);
                    transition: transform .12s ease, box-shadow .12s ease, opacity .12s ease;
                }
                .modern-btn:active { transform: translateY(1px); }
                .modern-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }

                .cart-summary-details {
                    background: rgba(255,255,255,0.6);
                    border-radius: 12px;
                    padding: 14px;
                    box-shadow: 0 6px 18px rgba(10,10,10,0.06);
                    margin-bottom: 12px;
                }

                .tax-input {
                    width: 88px;
                }
            `}</style>

      {!hideSummary && (
        <div className="cart-summary-details">
          <div className="d-flex justify-content-between mb-2 align-items-center">
            <span className="text-dark">Item:</span>
            <span className="text-dark">₹{totalAmount.toFixed(2)}</span>
          </div>

          <div className="d-flex justify-content-between mb-2 align-items-center">
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span className="text-dark">Tax:</span>
              <input
                type="number"
                className="form-control form-control-sm tax-input"
                value={taxPercent}
                min="0"
                step="0.1"
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setTaxPercent(Number.isFinite(v) ? Math.max(0, v) : 0);
                }}
                aria-label="Tax percentage"
                title="Set tax percentage"
              />
              <span style={{ color: "#666", fontSize: 13 }}>%</span>
            </div>
            <span className="text-dark">₹{displayTax.toFixed(2)}</span>
          </div>

          <div className="d-flex justify-content-between mb-2">
            <span className="text-dark">Total:</span>
            <span className="text-dark">₹{displayGrandTotal.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Compact Payment Controls - Single Row Layout */}
      <div className="compact-payment-container">
        <div className="payment-controls-row">
          <div className="payment-method-compact">
            <label className="payment-label-compact">Payment:</label>
            <div className="dropdown-wrapper-compact">
              <select
                className="form-select payment-dropdown-compact"
                value={selectedPayment === "credit" ? "" : selectedPayment || ""}
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedPayment(e.target.value);
                  }
                }}
                disabled={isProcessing || selectedPayment === "credit"}
              >
                <option value="">Select</option>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
              </select>
              <i className="bi bi-chevron-down dropdown-arrow-compact"></i>
            </div>
          </div>

          <div className="credit-checkbox-compact">
            <label className="credit-checkbox-label-compact">
              <input
                type="checkbox"
                className="credit-checkbox-compact-input"
                checked={enableCredit}
                onChange={(e) => {
                  setEnableCredit(e.target.checked);
                  if (!e.target.checked) {
                    setPaidAmount("");
                  }
                }}
                disabled={isProcessing || !selectedPayment || selectedPayment === "credit"}
              />
              <span className="credit-label-text-compact">Enable Credit</span>
            </label>
          </div>

          {/* Credit Details (only when enabled) - Inline with other controls */}
          {enableCredit && selectedPayment && selectedPayment !== "credit" && (
            <>
              <div className="credit-detail-item">
                <span className="credit-label-compact">Total:</span>
                <span className="credit-value-compact">₹{displayGrandTotal.toFixed(2)}</span>
              </div>
              <div className="credit-detail-item">
                <span className="credit-label-compact">Paid:</span>
                <input
                  type="number"
                  className="credit-input-compact"
                  value={paidAmount}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
                      setPaidAmount(value);
                    }
                  }}
                  placeholder="0.00"
                  min="0"
                  max={displayGrandTotal}
                  step="0.01"
                  disabled={isProcessing}
                />
              </div>
              <div className="credit-detail-item">
                <span className="credit-label-compact">Balance:</span>
                <span className="credit-balance-compact">
                  ₹{Math.max(0, (displayGrandTotal - (parseFloat(paidAmount) || 0))).toFixed(2)}
                </span>
              </div>
            </>
          )}

          <button
            className="btn btn-warning place-order-btn-compact"
            onClick={handlePlaceOrder}
            disabled={isProcessing || !selectedPayment}
          >
            {isProcessing ? "Processing..." : "Place Order"}
          </button>
        </div>
      </div>

      {showConfirm &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="confirm-overlay" role="dialog" aria-modal="true">
            <div className="confirm-box">
              <h4 style={{ margin: 0, fontSize: 18 }}>
                Confirm {confirmPaymentType === "cash" ? "cash" : confirmPaymentType === "card" ? "card" : confirmPaymentType === "credit" ? "credit" : "UPI"} payment?
              </h4>
              <p style={{ margin: 0, color: "#555" }}>
                {confirmPaymentType === "cash" 
                  ? enableCredit 
                    ? `Create credit order with cash payment of ₹${(parseFloat(paidAmount) || 0).toFixed(2)}. Balance: ₹${Math.max(0, (displayGrandTotal - (parseFloat(paidAmount) || 0))).toFixed(2)}. Continue?`
                    : "Please verify before collecting cash. Continue?"
                  : confirmPaymentType === "card"
                  ? enableCredit
                    ? `Create credit order with card payment of ₹${(parseFloat(paidAmount) || 0).toFixed(2)}. Balance: ₹${Math.max(0, (displayGrandTotal - (parseFloat(paidAmount) || 0))).toFixed(2)}. Continue?`
                    : "Please verify before processing card payment. Continue?"
                  : confirmPaymentType === "credit"
                  ? "This order will be billed to customer account. Continue?"
                  : enableCredit
                    ? `Create credit order with UPI payment of ₹${(parseFloat(paidAmount) || 0).toFixed(2)}. Balance: ₹${Math.max(0, (displayGrandTotal - (parseFloat(paidAmount) || 0))).toFixed(2)}. Continue?`
                    : "Please verify payment received via QR code. Continue?"}
              </p>
              <div
                className="d-flex gap-2 justify-content-center"
                style={{ marginTop: 12 }}
              >
                <button
                  className="btn btn-sm btn-primary modern-btn"
                  onClick={handleConfirmYes}
                  style={{ minWidth: 92 }}
                  disabled={isProcessing}
                >
                  Yes
                </button>
                <button
                  className="btn btn-sm btn-outline-secondary modern-btn"
                  onClick={handleConfirmNo}
                  style={{ minWidth: 92 }}
                  disabled={isProcessing}
                >
                  No
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Pending Credit Alert Modal */}
      <PendingCreditAlertModal
        isOpen={showPendingCreditModal}
        onClose={handleCancelPendingCredit}
        onProceed={handleProceedWithPendingCredit}
        customerName={pendingCreditData?.customerName || ""}
        phoneNumber={pendingCreditData?.phoneNumber || ""}
        pendingOrdersCount={pendingCreditData?.pendingOrdersCount || 0}
        totalPendingAmount={pendingCreditData?.totalPendingAmount || 0}
        oldestOrderDate={pendingCreditData?.oldestOrderDate || ""}
        pendingOrders={pendingCreditData?.pendingOrders || []}
      />
    </div>
  );
};

export default CartSummary;
