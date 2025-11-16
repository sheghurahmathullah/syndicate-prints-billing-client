import "./CartSummary.css";
import { useContext, useState, useEffect } from "react";
import { AppContext } from "../../context/AppContext.jsx";
import ReceiptPopup from "../ReceiptPopup/ReceiptPopup.jsx";
import { createOrder, deleteOrder } from "../../Service/OrderService.js";
import toast from "react-hot-toast";
import {
  createRazorpayOrder,
  verifyPayment,
} from "../../Service/PaymentService.js";
import { AppConstants } from "../../util/constants.js";

const CartSummary = ({
  customerName,
  mobileNumber,
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
  setTaxPercent
}) => {
  const { cartItems, clearCart } = useContext(AppContext);

  const [isProcessing, setIsProcessing] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  // Listen for custom events from Explore page modals
  useEffect(() => {
    const handleUpiOptionSelected = (e) => {
      if (e.detail === "online") {
        setPendingPaymentMode("upi");
        setShowConfirm(true);
      }
    };

    const handleQRPaymentReceived = () => {
      processQRPayment();
    };

    const handleQRPaymentCancelled = () => {
      toast.info("Payment cancelled");
    };

    window.addEventListener("upiOptionSelected", handleUpiOptionSelected);
    window.addEventListener("qrPaymentReceived", handleQRPaymentReceived);
    window.addEventListener("qrPaymentCancelled", handleQRPaymentCancelled);

    return () => {
      window.removeEventListener("upiOptionSelected", handleUpiOptionSelected);
      window.removeEventListener("qrPaymentReceived", handleQRPaymentReceived);
      window.removeEventListener(
        "qrPaymentCancelled",
        handleQRPaymentCancelled
      );
    };
  }, [customerName, mobileNumber, cartItems, username]);

  const totalAmount = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const tax = totalAmount * 0.01;
  const grandTotal = totalAmount + tax;

  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingPaymentMode, setPendingPaymentMode] = useState(null);

  const clearAll = () => {
    setUsername(null);
    setCustomerName("");
    setMobileNumber("");
    clearCart();
  };

  const openConfirm = (mode) => {
    if (mode === "upi") {
      // Show UPI options modal at Explore page level
      setShowUpiOptions(true);
    } else {
      setPendingPaymentMode(mode);
      setShowConfirm(true);
    }
  };

  const processQRPayment = async () => {
    if (!customerName || !mobileNumber) {
      toast.error("Please enter customer details");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    const orderData = {
      customerName,
      username,
      phoneNumber: mobileNumber,
      cartItems,
      subtotal: totalAmount,
      tax: displayTax,
      grandTotal: displayGrandTotal,
      paymentMethod: "UPI",
    };

    setIsProcessing(true);
    try {
      const response = await createOrder(orderData);
      const savedData = response.data;

      if (response.status === 201) {
        toast.success("Payment received successfully");
        await printAndClear(savedData);
      }
    } catch (error) {
      console.error(error);
      toast.error("Payment processing failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmNo = () => {
    clearAll();
    setShowConfirm(false);
  };

  const handleConfirmYes = async () => {
    setShowConfirm(false);
    if (pendingPaymentMode) {
      await completePayment(pendingPaymentMode);
      setPendingPaymentMode(null);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const placeOrder = () => {
    if (orderDetails) {
      const event = new CustomEvent("showReceipt", {
        detail: {
          ...orderDetails,
          taxPercent: Number(taxPercent) || 1,
        },
      });
      window.dispatchEvent(event);
    }
    clearAll();
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const deleteOrderOnFailure = async (orderId) => {
    try {
      await deleteOrder(orderId);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  const printAndClear = async (savedOrder) => {
    // Dispatch event to show receipt at Explore page level
    const event = new CustomEvent("showReceipt", {
      detail: {
        ...savedOrder,
        taxPercent: Number(taxPercent) || 1,
      },
    });
    window.dispatchEvent(event);

    console.log(savedOrder);
    console.log(username);

    // small delay to ensure popup is visible
    await new Promise((r) => setTimeout(r, 13000));
    try {
      // window.print();
      await new Promise((r) => setTimeout(r, 600));
      // window.print();
    } catch (e) {
      console.error("Print failed", e);
    }

    clearAll();
  };

  const completePayment = async (paymentMode) => {
    if (!customerName || !mobileNumber) {
      toast.error("Please enter customer details");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    const orderData = {
      username,
      customerName,
      phoneNumber: mobileNumber,
      cartItems,
      subtotal: totalAmount,
      tax,
      grandTotal,
      paymentMethod: paymentMode.toUpperCase(),
    };
    setIsProcessing(true);
    try {
      console.log(username);
      const response = await createOrder(orderData);
      const savedData = response.data;
      console.log("order created", savedData);
      if (response.status === 201 && paymentMode === "cash") {
        toast.success("Cash received");
        clearAll();
        // setOrderDetails(savedData);
        await printAndClear(savedData);
      } else if (response.status === 201 && paymentMode === "upi") {
        const razorpayLoaded = await loadRazorpayScript();
        if (!razorpayLoaded) {
          toast.error("Unable to load razorpay");
          await deleteOrderOnFailure(savedData.orderId);
          return;
        }

        //create razorpay order
        const razorpayResponse = await createRazorpayOrder({
          amount: grandTotal,
          currency: "INR",
        });
        const options = {
          key: AppConstants.RAZORPAY_KEY_ID,
          amount: razorpayResponse.data.amount,
          currency: razorpayResponse.data.currency,
          order_id: razorpayResponse.data.id,
          name: "My Retail Shop",
          description: "Order payment",
          handler: async function (response) {
            await verifyPaymentHandler(response, savedData);
          },
          prefill: {
            username: username,
            name: customerName,
            contact: mobileNumber,
          },
          theme: {
            color: "#3399cc",
          },
          modal: {
            ondismiss: async () => {
              await deleteOrderOnFailure(savedData.orderId);
              toast.error("Payment cancelled");
            },
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", async (response) => {
          await deleteOrderOnFailure(savedData.orderId);
          toast.error("Payment failed");
          console.error(response.error.description);
        });
        rzp.open();
      }
    } catch (error) {
      console.error(error);
      toast.error("Payment processing failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const verifyPaymentHandler = async (response, savedOrder) => {
    const paymentData = {
      razorpayOrderId: response.razorpay_order_id,
      razorpayPaymentId: response.razorpay_payment_id,
      razorpaySignature: response.razorpay_signature,
      orderId: savedOrder.orderId,
    };
    try {
      const paymentResponse = await verifyPayment(paymentData);
      if (paymentResponse.status === 200) {
        toast.success("Payment successful");
        const orderWithPayment = {
          ...savedOrder,
          paymentDetails: {
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          },
        };
        setOrderDetails(orderWithPayment);

        // Show receipt
        const event = new CustomEvent("showReceipt", {
          detail: {
            ...orderWithPayment,
            taxPercent: Number(taxPercent) || 1,
          },
        });
        window.dispatchEvent(event);
      } else {
        toast.error("Payment processing failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Payment failed");
    }
  };

  const displayTax = totalAmount * (taxPercent / 100);
  const displayGrandTotal = totalAmount + displayTax;

  const processPayment = async (paymentMode) => {
    if (!customerName || !mobileNumber) {
      toast.error("Please enter customer details");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    const orderData = {
      customerName,
      username,
      phoneNumber: mobileNumber,
      cartItems,
      subtotal: totalAmount,
      tax: displayTax,
      grandTotal: displayGrandTotal,
      paymentMethod: paymentMode.toUpperCase(),
    };

    setIsProcessing(true);
    try {
      console.log(username);
      
      console.log("order created", orderData  );
      const response = await createOrder(orderData);
      const savedData = response.data;

      if (response.status === 201 && paymentMode === "cash") {
        toast.success("Cash received");
        clearAll();
        await printAndClear(savedData);
      } else if (response.status === 201 && paymentMode === "upi") {
        const razorpayLoaded = await loadRazorpayScript();
        if (!razorpayLoaded) {
          toast.error("Unable to load razorpay");
          await deleteOrderOnFailure(savedData.orderId);
          return;
        }

        // create razorpay order
        const razorpayResponse = await createRazorpayOrder({
          amount: displayGrandTotal,
          currency: "INR",
        });
        const options = {
          key: AppConstants.RAZORPAY_KEY_ID,
          amount: razorpayResponse.data.amount,
          currency: razorpayResponse.data.currency,
          order_id: razorpayResponse.data.id,
          name: "My Retail Shop",
          description: "Order payment",
          handler: async function (response) {
            await verifyPaymentHandler(response, savedData);
          },
          prefill: {
            name: customerName,
            contact: mobileNumber,
          },
          theme: {
            color: "#3399cc",
          },
          modal: {
            ondismiss: async () => {
              await deleteOrderOnFailure(savedData.orderId);
              toast.error("Payment cancelled");
            },
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", async (response) => {
          await deleteOrderOnFailure(savedData.orderId);
          toast.error("Payment failed");
          console.error(response.error.description);
        });
        rzp.open();
      }
    } catch (error) {
      console.error(error);
      toast.error("Payment processing failed");
    } finally {
      setIsProcessing(false);
    }
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

      <div className="d-flex gap-3">
        <button
          className="btn btn-success flex-grow-1 modern-btn"
          onClick={() => {
            openConfirm("cash");
          }}
          disabled={isProcessing}
        >
          {isProcessing ? "Processing..." : "Cash"}
        </button>
        <button
          className="btn btn-primary flex-grow-1 modern-btn"
          onClick={() => {
            openConfirm("upi");
          }}
          disabled={isProcessing}
        >
          {isProcessing ? "Processing..." : "UPI"}
        </button>
      </div>

      <div className="d-flex gap-3 mt-2 py-1">
        <button
          className="btn btn-warning flex-grow-1 modern-btn"
          onClick={placeOrder}
          disabled={isProcessing || !orderDetails}
        >
          Place Order
          {/* {isProcessing ? 'Place order...' : 'Order Summary'}  */}
        </button>
      </div>

      {showConfirm && (
        <div className="confirm-overlay" role="dialog" aria-modal="true">
          <div className="confirm-box">
            <h4 style={{ margin: 0, fontSize: 18 }}>Confirm the order</h4>
            <p style={{ margin: 0, color: "#555" }}>
              Proceed with the selected payment method?
            </p>
            <div
              className="d-flex gap-2 justify-content-center"
              style={{ marginTop: 12 }}
            >
              <button
                className="btn btn-sm btn-primary modern-btn"
                onClick={async () => {
                  setShowConfirm(false);
                  if (pendingPaymentMode) {
                    await processPayment(pendingPaymentMode);
                    setPendingPaymentMode(null);
                  }
                }}
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
        </div>
      )}
    </div>
  );
};

export default CartSummary;
