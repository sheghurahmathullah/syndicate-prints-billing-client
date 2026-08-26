import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import './CreateBill.css';
import { AppContext } from '../../context/AppContext';
import { getNextBillNumber, createBill, updateBill, checkCustomerCredit } from '../../Service/BillService';
import { fetchCustomers } from '../../Service/CustomerService';
import { fetchEmployeeNames } from '../../Service/EmployeeService';
import { getParticularDetailsById, getAllParticularsForBill } from '../../Service/ParticularService';
import toast from 'react-hot-toast';
import ReceiptPopup from '../../components/ReceiptPopup/ReceiptPopup.jsx';

const CreateBill = () => {
  const { auth } = useContext(AppContext);
  const location = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();

  const isEditMode = !!id;
  const editingBill = location.state?.bill;

  const [printBill, setPrintBill] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savingType, setSavingType] = useState(null); // 'save' | 'print' | null

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

  // Credit Check State
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [creditInfo, setCreditInfo] = useState(null);
  const [isCheckingCredit, setIsCheckingCredit] = useState(false);

  // Particulars Preload & Search State
  const [allParticulars, setAllParticulars] = useState([]);
  const [activeParticularDropdownRowId, setActiveParticularDropdownRowId] = useState(null);

  // Derived State (Calculations)
  const [totals, setTotals] = useState({
    totalItems: 0,
    totalBillsWithoutGst: 0,
    gstPercentage: 0, // Default to Non-GST (0%) on initial load
    gstAmount: 0,
    discount: 0,
    tdsAmount: 0,
    totalPaidCredits: 0,
    totalCredits: 0,
    totalToPay: 0
  });

  useEffect(() => {
    fetchInitialData();
  }, [isEditMode, editingBill?.id]);

  const matchShortcutEvent = (e, keyString) => {
    if (!keyString) return false;
    const parts = keyString.toLowerCase().split('+').map(s => s.trim());
    
    const requiresCtrl = parts.includes('ctrl') || parts.includes('control');
    const requiresShift = parts.includes('shift');
    const requiresAlt = parts.includes('alt');
    const requiresMeta = parts.includes('cmd') || parts.includes('command') || parts.includes('meta') || parts.includes('win');

    if (requiresCtrl !== e.ctrlKey) return false;
    if (requiresShift !== e.shiftKey) return false;
    if (requiresAlt !== e.altKey) return false;
    if (requiresMeta !== e.metaKey) return false;

    const keyPart = parts.find(p => !['ctrl', 'control', 'shift', 'alt', 'cmd', 'command', 'meta', 'win'].includes(p));
    if (!keyPart) return true;

    const eventKey = e.key ? e.key.toLowerCase() : '';
    const eventCode = e.code ? e.code.toLowerCase() : '';

    if (keyPart === 'enter' || keyPart === 'return') {
      return eventKey === 'enter';
    }
    if (keyPart === 'space') {
      return eventKey === ' ' || eventCode === 'space';
    }
    if (keyPart === 'esc' || keyPart === 'escape') {
      return eventKey === 'escape';
    }

    return eventKey === keyPart || eventCode === `key${keyPart}` || eventCode === keyPart;
  };

  const handleSaveRef = React.useRef();

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // 1) Ctrl + Enter => GST Bill (18% GST) -> Auto Save & Print
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        e.stopPropagation();
        if (handleSaveRef.current) {
          handleSaveRef.current(true, 18);
        }
        return;
      }

      // 2) Plain Enter => Non-GST Bill (0% GST) -> Auto Save & Print
      if (e.key === 'Enter' && !e.ctrlKey && !e.altKey && !e.shiftKey && !e.metaKey) {
        const targetTag = e.target?.tagName?.toLowerCase();
        const isParticularInput = e.target?.classList?.contains('particular-add-input') ||
                                  e.target?.classList?.contains('particular-input') ||
                                  e.target?.placeholder?.includes('Item ID') ||
                                  e.target?.placeholder?.includes('Particular ID');

        // If user is actively typing an Item ID into a particular input, let handleParticularAdd handle it
        if (isParticularInput && e.target?.value?.trim() !== '') {
          return;
        }

        if (targetTag === 'textarea' || targetTag === 'button') {
          return;
        }

        e.preventDefault();
        e.stopPropagation();
        if (handleSaveRef.current) {
          handleSaveRef.current(true, 0);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const fetchNextBillNumber = async () => {
    try {
      const billRes = await getNextBillNumber();
      if (billRes?.data) {
        setBillNumber(billRes.data.nextBillNumber || billRes.data);
      }
    } catch (err) {
      console.error("Error loading bill number", err);
    }
  };

  const fetchInitialData = async () => {
    try {
      const isCreate = !(isEditMode && editingBill);

      // 1. Fetch Customers and update state immediately upon response
      fetchCustomers().then(custRes => {
        if (custRes?.data) {
          setCustomers(custRes.data.content || custRes.data);
        }
      }).catch(err => console.error("Error loading customers", err));

      // 2. Fetch Employee Names and update state immediately upon response
      fetchEmployeeNames().then(empRes => {
        if (empRes?.data) {
          setEmployeeNames(empRes.data);
        }
      }).catch(err => console.error("Error loading employee names", err));

      // 3. Fetch Next Bill Number and update state IMMEDIATELY upon response (~600ms)
      if (isCreate) {
        fetchNextBillNumber();
      }

      // 4. Fetch All Particulars for Fast Lookup on Page Load
      getAllParticularsForBill().then(particularsRes => {
        if (particularsRes?.data) {
          setAllParticulars(Array.isArray(particularsRes.data) ? particularsRes.data : []);
        }
      }).catch(err => console.error("Error loading particulars for bill", err));

      if (isEditMode && editingBill) {
        setBillNumber(editingBill.billNumber);
        setSelectedEmployee(editingBill.employee || '');
        setEmployeeSearch(editingBill.employee || '');

        setCustomerSearch(editingBill.customerName || '');
        setSelectedCustomer({
          customerName: editingBill.customerName || '',
          customerGstNo: editingBill.customerGstNo || '',
          customerMobileNo: editingBill.customerMobileNo || '',
          customerEmail: editingBill.customerEmail || ''
        });

        setPaymentType(editingBill.payment || 'Cash');
        setAmountPaid(editingBill.totalPaid || '');
        setEnableCredit(editingBill.creditAmount > 0);

        setPriceDiscount('');
        setTdsAmount('');

        let parsedParticulars = [];
        try {
          if (typeof editingBill.particulars === 'string') {
            parsedParticulars = JSON.parse(editingBill.particulars);
          } else if (Array.isArray(editingBill.particulars)) {
            parsedParticulars = editingBill.particulars;
          }
        } catch (e) {
          console.error("Failed to parse particulars", e);
        }

        const newParticularsList = parsedParticulars.map(p => ({
          id: Date.now().toString() + Math.random().toString(),
          particularId: p.particularId || p.particularName || '',
          particularName: p.name || p.particularName || '',
          type: 'Single Side',
          qty: p.qty || 1,
          basePrice: p.price || 0,
          priceBack: p.price || 0,
          individualPrice: p.price || 0,
          totalPrice: (p.qty || 1) * (p.price || 0),
          isFilled: true
        }));

        while (newParticularsList.length < 5 || newParticularsList.filter(p => !p.isFilled).length < 2) {
          newParticularsList.push(getEmptyParticularRow());
        }

        setParticularsList(newParticularsList);

      } else {
        if (auth?.username) {
          setSelectedEmployee(auth.username);
          setEmployeeSearch(auth.username);
        }
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
    setSelectedEmployee(val);
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
    setCustomerSearch(customer.name);
    setSelectedCustomer({
      customerName: customer.name,
      customerGstNo: customer.taxNumber || customer.gstin || customer.customerGstNo || customer.gstNo || '',
      customerMobileNo: customer.phoneNumber || customer.customerMobileNo || customer.mobileNo || '',
      customerEmail: customer.email || customer.customerEmail || ''
    });

    if (customer.name) {
      setIsCheckingCredit(true);
      checkCustomerCredit(customer.name)
        .then((res) => {
          if (res.data) {
            setCreditInfo(res.data);
            if (res.data.iscustomerHasCredit) {
              setShowCreditModal(true);
            }
          }
        })
        .catch((err) => {
          console.error("Failed to check customer credit", err);
        })
        .finally(() => {
          setIsCheckingCredit(false);
        });
    }
  };

  const handleCustomerSearchChange = (e) => {
    const val = e.target.value;
    setCustomerSearch(val);
    setSelectedCustomer(prev => ({ ...prev, customerName: val }));
    if (val.trim()) {
      setShowCustomerDropdown(true);
    } else {
      setShowCustomerDropdown(false);
    }
  };

  const filteredCustomers = customers.filter(c =>
    c.name?.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phoneNumber?.includes(customerSearch)
  );

  const selectParticularForItem = (rowId, data) => {
    if (!data) return;
    const pId = data.particularId || data.id || '';
    const rawName = data.particularName || data.name || pId;
    const displayName = String(rawName).toUpperCase();

    const searchKey = String(pId).trim().toLowerCase();
    const isDuplicate = particularsList.some(p => p.id !== rowId && p.isFilled && (String(p.particularId || '').trim().toLowerCase() === searchKey || String(p.particularName || '').toLowerCase() === displayName.toLowerCase()));

    if (isDuplicate) {
      toast.error("This particular is already added to the bill.");
      return;
    }

    setParticularsList(prevList => {
      let newList = prevList.map(p => {
        if (p.id === rowId) {
          return {
            ...p,
            particularId: pId,
            particularName: displayName,
            type: 'Single Side',
            qty: 1,
            basePrice: data.price || data.basePrice || 0,
            priceBack: data.priceBack || data.price || 0,
            individualPrice: data.price || data.basePrice || 0,
            totalPrice: data.price || data.basePrice || 0,
            isFilled: true
          };
        }
        return p;
      });

      const emptyCount = newList.filter(p => !p.isFilled).length;
      if (emptyCount < 2) {
        newList.push(getEmptyParticularRow());
      }
      return newList;
    });
    setActiveParticularDropdownRowId(null);
  };

  const handleParticularAdd = async (e, id) => {
    const item = particularsList.find(p => p.id === id);
    if (e.key === 'Enter') {
      if (item && item.particularId && item.particularId.trim() !== '') {
        e.preventDefault();
        e.stopPropagation();
        const searchId = item.particularId.trim().toLowerCase();

        // 1. Fast Lookup from preloaded allParticulars
        const matched = allParticulars.find(p =>
          String(p.particularId || '').toLowerCase() === searchId ||
          String(p.particularName || p.name || '').toLowerCase() === searchId
        );

        if (matched) {
          selectParticularForItem(id, matched);
          return;
        }

        // 2. Fallback API lookup if not found in preloaded list
        try {
          const res = await getParticularDetailsById(item.particularId.trim());
          if (res?.data) {
            selectParticularForItem(id, res.data);
          } else {
            toast.error("Particular not found");
          }
        } catch (error) {
          toast.error("Particular not found or error fetching details");
        }
      }
    }
  };

  const updateParticularRow = (id, field, value) => {
    setParticularsList(prevList =>
      prevList.map(item => {
        if (item.id === id) {
          let updatedItem = { ...item, [field]: value };

          if (field === 'type') {
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
      while (newList.length < 5 || newList.filter(p => !p.isFilled).length < 2) {
        newList.push(getEmptyParticularRow());
      }
      return newList;
    });
  };

  useEffect(() => {
    let itemsCount = 0;
    let subtotalWithoutGst = 0;

    particularsList.forEach(item => {
      if (item.isFilled) {
        itemsCount += 1;
        subtotalWithoutGst += Number(item.totalPrice) || 0;
      }
    });

    const disc = Number(priceDiscount) || 0;
    const tds = Number(tdsAmount) || 0;

    const netSubtotal = Math.max(0, subtotalWithoutGst - disc - tds);
    const gstAmt = (netSubtotal * totals.gstPercentage) / 100;
    const finalToPay = netSubtotal + gstAmt;
    const displayTotalPaid = enableCredit ? (Number(amountPaid) || 0) : finalToPay;

    setTotals(prev => ({
      ...prev,
      totalItems: itemsCount,
      totalBillsWithoutGst: subtotalWithoutGst,
      gstAmount: gstAmt,
      discount: disc,
      tdsAmount: tds,
      totalPaidCredits: displayTotalPaid,
      totalCredits: enableCredit ? Math.max(0, finalToPay - (Number(amountPaid) || 0)) : 0,
      totalToPay: finalToPay
    }));
  }, [particularsList, totals.gstPercentage, priceDiscount, tdsAmount, amountPaid, enableCredit]);

  const handleShowReceipt = (bill, autoPrint = false, activeGstPct = null) => {
    let items = [];
    const filledParticulars = (particularsList || []).filter(p => p.isFilled);

    if (filledParticulars.length > 0) {
      items = filledParticulars.map(p => ({
        name: (p.particularName || p.name || "ITEM").toUpperCase(),
        quantity: p.qty || 1,
        price: Number(p.individualPrice !== undefined && p.individualPrice !== null ? p.individualPrice : p.price) || 0
      }));
    } else if (bill && bill.particulars) {
      try {
        const parsed = typeof bill.particulars === 'string' ? JSON.parse(bill.particulars) : bill.particulars;
        items = (parsed || []).map(p => ({
          name: (p.particularName || p.name || p.particularId || "ITEM").toUpperCase(),
          quantity: p.qty || 1,
          price: Number(p.price !== undefined && p.price !== null ? p.price : p.individualPrice) || 0
        }));
      } catch (e) {
        console.error("Failed to parse bill particulars", e);
      }
    }

    const effectiveTaxPct = activeGstPct !== null ? activeGstPct : totals.gstPercentage;

    const orderDetails = {
      invoiceNumber: bill.billNumber,
      orderId: bill.id,
      createdAt: bill.createdAt || bill.date,
      username: (bill.employee || "").toUpperCase(),
      customerName: (bill.customerName || "CASH CUSTOMER").toUpperCase(),
      grandTotal: bill.total || 0,
      paidAmount: bill.totalPaid || 0,
      tax: (bill.total || 0) - (bill.actualTotal !== undefined && bill.actualTotal !== null ? bill.actualTotal : (bill.totalWithGst || bill.total || 0)),
      items: items,
      creditType: bill.creditAmount > 0 ? "CREDIT" : "CASH",
      pendingAmount: bill.creditAmount || 0,
      taxPercent: effectiveTaxPct,
      subtotal: bill.actualTotal !== undefined && bill.actualTotal !== null ? bill.actualTotal : (bill.totalWithGst || bill.total || 0),
      gstin: (bill.customerGstNo || "").toUpperCase()
    };

    setPrintBill(orderDetails);
    if (autoPrint) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  };

  const getFormattedBillNumberWithGst = (gstPct) => {
    let num = billNumber?.billNumber || billNumber || '';
    if (!num) return '';
    const cleanNum = String(num).replace(/-E$/i, '');
    return gstPct === 0 ? `${cleanNum}-E` : cleanNum;
  };

  const getFormattedBillNumber = () => {
    return getFormattedBillNumberWithGst(totals.gstPercentage);
  };

  const handleSave = async (printAfter = false, overrideGstPercent = null) => {
    if (isSaving) return;

    try {
      // 1. Employee Name Validation
      const empName = (selectedEmployee || employeeSearch || "").trim();
      if (!empName) {
        toast.error("Please select or enter an Employee Name.");
        return;
      }

      // 2. Customer Name Validation
      const custName = (selectedCustomer.customerName || customerSearch || "").trim();
      if (!custName) {
        toast.error("Please select or enter a Customer Name.");
        return;
      }

      // 3. Particulars Item Validation
      const filledItems = particularsList.filter(p => p.isFilled);
      if (filledItems.length === 0) {
        toast.error("Please add or select at least one particular item.");
        return;
      }

      setIsSaving(true);
      setSavingType(printAfter ? 'print' : 'save');

      const finalEmployeeName = empName;
      const finalCustomerName = custName;

      const activeGstPct = overrideGstPercent !== null ? overrideGstPercent : totals.gstPercentage;

      // Calculate subtotal and GST dynamically to prevent stale state issues
      const subtotalWithoutGst = filledItems.reduce((acc, curr) => acc + (Number(curr.totalPrice) || 0), 0);
      const disc = Number(priceDiscount) || 0;
      const tds = Number(tdsAmount) || 0;
      const netSubtotal = Math.max(0, subtotalWithoutGst - disc - tds);
      const gstAmt = activeGstPct > 0 ? (netSubtotal * activeGstPct) / 100 : 0;
      const finalTotalToPay = Number((netSubtotal + gstAmt).toFixed(2));

      // Always update totals state for UI rendering
      setTotals(prev => ({
        ...prev,
        gstPercentage: activeGstPct,
        gstAmount: gstAmt,
        totalToPay: finalTotalToPay,
        totalBillsWithoutGst: subtotalWithoutGst
      }));

      const billNoToUse = getFormattedBillNumberWithGst(activeGstPct);

      const calculatedTotalPaid = enableCredit
        ? (amountPaid !== '' && amountPaid !== null ? Number(Number(amountPaid).toFixed(2)) : 0)
        : finalTotalToPay;

      const payload = {
        billNumber: billNoToUse,
        employee: finalEmployeeName,
        customerName: finalCustomerName,
        customerEmail: selectedCustomer.customerEmail || '',
        customerMobileNo: selectedCustomer.customerMobileNo || '',
        customerGstNo: activeGstPct > 0 ? (selectedCustomer.customerGstNo || '') : '',
        payment: paymentType.toUpperCase(),
        totalPaid: calculatedTotalPaid,
        total: finalTotalToPay,
        creditAmount: enableCredit ? Number((finalTotalToPay - calculatedTotalPaid).toFixed(2)) : 0,
        actualTotal: Number(subtotalWithoutGst.toFixed(2)),
        totalWithGst: Number(finalTotalToPay.toFixed(2)),
        totalItems: filledItems.length,
        discount: Number(disc.toFixed(2)),
        tdsAmount: Number(tds.toFixed(2)),
        creditPaidAmount: enableCredit ? calculatedTotalPaid : 0,
        particulars: JSON.stringify(filledItems.map(p => ({
          particularId: p.particularId,
          qty: p.qty,
          price: Number(Number(p.individualPrice).toFixed(2))
        })))
      };

      if (isEditMode) {
        const res = await updateBill(id, payload);
        if (res.data) {
          toast.success(`Bill updated successfully (${activeGstPct}% GST)!`);
          handleShowReceipt(res.data, printAfter, activeGstPct);
        }
      } else {
        const res = await createBill(payload);
        if (res.data) {
          toast.success(`Bill saved successfully (${activeGstPct}% GST)!`);
          handleShowReceipt(res.data, printAfter, activeGstPct);

          setSelectedEmployee('');
          setEmployeeSearch('');
          setCustomerSearch('');
          setSelectedCustomer({ customerName: '', customerGstNo: '', customerMobileNo: '', customerEmail: '' });
          setParticularsList(Array(5).fill(null).map(() => getEmptyParticularRow()));
          setPaymentType('Cash');
          setEnableCredit(false);
          setAmountPaid('');
          setPriceDiscount('');
          setTdsAmount('');
          setShowExtra(false);
          setTotals({
            totalItems: 0,
            totalBillsWithoutGst: 0,
            gstPercentage: 0,
            gstAmount: 0,
            discount: 0,
            tdsAmount: 0,
            totalPaidCredits: 0,
            totalCredits: 0,
            totalToPay: 0
          });
          fetchNextBillNumber();
        }
      }
    } catch (error) {
      toast.error(`Failed to ${isEditMode ? 'update' : 'save'} bill`);
    } finally {
      setIsSaving(false);
      setSavingType(null);
    }
  };

  handleSaveRef.current = handleSave;

  const handleCloseReceipt = () => {
    setPrintBill(null);
    if (isEditMode) {
      navigate('/bills/all');
    }
  };

  return (
    <div className="create-bill-container fade-in">
      <div className="page-header">
        <h2>{isEditMode ? 'Edit Bill' : 'Create Bill'}</h2>
      </div>

      <div className="bill-card">
        {/* Row 1: Bill No, Employee, Customer Search */}
        <div className="bill-row row-1">
          <div className="form-group">
            <label>Bill Number</label>
            <input type="text" value={getFormattedBillNumber()} disabled className="form-control disabled-input bill-number-text" />
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
          {totals.gstPercentage > 0 && (
            <div className="form-group">
              <label>GST No</label>
              <input type="text" value={selectedCustomer.customerGstNo} onChange={(e) => setSelectedCustomer({ ...selectedCustomer, customerGstNo: e.target.value })} className="form-control" placeholder="Enter GSTIN" />
            </div>
          )}
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
                          <div className="particular-search-wrapper" style={{ position: 'relative' }}>
                            <input
                              type="text"
                              placeholder="Type Item ID or Name..."
                              value={item.particularId}
                              onChange={(e) => {
                                updateParticularRow(item.id, 'particularId', e.target.value);
                                setActiveParticularDropdownRowId(item.id);
                              }}
                              onFocus={() => setActiveParticularDropdownRowId(item.id)}
                              onBlur={() => setTimeout(() => setActiveParticularDropdownRowId(null), 200)}
                              onKeyDown={(e) => handleParticularAdd(e, item.id)}
                              className="form-control particular-add-input"
                            />
                            {activeParticularDropdownRowId === item.id && item.particularId && item.particularId.trim() !== '' && (
                              <ul
                                className="customer-dropdown-list particular-dropdown-list"
                                style={{
                                  position: 'absolute',
                                  top: '100%',
                                  left: 0,
                                  right: 0,
                                  zIndex: 1000,
                                  maxHeight: '200px',
                                  overflowY: 'auto',
                                  background: '#fff',
                                  border: '1px solid #ccc',
                                  borderRadius: '4px',
                                  listStyle: 'none',
                                  padding: 0,
                                  margin: 0,
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                }}
                              >
                                {allParticulars
                                  .filter(p =>
                                    String(p.particularId || '').toLowerCase().includes(item.particularId.trim().toLowerCase()) ||
                                    String(p.particularName || p.name || '').toLowerCase().includes(item.particularId.trim().toLowerCase())
                                  )
                                  .slice(0, 10)
                                  .map((p, idx) => (
                                    <li
                                      key={idx}
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        selectParticularForItem(item.id, p);
                                      }}
                                      style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                                    >
                                      <span className="fw-bold" style={{ color: '#002142' }}>{p.particularId}</span> - {(p.particularName || p.name || '').toUpperCase()} (₹{p.price || 0})
                                    </li>
                                  ))}
                              </ul>
                            )}
                          </div>
                        ) : (
                          <span className="fw-bold">{item.particularName}</span>
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
                <span className="fw-bold">₹{(totals.totalPaidCredits || 0).toFixed(2)}</span>
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
              value={enableCredit ? amountPaid : totals.totalToPay > 0 ? totals.totalToPay.toFixed(2) : ''}
              disabled={!enableCredit}
              onChange={(e) => {
                const val = e.target.value;
                if (val && Number(val) > totals.totalToPay) {
                  toast.error("Paid amount cannot exceed total bill amount.");
                  setAmountPaid(totals.totalToPay.toString());
                } else {
                  setAmountPaid(val);
                }
              }}
              className={`form-control paid-input ${!enableCredit ? 'bg-light text-muted fw-bold' : ''}`}
              placeholder={enableCredit ? "Down Payment (₹0)" : `Full (₹${totals.totalToPay.toFixed(2)})`}
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

          <div className="save-actions d-flex align-items-center">
            <button
              className="btn btn-primary px-4 me-3 d-flex align-items-center gap-2"
              onClick={() => handleSave(false)}
              disabled={isSaving}
            >
              {isSaving && savingType === 'save' ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <span>{isEditMode ? 'Updating...' : 'Saving...'}</span>
                </>
              ) : (
                isEditMode ? 'Update' : 'Save'
              )}
            </button>
            <button
              className="btn btn-secondary px-4 d-flex align-items-center gap-2"
              onClick={() => handleSave(true)}
              disabled={isSaving}
            >
              {isSaving && savingType === 'print' ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <span>{isEditMode ? 'Updating & Printing...' : 'Saving & Printing...'}</span>
                </>
              ) : (
                isEditMode ? 'Update and Print' : 'Save and Print'
              )}
            </button>
          </div>
        </div>

      </div>

      {printBill && (
        <ReceiptPopup
          orderDetails={printBill}
          onClose={handleCloseReceipt}
        />
      )}

      {/* Rich UX/UI Customer Credit Info Modal */}
      {(showCreditModal || isCheckingCredit) && (
        <div className="credit-modal-overlay">
          <div className="credit-modal-card">
            <button
              type="button"
              className="credit-modal-close-btn"
              onClick={() => setShowCreditModal(false)}
              aria-label="Close"
            >
              <i className="bi bi-x-lg"></i>
            </button>

            {isCheckingCredit ? (
              <div className="credit-modal-body text-center py-5">
                <div className="credit-loader-wrapper mb-3">
                  <div className="credit-spinner"></div>
                  <i className="bi bi-shield-check credit-loader-icon"></i>
                </div>
                <h5 className="credit-modal-title fw-bold mt-3">Checking Credit Status...</h5>
                <p className="credit-modal-subtitle text-muted">Retrieving record for <strong className="text-dark">{customerSearch}</strong></p>
              </div>
            ) : creditInfo ? (
              <div className="credit-modal-body text-center">
                {creditInfo.iscustomerHasCredit ? (
                  <div className="fade-in-content">
                    <div className="credit-icon-badge badge-danger">
                      <i className="bi bi-exclamation-lg"></i>
                    </div>

                    <div className="mb-2">
                      <span className="credit-status-pill pill-danger">
                        <i className="bi bi-exclamation-circle-fill me-1"></i> Outstanding Credit Found
                      </span>
                    </div>

                    <h4 className="credit-modal-heading">Customer Credit Notice</h4>
                    <p className="credit-modal-subtext">
                      Customer <span className="customer-highlight">{customerSearch}</span> has pending credit orders.
                    </p>

                    <div className="credit-kpi-grid">
                      <div className="credit-kpi-card kpi-orders">
                        <div className="kpi-icon icon-orders"><i className="bi bi-receipt"></i></div>
                        <div className="kpi-info">
                          <span className="kpi-label">Credit Orders</span>
                          <span className="kpi-value">{creditInfo.creditOrdersCount}</span>
                        </div>
                      </div>

                      <div className="credit-kpi-card kpi-balance">
                        <div className="kpi-icon icon-balance"><i className="bi bi-wallet2"></i></div>
                        <div className="kpi-info">
                          <span className="kpi-label">Balance Due</span>
                          <span className="kpi-value text-danger">₹{Math.abs(Number(creditInfo.balanceToPay || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="fade-in-content py-2">
                    <div className="credit-icon-badge badge-success">
                      <i className="bi bi-check-lg"></i>
                    </div>

                    <div className="mb-2">
                      <span className="credit-status-pill pill-success">
                        <i className="bi bi-check-circle-fill me-1"></i> Account Clear
                      </span>
                    </div>

                    <h4 className="credit-modal-heading">No Outstanding Credit</h4>
                    <p className="credit-modal-subtext">
                      Customer <span className="customer-highlight">{customerSearch}</span> has no pending credits to pay.
                    </p>
                  </div>
                )}

                <div className="credit-modal-actions mt-4">
                  <button
                    className="credit-btn-primary"
                    onClick={() => setShowCreditModal(false)}
                  >
                    <span>Continue to Bill Creation</span>
                    <i className="bi bi-arrow-right ms-2 fs-5"></i>
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateBill;
