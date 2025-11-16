
/* import {useContext, useState} from "react";
import {AppContext} from "../../context/AppContext.jsx";
import ReceiptPopup from "../ReceiptPopup/ReceiptPopup.jsx";
import {createOrder, deleteOrder} from "../../Service/OrderService.js";
import toast from "react-hot-toast";
import {createRazorpayOrder, verifyPayment} from "../../Service/PaymentService.js";
import {AppConstants} from "../../util/constants.js"; */



const DemoCart = ({customerName, mobileNumber, setMobileNumber, setCustomerName}) => {
   
    const {cartItems, clearCart} = useContext(AppContext);
    const [orderDetails, setOrderDetails] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [pendingPaymentMode, setPendingPaymentMode] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    
    const totalAmount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    const tax = totalAmount * 0.01;
    const grandTotal = totalAmount + tax;

        const clearAll = () => {
            setCustomerName('');
            setMobileNumber('');
            clearCart();
        }

        const openConfirm = (mode) => {
            setPendingPaymentMode(mode);
            setShowConfirm(true);
        }

        const handleConfirmNo = () => {
            clearAll();
            setShowConfirm(false);
        }

        const handleConfirmYes = async () => {
            setShowConfirm(false);
            if (pendingPaymentMode) {
                await completePayment(pendingPaymentMode);
                setPendingPaymentMode(null);
            }
        }

        const handlePrintReceipt = () => {
            window.print();
        }

        const loadRazorpayScript = () => new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });

        const deleteOrderOnFailure = async (orderId) => {
            try {
                await deleteOrder(orderId);
            } catch (error) {
                console.error(error);
                toast.error('Something went wrong');
            }
        }

        
        const printAndClear = async (savedOrder) => {
            setOrderDetails(savedOrder);
            setShowPopup(true);
            // small delay to ensure popup is visible
            await new Promise(r => setTimeout(r, 300));
            try {
                window.print();
                await new Promise(r => setTimeout(r, 600));
                window.print();
            } catch (e) {
                console.error('Print failed', e);
            }
            setShowPopup(false);
            clearAll();
        }

        const completePayment = async (paymentMode) => {
            if (!customerName || !mobileNumber) {
                toast.error('Please enter customer details');
                return;
            }
            if (cartItems.length === 0) {
                toast.error('Your cart is empty');
                return;
            }

            const orderData = {
                customerName,
                phoneNumber: mobileNumber,
                items: cartItems,
                subtotal: totalAmount,
                tax,
                grandTotal,
                paymentMethod: paymentMode.toUpperCase()
            };

            setIsProcessing(true);
            try {
                const response = await createOrder(orderData);
                const savedData = response.data;
                if (response.status === 201 && paymentMode === 'cash') {
                    toast.success('Cash received');
                    await printAndClear(savedData);
                } else if (response.status === 201 && paymentMode === 'upi') {
                    const razorpayLoaded = await loadRazorpayScript();
                    if (!razorpayLoaded) {
                        toast.error('Unable to load razorpay');
                        await deleteOrderOnFailure(savedData.orderId);
                        return;
                    }

                    const razorpayResponse = await createRazorpayOrder({amount: grandTotal, currency: 'INR'});
                    const options = {
                        key: AppConstants.RAZORPAY_KEY_ID,
                        amount: razorpayResponse.data.amount,
                        currency: razorpayResponse.data.currency,
                        order_id: razorpayResponse.data.id,
                        name: 'My Retail Shop',
                        description: 'Order payment',
                        handler: async function (response) {
                            await verifyPaymentHandler(response, savedData);
                        },
                        prefill: { name: customerName, contact: mobileNumber },
                        theme: { color: '#3399cc' },
                        modal: {
                            ondismiss: async () => {
                                await deleteOrderOnFailure(savedData.orderId);
                                toast.error('Payment cancelled');
                            }
                        }
                    };

                    const rzp = new window.Razorpay(options);
                    rzp.on('payment.failed', async (response) => {
                        await deleteOrderOnFailure(savedData.orderId);
                        toast.error('Payment failed');
                        console.error(response.error && response.error.description);
                    });
                    rzp.open();
                }
            } catch (error) {
                console.error(error);
                toast.error('Payment processing failed');
            } finally {
                setIsProcessing(false);
            }
        }

        const verifyPaymentHandler = async (response, savedOrder) => {
            const paymentData = {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                orderId: savedOrder.orderId
            };
            try {
                const paymentResponse = await verifyPayment(paymentData);
                if (paymentResponse.status === 200) {
                    toast.success('Payment successful');
                    const withPayment = {
                        ...savedOrder,
                        paymentDetails: {
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature
                        }
                    };
                    await printAndClear(withPayment);
                } else {
                    toast.error('Payment processing failed');
                }
            } catch (error) {
                console.error(error);
                toast.error('Payment failed');
            }
        };


        // Render component //
        return (
            <div className="mt-2">
                <div className="cart-summary-details">
                    <div className="d-flex justify-content-between mb-2">
                        <span className="text-dark">Item: </span>
                        <span className="text-dark">₹{totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                        <span className="text-dark">Tax (1%):</span>
                        <span className="text-dark">₹{tax.toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-4">
                        <span className="text-dark">Total:</span>
                        <span className="text-dark">₹{grandTotal.toFixed(2)}</span>
                    </div>
                </div>

                <div className="d-flex gap-3">
                    <button className="btn btn-success flex-grow-1" onClick={() => openConfirm('cash')} disabled={isProcessing}>
                        {isProcessing ? 'Processing...' : 'Cash'}
                    </button>
                    <button className="btn btn-primary flex-grow-1" onClick={() => openConfirm('upi')} disabled={isProcessing}>
                        {isProcessing ? 'Processing...' : 'UPI'}
                    </button>
                </div>

                <div className="d-flex gap-3 mt-2">
                    <button className="btn btn-warning flex-grow-1" onClick={() => { setShowPopup(true); }} disabled={isProcessing || !orderDetails}>
                        Place Order
                    </button>
                </div>

                {showConfirm && (
                    <div className="confirm-overlay">
                        <div className="confirm-box">
                            <p>Confirm the order?</p>
                            <div className="d-flex gap-2 justify-content-center mt-2">
                                <button className="btn btn-sm btn-primary" onClick={handleConfirmYes}>Yes</button>
                                <button className="btn btn-sm btn-secondary" onClick={handleConfirmNo}>No</button>
                            </div>
                        </div>
                    </div>
                )}

                {showPopup && orderDetails && (
                    <ReceiptPopup
                        orderDetails={{
                            ...orderDetails,
                            razorpayOrderId: orderDetails.paymentDetails?.razorpayOrderId,
                            razorpayPaymentId: orderDetails.paymentDetails?.razorpayPaymentId
                        }}
                        onClose={() => setShowPopup(false)}
                        onPrint={handlePrintReceipt}
                    />
                )}
            </div>
        );
    }

    export default CartSummary;