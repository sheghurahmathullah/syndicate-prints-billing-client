import { useContext, useState, useEffect } from 'react';
import './CustomerForm.css';
import { AppContext } from "../../context/AppContext.jsx";
import { fetchDashboardData } from "../../Service/Dashboard.js";
import { addCustomer, updateCustomer } from "../../Service/CustomerService.js";
import toast from "react-hot-toast";

// This component handles two use cases:
// 1. Explore page: customerName, mobileNumber, username props (with auto-complete)
// 2. ManageCustomers page: setCustomers, selectedCustomer, onUpdateCustomer props
const CustomerForm = ({
    // Explore page props
    customerName, 
    mobileNumber, 
    username, 
    setUsername, 
    setMobileNumber, 
    setCustomerName, 
    taxPercent, 
    setTaxPercent,
    // ManageCustomers page props
    setCustomers,
    selectedCustomer,
    onUpdateCustomer
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
        email: ""
    });

    // Fetch orders to get customer data for auto-complete (Explore mode only)
    useEffect(() => {
        if (!isManageMode) {
            const loadCustomerData = async () => {
                try {
                    const response = await fetchDashboardData("last_30_days", null, null, null);
                    const orders = response.data?.recentOrders || [];
                    
                    // Create unique customer list from orders
                    const customerMap = new Map();
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
                    
                    setCustomerSuggestions(Array.from(customerMap.values()));
                } catch (error) {
                    console.error("Error loading customer data:", error);
                }
            };
            
            loadCustomerData();
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
            if (selectedCustomer && selectedCustomer.customerId) {
                setData({
                    name: selectedCustomer.name || '',
                    phoneNumber: selectedCustomer.phoneNumber || '',
                    email: selectedCustomer.email || '',
                    customerId: selectedCustomer.customerId
                });
            } else if (!selectedCustomer) {
                setData({ name: '', phoneNumber: '', email: '' });
            }
        }
    }, [selectedCustomer, isManageMode]);

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (data.customerId) { // update existing customer
                const response = await updateCustomer(data.customerId, data);
                const updatedCustomer = (response && response.data && response.data.customerId) ? response.data : { ...data };
                onUpdateCustomer && onUpdateCustomer(updatedCustomer);
                toast.success("Customer updated");
            } else { // create new customer
                const response = await addCustomer(data);
                setCustomers((prevCustomers) => [...prevCustomers, response.data]);
                toast.success("Customer Added");
            }
            setData({
                name: "",
                phoneNumber: "",
                email: ""
            })
        } catch (e) {
            console.error(e);
            toast.error("Error adding customer");
        } finally {
            setLoading(false);
        }
    }

    // Render ManageCustomers mode
    if (isManageMode) {
        return (
            <div className="mx-2 mt-2">
                <div className="row">
                    <h4 className="text-dark">Create New Customer</h4>
                    <div className="card col-md-12 form-container">
                        <div className="card-body">
                            <form onSubmit={onSubmitHandler}>
                                <div className="mb-3">
                                    <label htmlFor="name" className="form-label">Name</label>
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
                                <div className="mb-3">
                                    <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
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
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">Email</label>
                                    <input type="email"
                                           name="email"
                                           id="email"
                                           className="form-control"
                                           placeholder="yourname@example.com"
                                           onChange={onChangeHandler}
                                           value={data.email}
                                    />
                                </div>
                                <button type="submit" className="btn  btn-warning w-100" disabled={loading}>
                                    {loading ? "Loading..." : (data.customerId ? 'Update Customer' : 'Save')}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
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
        </div>
    )
}

export default CustomerForm;
