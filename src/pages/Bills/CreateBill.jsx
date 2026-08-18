import React, { useState, useEffect, useContext } from 'react';
import './CreateBill.css';
import { AppContext } from '../../context/AppContext';
import { getNextBillNumber, createBill } from '../../Service/BillService';
import { fetchCustomers } from '../../Service/CustomerService';
import { fetchEmployeeNames } from '../../Service/EmployeeService';
import { getParticularDetailsById } from '../../Service/ParticularService';
import toast from 'react-hot-toast';

const CreateBill = () => {
  const { auth } = useContext(AppContext);

  // State
  const [billNumber, setBillNumber] = useState('');

  // Employee Search State
  const [employeeNames, setEmployeeNames] = useState([]);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');

  // Customer Search State
  const [customers, setCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState({
    customerName: '',
    customerGstNo: '',
    customerMobileNo: '',
    customerEmail: ''
  });

  const getEmptyParticularRow = () => ({
    id: Date.now().toString() + Math.random().toString(), // Ensure unique ID
    particularId: '',
    particularName: '',
    type: 'Single Side',
    qty: 1,
    basePrice: 0,
    priceBack: 0,
    individualPrice: 0,
    totalPrice: 0,
    isFilled: false
  });

  const [particularsList, setParticularsList] = useState(() =>
    Array(5).fill(null).map(() => getEmptyParticularRow())
  );

  const [paymentType, setPaymentType] = useState('Cash');
  const [enableCredit, setEnableCredit] = useState(false);
  const [amountPaid, setAmountPaid] = useState('');

  const [showExtra, setShowExtra] = useState(false);
  const [priceDiscount, setPriceDiscount] = useState('');
  const [tdsAmount, setTdsAmount] = useState('');

  // Derived State (Calculations)
  const [totals, setTotals] = useState({
    totalItems: 0,
    totalBillsWithoutGst: 0,
    gstPercentage: 18,
    gstAmount: 0,
    discount: 0,
    tdsAmount: 0,
    totalPaidCredits: 0, // Not sure how this is calculated, maybe from previous? Or just user input
    totalCredits: 0, // Total - Paid?
    totalToPay: 0
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const billRes = await getNextBillNumber();
      setBillNumber(billRes.data.nextBillNumber || billRes.data);

      const custRes = await fetchCustomers();
      if (custRes.data) {
        setCustomers(custRes.data.content || custRes.data);
      }

      const empRes = await fetchEmployeeNames();
      if (empRes.data) {
        setEmployeeNames(empRes.data);
      }

      if (auth?.username) {
        setSelectedEmployee(auth.username);
        setEmployeeSearch(auth.username);
      }
    } catch (error) {
      console.error("Error fetching initial data", error);
      toast.error("Failed to load initial data");
    }
  };

  const handleEmployeeSelect = (emp) => {
    const fullName = emp.fullName || emp.name || '';
    setSelectedEmployee(fullName);
    setEmployeeSearch(fullName);
  };

  const handleEmployeeSearchChange = (e) => {
    const val = e.target.value;
    setEmployeeSearch(val);
    setSelectedEmployee(val); // Allow manual typing too
    if (val.trim()) {
      setShowEmployeeDropdown(true);
    } else {
      setShowEmployeeDropdown(false);
    }
  };

  const filteredEmployees = employeeNames.filter(emp => {
    const fullName = emp.fullName || emp.name || '';
    return fullName.toLowerCase().includes(employeeSearch.toLowerCase());
  });

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer({
      customerName: customer.name || '',
      customerGstNo: customer.taxNumber || '',
      customerMobileNo: customer.phoneNumber || '',
      customerEmail: customer.email || ''
    });
    setCustomerSearch(customer.name);
  };

  const handleCustomerSearchChange = (e) => {
    const val = e.target.value;
    setCustomerSearch(val);
    if (val.trim()) {
      setShowCustomerDropdown(true);
    } else {
      setShowCustomerDropdown(false);
    }
  };

  const filteredCustomers = customers.filter(c =>
    c.name && c.name.toLowerCase().startsWith(customerSearch.toLowerCase())
  );

  const handleParticularAdd = async (e, id) => {
    const item = particularsList.find(p => p.id === id);
    if (e.key === 'Enter' && item && item.particularId.trim()) {
      const searchId = item.particularId.trim().toLowerCase();
      const isDuplicate = particularsList.some(p => p.id !== id && p.isFilled && p.particularName && p.particularName.toLowerCase() === searchId);

      if (isDuplicate) {
        toast.error("This particular is already added to the bill.");
        return;
      }

      try {
        const res = await getParticularDetailsById(item.particularId.trim());
        const data = res.data;
        if (data) {
          setParticularsList(prevList => {
            let newList = prevList.map(p => {
              if (p.id === id) {
                return {
                  ...p,
                  particularName: data.particularName || data.name || data.particularId,
                  type: 'Single Side',
                  qty: 1,
                  basePrice: data.price || 0,
                  priceBack: data.priceBack || 0,
                  individualPrice: data.price || 0,
                  totalPrice: data.price || 0,
                  isFilled: true
                };
              }
              return p;
            });

            // Check empty rows count
            const emptyCount = newList.filter(p => !p.isFilled).length;
            if (emptyCount < 2) {
              newList.push(getEmptyParticularRow());
            }
            return newList;
          });
        }
      } catch (error) {
        toast.error("Particular not found or error fetching details");
      }
    }
  };

  const updateParticularRow = (id, field, value) => {
    setParticularsList(prevList =>
      prevList.map(item => {
        if (item.id === id) {
          let updatedItem = { ...item, [field]: value };

          if (field === 'type') {
            // Switch price based on type
            updatedItem.individualPrice = value === 'Single Side' ? updatedItem.basePrice : updatedItem.priceBack;
            updatedItem.totalPrice = updatedItem.qty * updatedItem.individualPrice;
          }

          if (field === 'qty' || field === 'individualPrice') {
            updatedItem.totalPrice = updatedItem.qty * updatedItem.individualPrice;
          }
          return updatedItem;
        }
        return item;
      })
    );
  };

  const removeParticular = (id) => {
    setParticularsList(prevList => {
      let newList = prevList.filter(item => item.id !== id);
      const emptyCount = newList.filter(p => !p.isFilled).length;
      // Ensure we always have at least 5 rows visually if possible, or at least 2 empty ones
      while (newList.length < 5 || newList.filter(p => !p.isFilled).length < 2) {
        newList.push(getEmptyParticularRow());
      }
      return newList;
    });
  };

  // Recalculate totals whenever particularsList or enableCredit/paidCreditAmount changes
  useEffect(() => {
    const filledItems = particularsList.filter(p => p.isFilled);
    const totalItems = filledItems.length;
    const totalBillsWithoutGst = filledItems.reduce((acc, curr) => acc + curr.totalPrice, 0);
    const gstAmount = (totalBillsWithoutGst * totals.gstPercentage) / 100;

    const discount = Number(priceDiscount) || 0;
    const tds = Number(tdsAmount) || 0;
    const totalToPay = totalBillsWithoutGst + gstAmount - discount;

    let totalCredits = 0;
    let paid = Number(amountPaid) || 0;
    if (enableCredit) {
      totalCredits = totalToPay - paid;
    } else {
      totalCredits = 0;
    }

    setTotals(prev => ({
      ...prev,
      totalItems,
      totalBillsWithoutGst,
      gstAmount,
      discount,
      tdsAmount: tds,
      totalToPay,
      totalPaidCredits: paid,
      totalCredits
    }));
  }, [particularsList, totals.gstPercentage, enableCredit, amountPaid, priceDiscount, tdsAmount]);

  const handleSave = async (printAfter = false) => {
    try {
      const filledItems = particularsList.filter(p => p.isFilled);
      if (filledItems.length === 0) {
        toast.error("Please add at least one particular.");
        return;
      }

      if (!selectedCustomer.customerName) {
        toast.error("Please select a customer.");
        return;
      }

      const payload = {
        employee: selectedEmployee || employeeSearch,
        customerName: selectedCustomer.customerName,
        customerEmail: selectedCustomer.customerEmail,
        customerMobileNo: selectedCustomer.customerMobileNo,
        customerGstNo: selectedCustomer.customerGstNo,
        payment: paymentType,
        totalPaid: amountPaid ? Number(Number(amountPaid).toFixed(2)) : Number(totals.totalToPay.toFixed(2)),
        total: Number(totals.totalToPay.toFixed(2)),
        creditAmount: Number(totals.totalCredits.toFixed(2)),
        totalWithGst: Number(totals.totalToPay.toFixed(2)),
        totalItems: totals.totalItems,
        discount: Number(totals.discount.toFixed(2)),
        tdsAmount: Number(totals.tdsAmount.toFixed(2)),
        creditPaidAmount: enableCredit ? Number(Number(amountPaid).toFixed(2)) : 0,
        particulars: JSON.stringify(filledItems.map(p => ({
          particularId: p.particularId,
          qty: p.qty,
          price: Number(Number(p.individualPrice).toFixed(2))
        })))
      };

      const res = await createBill(payload);
      if (res.data) {
        toast.success("Bill saved successfully!");
        // Reset form
        setCustomerSearch('');
        setSelectedCustomer({ customerName: '', customerGstNo: '', customerMobileNo: '', customerEmail: '' });
        setParticularsList(Array(5).fill(null).map(() => getEmptyParticularRow()));
        setPaymentType('Cash');
        setEnableCredit(false);
        setAmountPaid('');
        setPriceDiscount('');
        setTdsAmount('');
        setShowExtra(false);
        fetchInitialData(); // get next bill number

        if (printAfter === true) {
          setTimeout(() => {
            window.print();
          }, 300);
        }
      }
    } catch (error) {
      toast.error("Failed to save bill");
    }
  };

  return (
    <div className="create-bill-container">
      <div className="page-header">
        <h2>Create Bill</h2>
      </div>

      <div className="bill-card">
        {/* Row 1: Bill No, Employee, Customer Search */}
        <div className="bill-row row-1">
          <div className="form-group">
            <label>Bill Number</label>
            <input type="text" value={billNumber?.billNumber || billNumber || ''} disabled className="form-control disabled-input bill-number-text" />
          </div>
          <div className="form-group customer-search-wrapper">
            <label>Employee Name</label>
            <input
              type="text"
              placeholder="Search employee..."
              value={employeeSearch}
              onChange={handleEmployeeSearchChange}
              onFocus={() => { if (employeeSearch) setShowEmployeeDropdown(true) }}
              onBlur={() => setTimeout(() => setShowEmployeeDropdown(false), 200)}
              className="form-control"
            />
            {showEmployeeDropdown && (
              <ul className="customer-dropdown-list">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((emp, idx) => (
                    <li key={idx} onMouseDown={(e) => { e.preventDefault(); handleEmployeeSelect(emp); setShowEmployeeDropdown(false); }}>
                      <span className="fw-bold">{emp.fullName || emp.name}</span>
                    </li>
                  ))
                ) : (
                  <li className="no-results">No employees found</li>
                )}
              </ul>
            )}
          </div>
          <div className="form-group customer-search-wrapper">
            <label>Customer Name</label>
            <input
              type="text"
              placeholder="Search by name..."
              value={customerSearch}
              onChange={handleCustomerSearchChange}
              onFocus={() => { if (customerSearch) setShowCustomerDropdown(true) }}
              onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 200)}
              className="form-control"
            />
            {showCustomerDropdown && (
              <ul className="customer-dropdown-list">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((c, idx) => (
                    <li key={idx} onMouseDown={(e) => { e.preventDefault(); handleCustomerSelect(c); setShowCustomerDropdown(false); }}>
                      <span className="fw-bold">{c.name}</span> - {c.phoneNumber}
                    </li>
                  ))
                ) : (
                  <li className="no-results">No customers found</li>
                )}
              </ul>
            )}
          </div>
        </div>

        {/* Row 2: Customer Details */}
        <div className="bill-row row-2">
          <div className="form-group">
            <label>Customer Name</label>
            <input type="text" value={selectedCustomer.customerName} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, customerName: e.target.value })} className="form-control" />
          </div>
          <div className="form-group">
            <label>GST No</label>
            <input type="text" value={selectedCustomer.customerGstNo} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, customerGstNo: e.target.value })} className="form-control" />
          </div>
          <div className="form-group">
            <label>Mobile Number</label>
            <input type="text" value={selectedCustomer.customerMobileNo} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, customerMobileNo: e.target.value })} className="form-control" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={selectedCustomer.customerEmail} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, customerEmail: e.target.value })} className="form-control" />
          </div>
        </div>

        {/* Row 3: Particulars and Summary */}
        <div className="bill-row row-3">

          {/* Left Side: Particulars Table (60%) */}
          <div className="particulars-section">
            <div className="table-responsive">
              <table className="particulars-table">
                <thead>
                  <tr>
                    <th>PARTICULARS</th>
                    <th>TYPE</th>
                    <th>QTY</th>
                    <th>INDIVIDUAL PRICE</th>
                    <th>TOTAL PRICE</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {particularsList.map((item, index) => (
                    <tr key={item.id}>
                      <td>
                        {!item.isFilled ? (
                          <input
                            type="text"
                            placeholder="Enter Item ID & hit Enter"
                            value={item.particularId}
                            onChange={(e) => updateParticularRow(item.id, 'particularId', e.target.value)}
                            onKeyDown={(e) => handleParticularAdd(e, item.id)}
                            className="form-control particular-add-input"
                          />
                        ) : (
                          item.particularName
                        )}
                      </td>
                      <td>
                        {item.isFilled ? (
                          <select
                            value={item.type}
                            onChange={(e) => updateParticularRow(item.id, 'type', e.target.value)}
                            className="form-select type-select"
                          >
                            <option value="Single Side">Single Side</option>
                            <option value="Back to Back">Back to Back</option>
                          </select>
                        ) : '-'}
                      </td>
                      <td>
                        {item.isFilled ? (
                          <div className="qty-control">
                            <button onClick={() => updateParticularRow(item.id, 'qty', Math.max(1, item.qty - 1))}>-</button>
                            <span>{item.qty}</span>
                            <button onClick={() => updateParticularRow(item.id, 'qty', item.qty + 1)}>+</button>
                          </div>
                        ) : '-'}
                      </td>
                      <td>
                        {item.isFilled ? (
                          <input
                            type="number"
                            value={item.individualPrice}
                            onChange={(e) => updateParticularRow(item.id, 'individualPrice', Number(e.target.value))}
                            className="form-control price-input"
                            onWheel={(e) => e.target.blur()}
                          />
                        ) : '-'}
                      </td>
                      <td className={item.isFilled ? "fw-bold" : ""}>
                        {item.isFilled ? `₹${item.totalPrice.toFixed(2)}` : '-'}
                      </td>
                      <td>
                        {item.isFilled ? (
                          <button className="btn btn-danger btn-sm" onClick={() => removeParticular(item.id)}>
                            <i className="bi bi-trash"></i>
                          </button>
                        ) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Side: Payment Summary (40%) */}
          <div className="summary-section">
            <h5 className="summary-title">PAYMENT SUMMARY</h5>
            <div className="summary-details">
              <div className="summary-item">
                <span>Total Items:</span>
                <span className="fw-bold">{totals.totalItems}</span>
              </div>
              <div className="summary-item">
                <span>Total Paid:</span>
                <span className="fw-bold">₹{totals.totalPaidCredits.toFixed(2)}</span>
              </div>
              <div className="summary-item">
                <span>Total Credits:</span>
                <span className="fw-bold">₹{totals.totalCredits.toFixed(2)}</span>
              </div>

              <hr className="my-1 text-muted" />

              <div className="summary-item text-danger fw-bold">
                <span>Total Bill:</span>
                <span>₹{totals.totalBillsWithoutGst.toFixed(2)}</span>
              </div>
              <div className="summary-item">
                <span>GST (SGST + CGST):</span>
                <div className="gst-input-wrapper">
                  <input
                    type="number"
                    value={totals.gstPercentage}
                    onChange={(e) => setTotals({ ...totals, gstPercentage: Number(e.target.value) })}
                    className="form-control gst-input"
                    onWheel={(e) => e.target.blur()}
                  />
                  <span>%</span>
                  <span className="fw-bold ms-2">₹{totals.gstAmount.toFixed(2)}</span>
                </div>
              </div>

              <hr className="my-1 text-muted" />

              {totals.discount > 0 && (
                <div className="summary-item text-success fw-bold">
                  <span>Discount:</span>
                  <span>-₹{totals.discount.toFixed(2)}</span>
                </div>
              )}

              <div className="summary-item">
                <span>Total To Pay:</span>
                <span className="fw-bold">₹{totals.totalToPay.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-4 d-flex align-items-center justify-content-end gap-3">
              <span className="fs-4 fw-bold" style={{ color: '#6b7280' }}>TOTAL</span>
              <div className="fs-4 fw-bold text-dark" style={{ backgroundColor: '#fffde7', border: '1px solid #90caf9', padding: '5px 15px', minWidth: '150px', textAlign: 'right' }}>
                {totals.totalToPay.toFixed(2)}
              </div>
            </div>
          </div>

        </div>

        {/* Row 4: Payment Details */}
        <div className="bill-row row-4 payment-row">
          <div className="payment-type-group">
            <label className="fw-bold me-2">Payment:</label>
            <select
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
              className="form-select payment-select"
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>

          <div className="payment-paid-box ms-4">
            <span className="fw-bold me-2 text-nowrap">Total Paid:</span>
            <input
              type="number"
              value={amountPaid}
              onChange={(e) => {
                const val = e.target.value;
                if (val && Number(val) > totals.totalToPay) {
                  toast.error("Paid amount cannot exceed total bill amount.");
                  setAmountPaid(totals.totalToPay.toString());
                } else {
                  setAmountPaid(val);
                }
              }}
              className="form-control paid-input"
              placeholder="Amount"
              onWheel={(e) => e.target.blur()}
            />
          </div>

          <div className="credit-checkbox-group ms-4">
            <input
              type="checkbox"
              id="enableCredit"
              checked={enableCredit}
              onChange={(e) => setEnableCredit(e.target.checked)}
              className="form-check-input"
            />
            <label htmlFor="enableCredit" className="form-check-label ms-2 fw-bold text-danger">Enable Credit</label>
          </div>

          {enableCredit && (
            <div className="payment-total-box ms-4">
              <span className="fw-bold">Total Bill:</span>
              <span className="fw-bold ms-2">₹{totals.totalToPay.toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Actions Row */}
        <div className="bill-actions d-flex justify-content-between align-items-start mt-4">
          <div className="extra-actions-container">
            <button className="btn btn-outline-secondary px-4" onClick={() => setShowExtra(!showExtra)}>Extra</button>
            {showExtra && (
              <div className="extra-fields-card mt-3 p-3 bg-light border rounded d-flex align-items-center gap-4">
                <div className="form-group d-flex align-items-center m-0">
                  <label className="me-2 fw-bold text-nowrap">Price Discount</label>
                  <input
                    type="number"
                    className="form-control"
                    style={{ width: '150px' }}
                    value={priceDiscount}
                    onChange={e => setPriceDiscount(e.target.value)}
                    placeholder="Amount"
                    onWheel={(e) => e.target.blur()}
                  />
                </div>
                <div className="form-group d-flex align-items-center m-0">
                  <label className="me-2 fw-bold text-nowrap">Tds Amount</label>
                  <input
                    type="number"
                    className="form-control"
                    style={{ width: '150px' }}
                    value={tdsAmount}
                    onChange={e => setTdsAmount(e.target.value)}
                    placeholder="Amount"
                    onWheel={(e) => e.target.blur()}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="save-actions">
            <button className="btn btn-primary px-4 me-3" onClick={() => handleSave(false)}>Save</button>
            <button className="btn btn-secondary px-4" onClick={() => handleSave(true)}>Save and Print</button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CreateBill;
