import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Generates and downloads a single day's Daily Operations Expense Ledger PDF report.
 * Skips zero/empty data categories to keep the PDF clean and executive.
 */
export const exportSingleDailyExpenseToPdf = (row) => {
  if (!row) return;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const dateStr = row.date
    ? new Date(row.date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "N/A";
  const branchStr = row.branch || "Branch";

  // Primary Royal Navy & Crimson Palette Colors
  const primaryColor = [0, 33, 66]; // #002142
  const secondaryColor = [0, 33, 66]; // #002142
  const accentRed = [230, 64, 81]; // #e64051
  const textColor = [15, 23, 42]; // #0f172a

  let currentY = 15;

  // 1. Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(14, currentY, 182, 24, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("SYNDICATE PRINTS - DAILY EXPENSE LEDGER", 20, currentY + 10);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Branch: ${branchStr}   |   Date: ${dateStr}`, 20, currentY + 18);

  currentY += 30;

  // 2. Calculate Total Daily Expense
  let totalExpenses = 0;
  if (row.expenses) {
    Object.values(row.expenses).forEach((v) => (totalExpenses += parseFloat(v) || 0));
  }
  if (Array.isArray(row.otherExpenses)) {
    row.otherExpenses.forEach((e) => (totalExpenses += parseFloat(e.amount) || 0));
  }
  if (Array.isArray(row.advancePayments)) {
    row.advancePayments.forEach((p) => (totalExpenses += parseFloat(p.amount) || 0));
  }
  if (Array.isArray(row.checkPayments)) {
    row.checkPayments.forEach((c) => (totalExpenses += parseFloat(c.amount) || 0));
  }

  // 3. KPI Summary Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, currentY, 182, 34, 3, 3, "FD");

  // Row 1: Total Sales (Earned) & Cash In Hand & Total Daily Expenses
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(100, 116, 139);
  doc.text("TOTAL SALES (EARNED)", 18, currentY + 7);
  doc.setFontSize(10);
  doc.setTextColor(...secondaryColor);
  doc.text(`INR ${(row.totalSales || 0).toFixed(2)}`, 18, currentY + 14);

  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("CASH IN HAND", 80, currentY + 7);
  doc.setFontSize(10);
  doc.setTextColor(2, 132, 199);
  doc.text(`INR ${(row.cashInHand || 0).toFixed(2)}`, 80, currentY + 14);

  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("TOTAL EXPENSES", 140, currentY + 7);
  doc.setFontSize(10);
  doc.setTextColor(...accentRed);
  doc.text(`INR ${totalExpenses.toFixed(2)}`, 140, currentY + 14);

  // Row 2: Last Closed & Shortage
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("LAST CLOSED", 18, currentY + 22);
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(`INR ${(row.lastClosed || 0).toFixed(2)}`, 18, currentY + 29);

  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("SHORTAGE", 80, currentY + 22);
  doc.setFontSize(10);
  doc.setTextColor(217, 119, 6);
  doc.text(`INR ${(row.shortage || 0).toFixed(2)}`, 80, currentY + 29);

  currentY += 40;

  // Helper to add autoTable sections
  const addSectionTable = (title, headers, rowsData, titleColor = accentRed) => {
    if (rowsData.length === 0) return;

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...titleColor);
    doc.text(title, 14, currentY);
    currentY += 3;

    autoTable(doc, {
      startY: currentY,
      head: [headers],
      body: rowsData,
      theme: "grid",
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8.5,
        halign: "left",
      },
      bodyStyles: {
        fontSize: 8.5,
        textColor: textColor,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: { left: 14, right: 14 },
    });

    currentY = doc.lastAutoTable.finalY + 10;
  };

  // 1. Itemized Operating Expenses (Skip if empty)
  if (row.expenses && Object.keys(row.expenses).length > 0) {
    const expRows = Object.entries(row.expenses)
      .filter(([_, amt]) => (parseFloat(amt) || 0) > 0)
      .map(([item, amt]) => [item, `INR ${parseFloat(amt).toFixed(2)}`]);
    addSectionTable("Catalog Operating Expenses", ["Expense Item", "Amount"], expRows, accentRed);
  }

  // 2. Other Ad-hoc Expenses (Skip if 0 data)
  if (Array.isArray(row.otherExpenses) && row.otherExpenses.length > 0) {
    const validOther = row.otherExpenses
      .filter((e) => (parseFloat(e.amount) || 0) > 0)
      .map((e) => [e.type || "Ad-hoc Expense", `INR ${(parseFloat(e.amount) || 0).toFixed(2)}`]);
    addSectionTable("Other Ad-hoc Expenses", ["Purpose / Category", "Amount"], validOther, accentRed);
  }

  // 3. Advance Payments (Skip if 0 data)
  if (Array.isArray(row.advancePayments) && row.advancePayments.length > 0) {
    const validAdv = row.advancePayments
      .filter((p) => (parseFloat(p.amount) || 0) > 0)
      .map((p) => [p.type || "Advance Beneficiary", `INR ${(parseFloat(p.amount) || 0).toFixed(2)}`]);
    addSectionTable("Staff / Vendor Advance Payments", ["Beneficiary", "Amount"], validAdv, accentRed);
  }

  // 4. Cheque Payments Issued (Skip if 0 data)
  if (Array.isArray(row.checkPayments) && row.checkPayments.length > 0) {
    const validCheck = row.checkPayments
      .filter((c) => (parseFloat(c.amount) || 0) > 0)
      .map((c) => [c.checkNo || "N/A", `INR ${(parseFloat(c.amount) || 0).toFixed(2)}`]);
    addSectionTable("Cheque Payments Issued", ["Cheque Number", "Amount"], validCheck, accentRed);
  }

  // 5. Bank Cash Deposits (Skip if 0 data)
  if (Array.isArray(row.cashDeposits) && row.cashDeposits.length > 0) {
    const validDep = row.cashDeposits
      .filter((d) => (parseFloat(d.amount) || 0) > 0)
      .map((d) => [d.refNo || "N/A", `INR ${(parseFloat(d.amount) || 0).toFixed(2)}`]);
    addSectionTable("Bank Cash Deposits", ["Deposit Ref / Sl No.", "Amount"], validDep, secondaryColor);
  }

  // 6. Other Ancillary Incomes (Skip if 0 data)
  if (Array.isArray(row.otherIncomes) && row.otherIncomes.length > 0) {
    const validInc = row.otherIncomes
      .filter((i) => (parseFloat(i.amount) || 0) > 0)
      .map((i) => [i.reason || "Ancillary Income", `INR ${(parseFloat(i.amount) || 0).toFixed(2)}`]);
    addSectionTable("Other Ancillary Incomes", ["Income Source / Reason", "Amount"], validInc, [5, 150, 105]);
  }

  // 7. Machine Counter Readings (Skip if 0 data)
  if (Array.isArray(row.machineReadings) && row.machineReadings.length > 0) {
    const validReadings = row.machineReadings
      .filter((m) => parseFloat(m.currentReading) > 0 || parseFloat(m.oldReading) > 0)
      .map((m) => {
        const cur = parseFloat(m.currentReading) || 0;
        const old = parseFloat(m.oldReading) || 0;
        const diff = cur - old;
        return [m.machine || "Machine", String(cur), String(old), `+${diff >= 0 ? diff : 0}`];
      });
    addSectionTable("Machine Counter Meter Readings", ["Machine Name", "Current", "Old", "Units Run"], validReadings, primaryColor);
  }

  // Footer on all pages
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184);
    doc.text(`Page ${i} of ${pageCount} - Syndicate Prints Daily Ledger`, 14, 287);
    doc.text(`Generated on: ${new Date().toLocaleString("en-IN")}`, 140, 287);
  }

  // Save PDF file
  const fileName = `Daily_Ledger_${branchStr.replace(/\s+/g, "_")}_${dateStr.replace(/\//g, "-")}.pdf`;
  doc.save(fileName);
};
