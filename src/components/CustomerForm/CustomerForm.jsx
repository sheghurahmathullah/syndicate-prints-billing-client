import { useContext, useState, useEffect } from 'react';
import './CustomerForm.css';
import { AppContext } from "../../context/AppContext.jsx";
import { fetchDashboardData } from "../../Service/Dashboard.js";
import { addCustomer, updateCustomer, fetchCustomers } from "../../Service/CustomerService.js";
import toast from "react-hot-toast";

// This component handles two use cases:
// 1. Explore page: customerName, mobileNumber, username props (with auto-complete)
// 2. ManageCustomers page: setCustomers, selectedCustomer, onUpdateCustomer props
const CustomerForm = ({
    // Explore page props
    customerName, 
    mobileNumber, 
    customerGstin,
    username, 
    setUsername, 
    setMobileNumber, 
    setCustomerName,
    setCustomerGstin,
    taxPercent, 
    setTaxPercent,
    // ManageCustomers page props
    setCustomers,
    selectedCustomer,
    onUpdateCustomer,
    onCustomerAdded
}) => {
    const appCtx = useContext(AppContext);
    let users;
    
    // Check if this is ManageCustomers mode
    const isManageMode = setCustomers !== undefined;
    
    // Support several possible shapes of the context:
    if (Array.isArray(appCtx) && appCtx.length > 0) {
      users = appCtx[0];
    } else if (appCtx && typeof appCtx === 'object' && 'users' in appCtx) {
      users = appCtx.users;
    } else {
      users = appCtx;
    }

    // State for customer suggestions from orders (Explore mode only)
    const [customerSuggestions, setCustomerSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // State for ManageCustomers mode
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({
        name: "",
        phoneNumber: "",
        email: "",
        companyName: "",
        taxNumber: "",
        isActive: true
    });

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

    // Fetch customers from API and orders for auto-complete (Explore mode only)
    useEffect(() => {
        if (!isManageMode) {
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
        }
    }, [isManageMode]);

    // Handle customer name input with auto-complete (Explore mode)
    const handleCustomerNameChange = (e) => {
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
    };

    // Handle suggestion click (Explore mode)
    const handleSuggestionClick = (customer, e) => {
        e.preventDefault();
        e.stopPropagation();
        setCustomerName(customer.name);
        setMobileNumber(customer.phoneNumber);
        setShowSuggestions(false);
    };

    // Filter suggestions based on input (Explore mode)
    const filteredSuggestions = customerSuggestions.filter(customer =>
        customer.name.toLowerCase().includes((customerName || '').toLowerCase())
    );

    // ManageCustomers mode handlers
    const onChangeHandler = (e) => {
        const value = e.target.value;
        const name = e.target.name;
        setData((data) => ({ ...data, [name]: value }));
    };

    // when selectedCustomer changes, populate or clear the form (ManageCustomers mode)
    useEffect(() => {
        if (isManageMode) {
            if (selectedCustomer && (selectedCustomer.customerId || selectedCustomer.id)) {
                // Support both customerId (from backend) and id (fallback)
                const customerId = selectedCustomer.customerId || selectedCustomer.id;
                setData({
                    name: selectedCustomer.name || '',
                    phoneNumber: selectedCustomer.phoneNumber || '',
                    email: selectedCustomer.email || '',
                    companyName: selectedCustomer.companyName || '',
                    taxNumber: selectedCustomer.taxNumber || '',
                    isActive: selectedCustomer.isActive !== undefined ? selectedCustomer.isActive : true,
                    customerId: customerId
                });
            } else if (!selectedCustomer) {
                setData({ name: '', phoneNumber: '', email: '', companyName: '', taxNumber: '', isActive: true });
            }
        }
    }, [selectedCustomer, isManageMode]);

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (data.customerId) { // update existing customer
                const response = await updateCustomer(data.customerId, data);
                const updatedCustomer = (response && response.data && response.data.customerId) ? response.data : { ...data, customerId: data.customerId };
                onUpdateCustomer && onUpdateCustomer(updatedCustomer);
                toast.success("Customer updated successfully");
                // Dispatch event to refresh customer suggestions in Explore page
                window.dispatchEvent(new CustomEvent('customerUpdated', { detail: updatedCustomer }));
                // Clear form after update
                setData({
                    name: "",
                    phoneNumber: "",
                    email: "",
                    companyName: "",
                    taxNumber: "",
                    isActive: true
                });
            } else { // create new customer
                const response = await addCustomer(data);
                if (response && response.data) {
                    setCustomers((prevCustomers) => [...prevCustomers, response.data]);
                    toast.success("Customer added successfully");
                    // Dispatch event to refresh customer suggestions in Explore page
                    window.dispatchEvent(new CustomEvent('customerAdded', { detail: response.data }));
                    if (onCustomerAdded) {
                        onCustomerAdded(response.data);
                    }
                }
                // Clear form after create
                setData({
                    name: "",
                    phoneNumber: "",
                    email: "",
                    companyName: "",
                    taxNumber: "",
                    isActive: true
                });
            }
        } catch (e) {
            console.error(e);
            const errorMessage = e.response?.data?.message || e.message || "An error occurred";
            toast.error(data.customerId ? `Error updating customer: ${errorMessage}` : `Error adding customer: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    }

    // Render ManageCustomers mode
    if (isManageMode) {
        return (
            <div className="mt-2">
                <form onSubmit={onSubmitHandler}>
                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label htmlFor="name" className="form-label fw-bold text-dark">Name <span className="text-danger">*</span></label>
                            <div className="input-group">
                                <span className="input-group-text bg-light"><i className="bi bi-person"></i></span>
                                <input type="text"
                                       name="name"
                                       id="name"
                                       className="form-control"
                                       placeholder="John Doe"
                                       onChange={onChangeHandler}
                                       value={data.name}
                                       required
                                />
                            </div>
                        </div>
                        <div className="col-md-6 mb-3">
                            <label htmlFor="phoneNumber" className="form-label fw-bold text-dark">Phone Number <span className="text-danger">*</span></label>
                            <div className="input-group">
                                <span className="input-group-text bg-light"><i className="bi bi-telephone"></i></span>
                                <input type="text"
                                       name="phoneNumber"
                                       id="phoneNumber"
                                       className="form-control"
                                       placeholder="1234567890"
                                       onChange={(e) => {
                                           const value = e.target.value;
                                           if (/^\d{0,10}$/.test(value)) {
                                               onChangeHandler(e);
                                           }
                                       }}
                                       value={data.phoneNumber}
                                       maxLength={10}
                                       required
                                />
                            </div>
                        </div>
                        <div className="col-md-6 mb-3">
                            <label htmlFor="email" className="form-label fw-bold text-dark">Email</label>
                            <div className="input-group">
                                <span className="input-group-text bg-light"><i className="bi bi-envelope"></i></span>
                                <input type="email"
                                       name="email"
                                       id="email"
                                       className="form-control"
                                       placeholder="yourname@example.com"
                                       onChange={onChangeHandler}
                                       value={data.email}
                                />
                            </div>
                        </div>
                        <div className="col-md-6 mb-3">
                            <label htmlFor="companyName" className="form-label fw-bold text-dark">Company Name</label>
                            <div className="input-group">
                                <span className="input-group-text bg-light"><i className="bi bi-building"></i></span>
                                <input type="text"
                                       name="companyName"
                                       id="companyName"
                                       className="form-control"
                                       placeholder="Company LLC"
                                       onChange={onChangeHandler}
                                       value={data.companyName}
                                />
                            </div>
                        </div>
                        <div className="col-md-6 mb-3">
                            <label htmlFor="taxNumber" className="form-label fw-bold text-dark">Tax Number (GSTIN)</label>
                            <div className="input-group">
                                <span className="input-group-text bg-light"><i className="bi bi-receipt"></i></span>
                                <input type="text"
                                       name="taxNumber"
                                       id="taxNumber"
                                       className="form-control"
                                       placeholder="TAX-12345"
                                       onChange={onChangeHandler}
                                       value={data.taxNumber}
                                />
                            </div>
                        </div>
                        <div className="col-md-6 mb-3 d-flex align-items-end">
                            <div className="form-check form-switch mb-2">
                                <input type="checkbox"
                                       name="isActive"
                                       id="isActive"
                                       className="form-check-input"
                                       onChange={(e) => setData({ ...data, isActive: e.target.checked })}
                                       checked={data.isActive}
                                />
                                <label htmlFor="isActive" className="form-check-label fw-bold text-dark ms-1">Is Active</label>
                            </div>
                        </div>
                    </div>
                    
                    <div className="d-flex justify-content-end mt-3 border-top pt-3">
                        <button type="submit" className="btn btn-primary px-4" disabled={loading}>
                            {loading ? (
                                <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Saving...</>
                            ) : (
                                <><i className="bi bi-check-circle me-1"></i> {data.customerId ? 'Update Customer' : 'Save Customer'}</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    // Render Explore mode with auto-complete
    return (
        <div className="p-2">
            {/* select existing user */}
            <div className="mb-2">
                <div className="d-flex align-items-center gap-2">
                    <label htmlFor="selectUser" className="text-dark col-4">
                        Select user:{" "}
                    </label>
                    <select
                        name="username"
                        id="username"
                        className="form-control"
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
            </div>

            <div className="mb-2">
                <div className="d-flex align-items-center gap-2 position-relative">
                    <label htmlFor="customerName" className="text-dark col-4">Customer name: </label>
                    <div className="flex-grow-1 position-relative">
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            id="customerName"
                            onChange={handleCustomerNameChange}
                            value={customerName}
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
                        {showSuggestions && filteredSuggestions.length > 0 && (
                            <div 
                                className="customer-suggestions"
                                onMouseDown={(e) => e.preventDefault()}
                            >
                                {filteredSuggestions.slice(0, 5).map((customer, index) => (
                                    <div
                                        key={index}
                                        className="suggestion-item"
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            handleSuggestionClick(customer, e);
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
            </div>
            <div className="mb-2">
                <div className="d-flex align-items-center gap-2">
                    <label htmlFor="mobileNumber" className="text-dark col-4">Mobile number: </label>
                    <input
                        type="text"
                        className="form-control form-control-sm"
                        id="mobileNumber"
                        onChange={(e) => {
                            const value = e.target.value;
                            if (/^\d{0,10}$/.test(value)) {
                                setMobileNumber(value);
                            }
                        }}
                        value={mobileNumber}
                        required
                        pattern="\d{10}"
                        maxLength={10}
                        title="Please enter a valid 10-digit phone number"
                    />
                </div>
            </div>
            <div className="mb-2">
                <div className="d-flex align-items-center gap-2">
                    <label htmlFor="customerGstin" className="text-dark col-4">GSTIN: </label>
                    <input
                        type="text"
                        className="form-control form-control-sm"
                        id="customerGstin"
                        onChange={(e) => {
                            const value = e.target.value.toUpperCase();
                            // GSTIN format: 15 alphanumeric characters
                            if (/^[A-Z0-9]{0,15}$/.test(value)) {
                                setCustomerGstin(value);
                            }
                        }}
                        value={customerGstin}
                        maxLength={15}
                        placeholder="Optional"
                        title="15-character GSTIN number (optional)"
                    />
                </div>
            </div>
        </div>
    )
}

export default CustomerForm;
