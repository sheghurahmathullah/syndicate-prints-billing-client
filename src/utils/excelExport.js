import { saveAs } from "file-saver";

/**
 * Formats data into a CSV string with BOM for Excel compatibility.
 */
const convertToCSV = (rows) => {
  return rows.map((row) =>
    row
      .map((item) => {
        if (item === null || item === undefined) return '""';
        const str = String(item).replace(/"/g, '""');
        return `"${str}"`;
      })
      .join(",")
  ).join("\r\n");
};

/**
 * Download all filtered daily expense records as an Excel-compatible CSV file.
 */
export const exportDailyExpensesToExcel = (dataList, fileName = "Daily_Expenses_Report.csv") => {
  if (!dataList || dataList.length === 0) return;

  // Extract unique expense item keys across all rows
  const expenseKeys = Array.from(
    new Set(
      dataList.reduce((keys, row) => {
        if (row.expenses) {
          Object.keys(row.expenses).forEach((key) => keys.add(key));
        }
        return keys;
      }, new Set())
    )
  ).sort();

  const headers = [
    "Date",
    "Branch",
    "Total Sales (₹)",
    "Cash In Hand (₹)",
    ...expenseKeys.map((k) => `Expense: ${k} (₹)`),
    "Total Expenses (₹)",
    "Net Operating Cash (₹)"
  ];

  let grandTotalSales = 0;
  let grandCashInHand = 0;
  let grandTotalExpenses = 0;
  const keyTotals = {};
  expenseKeys.forEach((k) => (keyTotals[k] = 0));

  const rows = [headers];

  dataList.forEach((row) => {
    const dateStr = row.date ? new Date(row.date).toLocaleDateString("en-IN") : "-";
    const branch = row.branch || "-";
    const sales = row.totalSales || 0;
    const cash = row.cashInHand || 0;

    let rowExpTotal = 0;
    const expCells = expenseKeys.map((k) => {
      const amt = (row.expenses && row.expenses[k]) || 0;
      rowExpTotal += amt;
      keyTotals[k] += amt;
      return amt.toFixed(2);
    });

    grandTotalSales += sales;
    grandCashInHand += cash;
    grandTotalExpenses += rowExpTotal;

    const netCash = sales - rowExpTotal;

    rows.push([
      dateStr,
      branch,
      sales.toFixed(2),
      cash.toFixed(2),
      ...expCells,
      rowExpTotal.toFixed(2),
      netCash.toFixed(2)
    ]);
  });

  // Add Totals Row
  const totalExpCells = expenseKeys.map((k) => keyTotals[k].toFixed(2));
  rows.push([
    "TOTALS",
    "-",
    grandTotalSales.toFixed(2),
    grandCashInHand.toFixed(2),
    ...totalExpCells,
    grandTotalExpenses.toFixed(2),
    (grandTotalSales - grandTotalExpenses).toFixed(2)
  ]);

  const csvContent = "\uFEFF" + convertToCSV(rows);
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, fileName);
};

/**
 * Download a single daily expense ledger record with itemized metrics to Excel.
 */
export const exportSingleDailyExpenseToExcel = (row) => {
  if (!row) return;

  const dateStr = row.date ? new Date(row.date).toLocaleDateString("en-IN") : "Record";
  const branchStr = row.branch || "Branch";
  const fileName = `Daily_Ledger_${branchStr}_${dateStr.replace(/\//g, "-")}.csv`;

  const rows = [];

  rows.push(["SYNDICATE PRINTS - DAILY OPERATIONS EXPENSE LEDGER"]);
  rows.push(["Branch", branchStr]);
  rows.push(["Date", dateStr]);
  rows.push(["Total Daily Sales (Earned)", `₹ ${(row.totalSales || 0).toFixed(2)}`]);
  rows.push(["Cash In Hand", `₹ ${(row.cashInHand || 0).toFixed(2)}`]);
  rows.push([]);

  // Itemized Operating Expenses (Skip if empty or total = 0)
  if (row.expenses && Object.keys(row.expenses).length > 0) {
    const nonZeroExp = Object.entries(row.expenses).filter(([_, amt]) => (amt || 0) > 0);
    if (nonZeroExp.length > 0) {
      rows.push(["ITEMIZED OPERATING EXPENSES"]);
      rows.push(["Expense Item Name", "Amount (₹)"]);
      let totalExp = 0;
      nonZeroExp.forEach(([item, amt]) => {
        rows.push([item, (amt || 0).toFixed(2)]);
        totalExp += amt || 0;
      });
      rows.push(["Total Itemized Expenses", totalExp.toFixed(2)]);
      rows.push([]);
    }
  }

  // Other Expenses (Skip if 0 data)
  if (Array.isArray(row.otherExpenses) && row.otherExpenses.length > 0) {
    const validOther = row.otherExpenses.filter((e) => e.type || parseFloat(e.amount) > 0);
    if (validOther.length > 0) {
      rows.push(["OTHER AD-HOC EXPENSES"]);
      rows.push(["Purpose / Category", "Amount (₹)"]);
      let total = 0;
      validOther.forEach((e) => {
        const amt = parseFloat(e.amount) || 0;
        rows.push([e.type || "Other Expense", amt.toFixed(2)]);
        total += amt;
      });
      rows.push(["Total Other Expenses", total.toFixed(2)]);
      rows.push([]);
    }
  }

  // Advance Payments (Skip if 0 data)
  if (Array.isArray(row.advancePayments) && row.advancePayments.length > 0) {
    const validAdv = row.advancePayments.filter((p) => p.type || parseFloat(p.amount) > 0);
    if (validAdv.length > 0) {
      rows.push(["STAFF / VENDOR ADVANCE PAYMENTS"]);
      rows.push(["Beneficiary / Purpose", "Amount (₹)"]);
      let total = 0;
      validAdv.forEach((p) => {
        const amt = parseFloat(p.amount) || 0;
        rows.push([p.type || "Advance", amt.toFixed(2)]);
        total += amt;
      });
      rows.push(["Total Advance Paid", total.toFixed(2)]);
      rows.push([]);
    }
  }

  // Cheque Payments (Skip if 0 data)
  if (Array.isArray(row.checkPayments) && row.checkPayments.length > 0) {
    const validCheck = row.checkPayments.filter((c) => c.checkNo || parseFloat(c.amount) > 0);
    if (validCheck.length > 0) {
      rows.push(["CHEQUE PAYMENTS ISSUED"]);
      rows.push(["Cheque Number", "Amount (₹)"]);
      let total = 0;
      validCheck.forEach((c) => {
        const amt = parseFloat(c.amount) || 0;
        rows.push([c.checkNo || "Cheque", amt.toFixed(2)]);
        total += amt;
      });
      rows.push(["Total Cheque Payments", total.toFixed(2)]);
      rows.push([]);
    }
  }

  // Cash Deposits (Skip if 0 data)
  if (Array.isArray(row.cashDeposits) && row.cashDeposits.length > 0) {
    const validDep = row.cashDeposits.filter((d) => d.refNo || parseFloat(d.amount) > 0);
    if (validDep.length > 0) {
      rows.push(["BANK CASH DEPOSITS"]);
      rows.push(["Deposit Ref / Sl No.", "Amount (₹)"]);
      let total = 0;
      validDep.forEach((d) => {
        const amt = parseFloat(d.amount) || 0;
        rows.push([d.refNo || "Ref No.", amt.toFixed(2)]);
        total += amt;
      });
      rows.push(["Total Bank Cash Deposits", total.toFixed(2)]);
      rows.push([]);
    }
  }

  // Other Incomes (Skip if 0 data)
  if (Array.isArray(row.otherIncomes) && row.otherIncomes.length > 0) {
    const validInc = row.otherIncomes.filter((i) => i.reason || parseFloat(i.amount) > 0);
    if (validInc.length > 0) {
      rows.push(["OTHER ANCILLARY INCOMES"]);
      rows.push(["Source / Reason", "Amount (₹)"]);
      let total = 0;
      validInc.forEach((i) => {
        const amt = parseFloat(i.amount) || 0;
        rows.push([i.reason || "Ancillary Income", amt.toFixed(2)]);
        total += amt;
      });
      rows.push(["Total Ancillary Income", total.toFixed(2)]);
      rows.push([]);
    }
  }

  // Machine Readings (Skip if 0 data)
  if (Array.isArray(row.machineReadings) && row.machineReadings.length > 0) {
    const validReadings = row.machineReadings.filter((m) => m.machine || parseFloat(m.currentReading) > 0 || parseFloat(m.oldReading) > 0);
    if (validReadings.length > 0) {
      rows.push(["MACHINE COUNTER METER READINGS"]);
      rows.push(["Machine Name", "Current Reading", "Old Reading", "Meter Units Diff"]);
      validReadings.forEach((m) => {
        rows.push([
          m.machine || "Machine",
          m.currentReading || "0",
          m.oldReading || "0",
          m.diff || "0"
        ]);
      });
      rows.push([]);
    }
  }

  const csvContent = "\uFEFF" + convertToCSV(rows);
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, fileName);
};
