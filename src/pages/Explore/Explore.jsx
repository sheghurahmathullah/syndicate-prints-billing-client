import "./Explore.css";
import { useContext, useState, useEffect, useRef } from "react";
import { AppContext } from "../../context/AppContext.jsx";
import PaymentSummary from "../../components/PaymentSummary/PaymentSummary.jsx";
import CartSummary from "../../components/CartSummary/CartSummary.jsx";
import ReceiptPopup from "../../components/ReceiptPopup/ReceiptPopup.jsx";
import toast from "react-hot-toast";
import { fetchCustomers } from "../../Service/CustomerService.js";
import { fetchDashboardData } from "../../Service/Dashboard.js";

const Explore = () => {
  const { itemsData, cartItems, addToCart, removeFromCart, updateQuantity, updateCustomPrice, users } = useContext(AppContext);
  const [customerName, setCustomerName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [customerGstin, setCustomerGstin] = useState("");
  const [taxPercent, setTaxPercent] = useState(18); // Default 18% for GST
  const [gstType, setGstType] = useState("withGst"); // "withGst" or "withoutGst"
  const [username, setUsername] = useState("");
  const [billNumber, setBillNumber] = useState(""); // Placeholder, will be generated on backend
  const inputBufferRef = useRef("");
  const bufferTimeoutRef = useRef(null);
  
  // Credit state - lifted to Explore to share between CartSummary and PaymentSummary
  const [enableCredit, setEnableCredit] = useState(false);
  const [paidAmount, setPaidAmount] = useState("");
  
  // Track which row input is currently being edited
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [editingInputValue, setEditingInputValue] = useState("");

  // Customer autocomplete state
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const customerNameInputRef = useRef(null);
  
  // Item autocomplete state
  const [itemSuggestions, setItemSuggestions] = useState([]);
  const [showItemSuggestions, setShowItemSuggestions] = useState(false);
  const [activeItemSuggestionsRow, setActiveItemSuggestionsRow] = useState(null);
  
  // Get table rows - always show at least 5 rows
  const getTableRows = () => {
    const minRows = 5;
    const maxRows = Math.max(cartItems.length, minRows);
    const rows = [];
    
    // Add cart items as rows
    for (let i = 0; i < maxRows; i++) {
      if (i < cartItems.length) {
        rows.push(cartItems[i]);
      } else {
        rows.push(null); // Empty row
      }
    }
    return rows;
  };
  
  const tableRows = getTableRows();

  // QR Modal states - managed at Explore page level
  const [showUpiOptions, setShowUpiOptions] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeImage, setQRCodeImage] = useState(null);

  // Receipt popup state - managed at Explore page level
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptOrderDetails, setReceiptOrderDetails] = useState(null);

  // Calculate total amount for QR modal (using custom prices if available)
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
  const displayGrandTotal = totalAmount + displayTax;

  // Load QR code from Settings on component mount
  useEffect(() => {
    const savedPaymentConfig = localStorage.getItem("paymentConfig");
    if (savedPaymentConfig) {
      const config = JSON.parse(savedPaymentConfig);
      setQRCodeImage(config.qrCode);
    }
  }, []);

  // Function to load customer data for auto-complete
  const loadCustomerData = async () => {
    try {
      const customerMap = new Map();
      
      // 1. Fetch customers from the customers API
      try {
        const customersResponse = await fetchCustomers();
        const customers = Array.isArray(customersResponse?.data) ? customersResponse.data : [];
        
        customers.forEach(customer => {
          if (customer.name && customer.phoneNumber) {
            const key = `${customer.name.toLowerCase()}_${customer.phoneNumber}`;
            if (!customerMap.has(key)) {
              customerMap.set(key, {
                name: customer.name,
                phoneNumber: customer.phoneNumber
              });
            }
          }
        });
      } catch (customerError) {
        console.error("Error loading customers from API:", customerError);
        // Continue to load from orders even if API fails
      }
      
      // 2. Also fetch from recent orders to include customers who haven't been added to the customers table
      try {
        const response = await fetchDashboardData("last_30_days", null, null, null);
        const orders = response.data?.recentOrders || [];
        
        orders.forEach(order => {
          if (order.customerName && order.phoneNumber) {
            const key = `${order.customerName.toLowerCase()}_${order.phoneNumber}`;
            if (!customerMap.has(key)) {
              customerMap.set(key, {
                name: order.customerName,
                phoneNumber: order.phoneNumber
              });
            }
          }
        });
      } catch (orderError) {
        console.error("Error loading customer data from orders:", orderError);
      }
      
      setCustomerSuggestions(Array.from(customerMap.values()));
    } catch (error) {
      console.error("Error loading customer data:", error);
    }
  };

  // Fetch customers from API and orders for auto-complete
  useEffect(() => {
    loadCustomerData();
    
    // Listen for customer updates to refresh suggestions
    const handleCustomerUpdate = () => {
      loadCustomerData();
    };
    
    window.addEventListener('customerAdded', handleCustomerUpdate);
    window.addEventListener('customerUpdated', handleCustomerUpdate);
    window.addEventListener('customerDeleted', handleCustomerUpdate);
    
    return () => {
      window.removeEventListener('customerAdded', handleCustomerUpdate);
      window.removeEventListener('customerUpdated', handleCustomerUpdate);
      window.removeEventListener('customerDeleted', handleCustomerUpdate);
    };
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

  // Function to add item to row - now accepts both itemId (string/number) or item object
  const addItemToRow = (itemIdentifier, rowIndex = null) => {
    // Check if itemsData is loaded
    if (!itemsData || itemsData.length === 0) {
      toast.error("Items not loaded yet. Please wait...");
      return;
    }
    
    let item;
    
    // If itemIdentifier is an object (from autocomplete selection), use it directly
    if (typeof itemIdentifier === 'object' && itemIdentifier !== null) {
      item = itemIdentifier;
    } else {
      // Otherwise, treat it as itemId or name and search for it
      const searchTerm = String(itemIdentifier).trim();
      
      // Try to find by itemId first (if it's numeric)
      if (/^\d+$/.test(searchTerm)) {
        item = itemsData.find(i => String(i.itemId) === searchTerm);
      }
      
      // If not found by ID, try to find by name (exact match first, then partial)
      if (!item) {
        item = itemsData.find(i => 
          i.name.toLowerCase() === searchTerm.toLowerCase()
        );
      }
      
      // If still not found, try partial name match
      if (!item) {
        const matchingItems = itemsData.filter(i => 
          i.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (matchingItems.length === 1) {
          item = matchingItems[0];
        }
      }
    }
    
    if (!item) {
      toast.error(`Item "${itemIdentifier}" not found`);
      console.log("Item not found:", itemIdentifier);
      console.log("Available items:", itemsData.map(i => ({ id: i.itemId, name: i.name })));
      return;
    }
    
    // Convert price to number (handle BigDecimal from backend)
    const itemPrice = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
    
    console.log("Found item:", item);
    toast.success(`Added ${item.name} to cart`);

    // Add to cart with proper price conversion
    addToCart({
      name: item.name,
      price: itemPrice,
      quantity: 1,
      itemId: item.itemId,
    });
    
    // Clear editing state
    setEditingRowIndex(null);
    setEditingInputValue("");
    setShowItemSuggestions(false);
    setActiveItemSuggestionsRow(null);
  };

  // Handle item input in particulars column - now supports both ID and name
  const handleParticularsInput = (rowIndex, value) => {
    setEditingInputValue(value);
    setActiveItemSuggestionsRow(rowIndex);
    
    if (value.length > 0) {
      // Filter items for autocomplete suggestions
      const searchTerm = value.toLowerCase().trim();
      const filtered = itemsData.filter(item => {
        const itemIdMatch = String(item.itemId).toLowerCase().includes(searchTerm);
        const nameMatch = item.name.toLowerCase().includes(searchTerm);
        return itemIdMatch || nameMatch;
      }).slice(0, 10); // Limit to 10 suggestions
      
      setItemSuggestions(filtered);
      setShowItemSuggestions(filtered.length > 0);
      
      // Set timeout to process after user stops typing (only for numeric IDs)
      if (bufferTimeoutRef.current) {
        clearTimeout(bufferTimeoutRef.current);
      }
      
      // Only auto-add if it's a pure numeric ID (existing behavior)
      if (/^\d+$/.test(value.trim())) {
        bufferTimeoutRef.current = setTimeout(() => {
          const itemId = value.trim();
          if (itemId.length > 0) {
            console.log("Searching for item with ID:", itemId);
            addItemToRow(itemId, rowIndex);
          }
        }, 300);
      }
    } else {
      // Clear timeout and suggestions if input is empty
      if (bufferTimeoutRef.current) {
        clearTimeout(bufferTimeoutRef.current);
      }
      setItemSuggestions([]);
      setShowItemSuggestions(false);
    }
  };

  // Handle Enter key press in particulars input
  const handleParticularsKeyPress = (rowIndex, e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Clear any pending timeout
      if (bufferTimeoutRef.current) {
        clearTimeout(bufferTimeoutRef.current);
      }
      // Immediately process the input (ID or name)
      const searchTerm = e.target.value.trim();
      if (searchTerm.length > 0) {
        addItemToRow(searchTerm, rowIndex);
      }
    }
  };
  
  // Handle item suggestion click
  const handleItemSuggestionClick = (item, rowIndex) => {
    addItemToRow(item, rowIndex);
  };

  // Keyboard listener for auto-fill items by itemId (when not in input)
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Only process if not typing in an input field
      const target = e.target;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Check if it's a number key
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        
        // Add to buffer
        inputBufferRef.current += e.key;
        
        // Clear existing timeout
        if (bufferTimeoutRef.current) {
          clearTimeout(bufferTimeoutRef.current);
        }
        
        // Set timeout to process after 500ms of no input
        bufferTimeoutRef.current = setTimeout(() => {
          const itemId = inputBufferRef.current.trim();
          if (itemId.length > 0) {
            console.log("Keyboard input - searching for item with ID:", itemId);
            addItemToRow(itemId);
          }
          // Clear buffer
          inputBufferRef.current = "";
        }, 500);
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      if (bufferTimeoutRef.current) {
        clearTimeout(bufferTimeoutRef.current);
      }
    };
  }, [itemsData, tableRows]);

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleCloseReceipt = () => {
    setShowReceipt(false);
    setReceiptOrderDetails(null);
  };

  const getItemPrice = (item) => {
    const unitPrice = item.customPrice !== null && item.customPrice !== undefined ? item.customPrice : item.price;
    return unitPrice * item.quantity;
  };

  // Remove row
  const removeRow = (itemId) => {
    removeFromCart(itemId);
  };

  // Update row quantity
  const updateRowQuantity = (itemId, newQuantity) => {
    if (newQuantity >= 1) {
      updateQuantity(itemId, newQuantity);
    }
  };

  // Update row price
  const updateRowPrice = (itemId, newPrice) => {
    updateCustomPrice(itemId, newPrice);
  };

  return (
    <div className="explore-container-new">
      {/* First Container Row - Customer Information */}
      <div className="explore-row explore-row-top">
        <div className="customer-info-grid">
          <div className="customer-field">
            <label className="customer-label">Select user:</label>
            <select
              name="username"
              id="username"
              className="form-control form-control-sm"
              onChange={(e) => setUsername(e.target.value)}
              value={username || ""}
              required
            >
              <option value="">--SELECT USER--</option>
              {Array.isArray(users) &&
                users.map((user, index) => (
                  <option key={index} value={user.name}>
                    {user.name}
                  </option>
                ))}
            </select>
          </div>
          
          <div className="customer-field">
            <label className="customer-label">Customer name:</label>
            <div className="position-relative">
              <input
                ref={customerNameInputRef}
                type="text"
                className="form-control form-control-sm"
                value={customerName}
                onChange={(e) => {
                  const value = e.target.value;
                  setCustomerName(value);
                  setShowSuggestions(value.length > 0);
                  
                  // Auto-fill phone number if exact match found
                  const matchedCustomer = customerSuggestions.find(
                    c => c.name.toLowerCase() === value.toLowerCase()
                  );
                  if (matchedCustomer) {
                    setMobileNumber(matchedCustomer.phoneNumber);
                    setShowSuggestions(false);
                  }
                }}
                onBlur={(e) => {
                  // Don't close if clicking inside suggestions
                  if (!e.relatedTarget || !e.relatedTarget.closest('.customer-suggestions')) {
                    setTimeout(() => setShowSuggestions(false), 200);
                  }
                }}
                onFocus={() => customerName && setShowSuggestions(true)}
                required
                autoComplete="off"
              />
              {showSuggestions && customerSuggestions.filter(customer =>
                customer.name.toLowerCase().includes((customerName || '').toLowerCase())
              ).length > 0 && (
                <div className="customer-suggestions">
                  {customerSuggestions
                    .filter(customer =>
                      customer.name.toLowerCase().includes((customerName || '').toLowerCase())
                    )
                    .map((customer, index) => (
                      <div
                        key={`${customer.name}_${customer.phoneNumber}_${index}`}
                        className="suggestion-item"
                        onMouseDown={(e) => {
                          e.preventDefault(); // Prevent input blur
                          e.stopPropagation();
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setCustomerName(customer.name);
                          setMobileNumber(customer.phoneNumber);
                          setShowSuggestions(false);
                          // Focus back on input after selection
                          if (customerNameInputRef.current) {
                            customerNameInputRef.current.focus();
                          }
                        }}
                      >
                        <div className="suggestion-name">{customer.name}</div>
                        <div className="suggestion-phone">{customer.phoneNumber}</div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          <div className="customer-field">
            <label className="customer-label">Mobile number:</label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={mobileNumber}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d{0,10}$/.test(value)) {
                  setMobileNumber(value);
                }
              }}
              maxLength={10}
              required
            />
          </div>

          <div className="customer-field">
            <label className="customer-label">GSTIN:</label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={customerGstin}
              onChange={(e) => {
                const value = e.target.value.toUpperCase();
                if (/^[A-Z0-9]{0,15}$/.test(value)) {
                  setCustomerGstin(value);
                }
              }}
              maxLength={15}
              placeholder="Optional"
            />
          </div>

          <div className="customer-field">
            <label className="customer-label">Bill number:</label>
            <input
              type="text"
              className="form-control form-control-sm"
              value={billNumber}
              onChange={(e) => setBillNumber(e.target.value)}
              placeholder="Auto-generated"
              readOnly
          />
        </div>
        </div>
      </div>

      {/* Second Container Row - Table and Payment Summary */}
      <div className="explore-row explore-row-middle">
        <div className="table-summary-container">
          {/* Left Side - Table */}
          <div className="table-container">
            <table className="cart-items-table">
              <thead>
                <tr>
                  <th>Particulars</th>
                  <th>Qty</th>
                  <th>Individual Price</th>
                  <th>Total Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, index) => (
                  <tr key={index}>
                    <td className="particular-name">
                      {row ? (
                        <span>{row.name}</span>
                      ) : (
                        <div className="position-relative" style={{ width: "100%" }}>
                          <input
                            type="text"
                            className="form-control form-control-sm particular-input"
                            placeholder="Enter Item ID or Name"
                            onFocus={() => {
                              setEditingRowIndex(index);
                              if (editingInputValue.length > 0) {
                                setActiveItemSuggestionsRow(index);
                                setShowItemSuggestions(true);
                              }
                            }}
                            onBlur={() => {
                              setTimeout(() => {
                                setEditingRowIndex(null);
                                setEditingInputValue("");
                                setShowItemSuggestions(false);
                                setActiveItemSuggestionsRow(null);
                              }, 200);
                            }}
                            onChange={(e) => handleParticularsInput(index, e.target.value)}
                            onKeyPress={(e) => handleParticularsKeyPress(index, e)}
                            value={editingRowIndex === index ? editingInputValue : ""}
                            autoComplete="off"
                          />
                          {showItemSuggestions && activeItemSuggestionsRow === index && itemSuggestions.length > 0 && (
                            <div className="customer-suggestions" style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 1000 }}>
                              {itemSuggestions.map((item, idx) => (
                                <div
                                  key={`${item.itemId}_${idx}`}
                                  className="suggestion-item"
                                  onMouseDown={(e) => {
                                    e.preventDefault(); // Prevent input blur
                                    e.stopPropagation();
                                  }}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleItemSuggestionClick(item, index);
                                  }}
                                >
                                  <div className="suggestion-name">{item.name}</div>
                                  <div className="suggestion-phone">ID: {item.itemId} | ₹{item.price}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td>
                      {row ? (
                        <div className="quantity-controls">
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => updateRowQuantity(row.itemId, row.quantity - 1)}
                            disabled={row.quantity === 1}
                          >
                            <i className="bi bi-dash"></i>
                          </button>
                          <span className="quantity-value">{row.quantity}</span>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => updateRowQuantity(row.itemId, row.quantity + 1)}
                          >
                            <i className="bi bi-plus"></i>
                          </button>
                        </div>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>
                      {row ? (
                        <input
                          type="number"
                          className="form-control form-control-sm price-input"
                          placeholder={row.price.toFixed(2)}
                          value={row.customPrice !== null && row.customPrice !== undefined ? row.customPrice : ""}
                          onChange={(e) => updateRowPrice(row.itemId, e.target.value)}
                          onBlur={(e) => {
                            if (e.target.value === "") {
                              updateRowPrice(row.itemId, row.price);
                            }
                          }}
                          min="0"
                          step="0.01"
                        />
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td className="total-price">
                      {row ? (
                        `₹${getItemPrice(row).toFixed(2)}`
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>
                      {row ? (
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => removeRow(row.itemId)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                  </tr>
                ))}
                {cartItems.length >= 5 && (
                  <tr>
                    <td colSpan="5" className="add-row-cell">
                      <div className="add-row-message">
                        <i className="bi bi-info-circle"></i> All rows filled. Press item ID to add more products.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
        </div>

          {/* Right Side - Payment Summary */}
          <div className="summary-container">
            <PaymentSummary 
              cartItems={cartItems} 
              taxPercent={taxPercent} 
              setTaxPercent={setTaxPercent}
              enableCredit={enableCredit}
              paidAmount={paidAmount}
              displayGrandTotal={displayGrandTotal}
              gstType={gstType}
              setGstType={setGstType}
            />
          </div>
        </div>
      </div>

      {/* Third Container Row - Payment Controls */}
      <div className="explore-row explore-row-bottom">
          <CartSummary
            customerName={customerName}
            mobileNumber={mobileNumber}
            customerGstin={customerGstin}
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
            hideSummary={true}
            enableCredit={enableCredit}
            setEnableCredit={setEnableCredit}
            paidAmount={paidAmount}
            setPaidAmount={setPaidAmount}
          />
      </div>

      {/* QR Modal */}
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
                <span>Ask customer to scan QR code</span>
              </p>
              <div className="qr-action-buttons">
                <button
                  className="btn-qr-proceed"
                  onClick={() => {
                    setShowQRModal(false);
                    const event = new CustomEvent("qrProceedClicked");
                    window.dispatchEvent(event);
                  }}
                  style={{
                    background: "linear-gradient(135deg, #002142 0%, #003a5c 100%)",
                    color: "#ffffff",
                    border: "none",
                    padding: "12px 24px",
                    borderRadius: "8px",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    width: "100%",
                    justifyContent: "center",
                    fontSize: "16px",
                    boxShadow: "0 4px 12px rgba(0, 33, 66, 0.25)",
                    transition: "all 0.3s ease"
                  }}
                >
                  <i className="bi bi-check-circle"></i>
                  <span>Proceed</span>
                </button>
                <button
                  className="btn-qr-cancel"
                  onClick={() => setShowQRModal(false)}
                  style={{
                    background: "transparent",
                    color: "#666",
                    border: "1px solid #ddd",
                    padding: "12px 24px",
                    borderRadius: "8px",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    width: "100%",
                    justifyContent: "center",
                    fontSize: "16px",
                    marginTop: "8px"
                  }}
                >
                  <i className="bi bi-x-circle"></i>
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Popup */}
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
