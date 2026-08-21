import { useContext, useState, useEffect } from 'react';
import './CustomerForm.css';
import { AppContext } from "../../context/AppContext.jsx";
import { fetchDashboardData } from "../../Service/Dashboard.js";
import { addCustomer, updateCustomer, fetchCustomers } from "../../Service/CustomerService.js";
import toast from "react-hot-toast";

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
    onCustomerAdded,
    onSuccess,
    onCancel
}) => {
    const appCtx = useContext(AppContext);
    let users;
    
    // Check if this is ManageCustomers mode
    const isManageMode = setCustomers !== undefined;
    
    if (Array.isArray(appCtx) && appCtx.length > 0) {
      users = appCtx[0];
    } else if (appCtx && typeof appCtx === 'object' && 'users' in appCtx) {
      users = appCtx.users;
    } else {
      users = appCtx;
    }

    const [customerSuggestions, setCustomerSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({
        name: "",
        phoneNumber: "",
        email: "",
        companyName: "",
        taxNumber: "",
        isActive: true
    });

    const loadCustomerData = async () => {
        try {
            const customerMap = new Map();
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
            }
            
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

    useEffect(() => {
        if (!isManageMode) {
            loadCustomerData();
            
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

    const handleCustomerNameChange = (e) => {
        const value = e.target.value;
        setCustomerName(value);
        setShowSuggestions(value.length > 0);
        
        const matchedCustomer = customerSuggestions.find(
            c => c.name.toLowerCase() === value.toLowerCase()
        );
        if (matchedCustomer) {
            setMobileNumber(matchedCustomer.phoneNumber);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (customer, e) => {
        e.preventDefault();
        e.stopPropagation();
        setCustomerName(customer.name);
        setMobileNumber(customer.phoneNumber);
        setShowSuggestions(false);
    };

    const filteredSuggestions = customerSuggestions.filter(customer =>
        customer.name.toLowerCase().includes((customerName || '').toLowerCase())
    );

    const onChangeHandler = (e) => {
        const value = e.target.value;
        const name = e.target.name;
        setData((prev) => ({ ...prev, [name]: value }));
    };

    useEffect(() => {
        if (isManageMode) {
            if (selectedCustomer && (selectedCustomer.customerId || selectedCustomer.id)) {
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
            if (data.customerId) {
                const response = await updateCustomer(data.customerId, data);
                const updatedCustomer = (response && response.data && response.data.customerId) ? response.data : { ...data, customerId: data.customerId };
                onUpdateCustomer && onUpdateCustomer(updatedCustomer);
                toast.success("Customer updated successfully");
                window.dispatchEvent(new CustomEvent('customerUpdated', { detail: updatedCustomer }));
            } else {
                const response = await addCustomer(data);
                if (response && response.data) {
                    setCustomers((prevCustomers) => [...prevCustomers, response.data]);
                    toast.success("Customer added successfully");
                    window.dispatchEvent(new CustomEvent('customerAdded', { detail: response.data }));
                    if (onCustomerAdded) {
                        onCustomerAdded(response.data);
                    }
                }
            }
            setData({
                name: "",
                phoneNumber: "",
                email: "",
                companyName: "",
                taxNumber: "",
                isActive: true
            });
            if (onSuccess) {
                onSuccess();
            }
        } catch (e) {
            console.error(e);
            const errorMessage = e.response?.data?.message || e.message || "An error occurred";
            toast.error(data.customerId ? `Error updating customer: ${errorMessage}` : `Error adding customer: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    if (isManageMode) {
        return (
            <div className="user-form-wrapper fade-in">
                <div className="user-form-card">
                    <form onSubmit={onSubmitHandler} className="user-form-content">
                        <div className="form-section-header mb-4">
                            <div className="form-header-badge">
                                <i className="bi bi-person-badge-fill"></i>
                            </div>
                            <div>
                                <h5 className="form-section-title mb-0">
                                    {data.customerId ? "Update Customer Profile" : "Customer Contact Details"}
                                </h5>
                                <p className="form-section-subtitle mb-0">
                                    Fill in customer name, mobile contact, GSTIN, and business details
                                </p>
                            </div>
                        </div>

                        <div className="row g-3 mb-4">
                            {/* Customer Name */}
                            <div className="col-md-6">
                                <div className="rich-form-group">
                                    <label htmlFor="name" className="rich-form-label">
                                        CUSTOMER NAME <span className="text-danger">*</span>
                                    </label>
                                    <div className="rich-input-group">
                                        <span className="rich-input-icon">
                                            <i className="bi bi-person-fill"></i>
                                        </span>
                                        <input
                                            type="text"
                                            name="name"
                                            id="name"
                                            className="rich-form-control"
                                            placeholder="e.g. John Doe"
                                            onChange={onChangeHandler}
                                            value={data.name}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Phone Number */}
                            <div className="col-md-6">
                                <div className="rich-form-group">
                                    <label htmlFor="phoneNumber" className="rich-form-label">
                                        PHONE NUMBER <span className="text-danger">*</span>
                                    </label>
                                    <div className="rich-input-group">
                                        <span className="rich-input-icon">
                                            <i className="bi bi-telephone-fill"></i>
                                        </span>
                                        <input
                                            type="text"
                                            name="phoneNumber"
                                            id="phoneNumber"
                                            className="rich-form-control"
                                            placeholder="10-digit mobile number"
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
                            </div>

                            {/* Email Address */}
                            <div className="col-md-6">
                                <div className="rich-form-group">
                                    <label htmlFor="email" className="rich-form-label">
                                        EMAIL ADDRESS
                                    </label>
                                    <div className="rich-input-group">
                                        <span className="rich-input-icon">
                                            <i className="bi bi-envelope-fill"></i>
                                        </span>
                                        <input
                                            type="email"
                                            name="email"
                                            id="email"
                                            className="rich-form-control"
                                            placeholder="e.g. customer@example.com"
                                            onChange={onChangeHandler}
                                            value={data.email}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Company Name */}
                            <div className="col-md-6">
                                <div className="rich-form-group">
                                    <label htmlFor="companyName" className="rich-form-label">
                                        COMPANY NAME
                                    </label>
                                    <div className="rich-input-group">
                                        <span className="rich-input-icon">
                                            <i className="bi bi-building"></i>
                                        </span>
                                        <input
                                            type="text"
                                            name="companyName"
                                            id="companyName"
                                            className="rich-form-control"
                                            placeholder="e.g. Syndicate Prints Pvt Ltd"
                                            onChange={onChangeHandler}
                                            value={data.companyName}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Tax Number (GSTIN) */}
                            <div className="col-md-6">
                                <div className="rich-form-group">
                                    <label htmlFor="taxNumber" className="rich-form-label">
                                        TAX NUMBER / GSTIN
                                    </label>
                                    <div className="rich-input-group">
                                        <span className="rich-input-icon">
                                            <i className="bi bi-receipt"></i>
                                        </span>
                                        <input
                                            type="text"
                                            name="taxNumber"
                                            id="taxNumber"
                                            className="rich-form-control"
                                            placeholder="e.g. 22AAAAA0000A1Z5"
                                            onChange={onChangeHandler}
                                            value={data.taxNumber}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Status Switch */}
                            <div className="col-md-6 d-flex align-items-center">
                                <div className="status-switch-card w-100">
                                    <div className="form-check form-switch m-0 d-flex align-items-center justify-content-between">
                                        <div>
                                            <label htmlFor="isActive" className="form-check-label fw-bold text-dark me-2">
                                                Account Status:
                                            </label>
                                            <span className={`badge ${data.isActive ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-danger-subtle text-danger border border-danger-subtle'} ms-1`}>
                                                {data.isActive ? "Active Customer" : "Inactive Customer"}
                                            </span>
                                        </div>
                                        <input
                                            type="checkbox"
                                            name="isActive"
                                            id="isActive"
                                            className="form-check-input role-switch-check ms-3"
                                            onChange={(e) => setData({ ...data, isActive: e.target.checked })}
                                            checked={data.isActive}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Form Action Footer */}
                        <div className="form-action-footer">
                            <button
                                type="button"
                                className="btn-form-cancel"
                                onClick={onCancel || onSuccess}
                            >
                                <i className="bi bi-x-lg me-1.5"></i> Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn-form-submit"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-check2-circle me-1.5"></i>{" "}
                                        {data.customerId ? "Update Customer" : "Save Customer"}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="p-2">
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
    );
};

export default CustomerForm;
