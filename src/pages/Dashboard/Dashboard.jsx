import "./Dashboard.css";
import { useEffect, useState } from "react";
import { fetchDashboardData } from "../../Service/Dashboard.js";
import toast from "react-hot-toast";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  WidthType,
  AlignmentType,
  TextRun,
} from "docx";
import { saveAs } from "file-saver";
import ReceiptPopup from "../../components/ReceiptPopup/ReceiptPopup.jsx";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Date filter state
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [presetRange, setPresetRange] = useState("");
  const [paymentMode, setPaymentMode] = useState("");

  // Invoice print state
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetchDashboardData();
        setData(response.data);
        setFilteredOrders(response.data.recentOrders || []);
        console.log(response.data);
      } catch (error) {
        console.error(error);
        toast.error("Unable to view the data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Date filter functions
  const getDateRange = (range) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let from, to;

    switch (range) {
      case "today":
        from = new Date(today);
        to = new Date(today);
        to.setHours(23, 59, 59, 999);
        break;
      case "week":
        from = new Date(today);
        from.setDate(today.getDate() - today.getDay());
        to = new Date(today);
        to.setDate(today.getDate() - today.getDay() + 6);
        to.setHours(23, 59, 59, 999);
        break;
      case "month":
        from = new Date(today.getFullYear(), today.getMonth(), 1);
        to = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          0,
          23,
          59,
          59,
          999
        );
        break;
      default:
        return null;
    }
    return { from, to };
  };

  const handlePresetChange = (e) => {
    const value = e.target.value;
    setPresetRange(value);
    if (value === "custom" || value === "") return;
    const dates = getDateRange(value);
    if (dates) {
      const fromDate = dates.from.toISOString().split("T")[0];
      const toDate = dates.to.toISOString().split("T")[0];
      setDateFrom(fromDate);
      setDateTo(toDate);
      applyFilter(dates.from, dates.to);
    }
  };

  const applyFilter = (from, to) => {
    if (!data) return;

    const filtered = data.recentOrders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      const dateMatch = orderDate >= from && orderDate <= to;

      // If payment mode is selected, filter by it
      if (paymentMode) {
        return (
          dateMatch &&
          order.paymentMethod &&
          order.paymentMethod.toLowerCase() === paymentMode.toLowerCase()
        );
      }
      return dateMatch;
    });
    setFilteredOrders(filtered);
    setCurrentPage(1); // Reset to first page
  };

  const handleCustomDateFilter = () => {
    if (dateFrom && dateTo) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      applyFilter(from, to);
    }
  };

  const resetFilter = () => {
    setDateFrom("");
    setDateTo("");
    setPaymentMode("");
    setPresetRange("");
    setFilteredOrders(data?.recentOrders || []);
    setCurrentPage(1);
  };

  const handlePaymentModeChange = (e) => {
    const mode = e.target.value;
    setPaymentMode(mode);

    // Apply payment mode filter to existing filtered orders
    if (!mode) {
      // If no payment mode selected, reapply date filter only
      if (presetRange && presetRange !== "custom") {
        const dates = getDateRange(presetRange);
        if (dates) {
          applyFilter(dates.from, dates.to);
        }
      } else if (dateFrom && dateTo) {
        const from = new Date(dateFrom);
        from.setHours(0, 0, 0, 0);
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        applyFilter(from, to);
      }
      return;
    }

    // Apply combined filter
    if (data) {
      let filtered = data.recentOrders;

      // Apply date filter if exists
      if (presetRange && presetRange !== "custom") {
        const dates = getDateRange(presetRange);
        if (dates) {
          filtered = filtered.filter((order) => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= dates.from && orderDate <= dates.to;
          });
        }
      } else if (dateFrom && dateTo) {
        const from = new Date(dateFrom);
        from.setHours(0, 0, 0, 0);
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        filtered = filtered.filter((order) => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= from && orderDate <= to;
        });
      }

      // Apply payment mode filter
      const finalFiltered = filtered.filter(
        (order) =>
          order.paymentMethod &&
          order.paymentMethod.toLowerCase() === mode.toLowerCase()
      );
      setFilteredOrders(finalFiltered);
      setCurrentPage(1);
    }
  };

  // Calculate payment breakdown
  const getPaymentBreakdown = () => {
    const breakdown = {
      CASH: 0,
      UPI: 0,
      CARD: 0,
    };

    filteredOrders.forEach((order) => {
      const mode = order.paymentMethod?.toUpperCase();
      if (mode && breakdown.hasOwnProperty(mode)) {
        breakdown[mode] += order.grandTotal || 0;
      }
    });

    return breakdown;
  };

  const paymentBreakdown = getPaymentBreakdown();

  // Calculate revenue metrics
  const calculateRevenue = () => {
    if (!filteredOrders.length) return { total: 0, average: 0, count: 0 };

    const total = filteredOrders.reduce(
      (sum, order) => sum + order.grandTotal,
      0
    );
    const daysDiff =
      dateFrom && dateTo
        ? Math.max(
            1,
            Math.ceil(
              (new Date(dateTo) - new Date(dateFrom)) / (1000 * 60 * 60 * 24)
            )
          )
        : 1;
    const average = total / daysDiff;

    return {
      total,
      average,
      count: filteredOrders.length,
    };
  };

  const revenue = calculateRevenue();

  // Top employee by revenue
  const getTopEmployee = () => {
    if (!filteredOrders.length) return null;
    const revenueByUser = filteredOrders.reduce((acc, order) => {
      const user = order.username || "Unknown";
      acc[user] = (acc[user] || 0) + (order.grandTotal || 0);
      return acc;
    }, {});
    const [topUser, topRevenue] =
      Object.entries(revenueByUser).sort((a, b) => b[1] - a[1])[0] || [];
    if (!topUser) return null;
    return { username: topUser, revenue: topRevenue };
  };

  // Top product by number of orders (if item data exists)
  const getTopProduct = () => {
    if (!filteredOrders.length) return null;
    let productToOrderCount = {};
    let productToRevenue = {};

    for (const order of filteredOrders) {
      const items = order.items || order.orderItems || order.cartItems || [];
      if (!Array.isArray(items) || items.length === 0) continue;
      // Count product occurrence once per order
      const seenInThisOrder = new Set();
      for (const it of items) {
        const name = it.name || it.itemName || it.productName || it.title;
        if (!name) continue;
        if (!seenInThisOrder.has(name)) {
          productToOrderCount[name] = (productToOrderCount[name] || 0) + 1;
          seenInThisOrder.add(name);
        }
        const price =
          it.total ??
          (it.price != null && it.quantity != null
            ? it.price * it.quantity
            : null) ??
          it.amount;
        if (price != null && !Number.isNaN(price)) {
          productToRevenue[name] = (productToRevenue[name] || 0) + price;
        }
      }
    }

    const entries = Object.entries(productToOrderCount);
    if (!entries.length) return null;
    const [topName] = entries.sort((a, b) => b[1] - a[1])[0];
    return {
      productName: topName,
      orders: productToOrderCount[topName] || 0,
      revenue: productToRevenue[topName] || 0,
    };
  };

  const topEmployee = getTopEmployee();
  const topProduct = getTopProduct();

  // Invoice Print Functions
  const handlePrintInvoice = (order) => {
    setSelectedOrder(order);
    setShowInvoice(true);
  };

  const handleCloseInvoice = () => {
    setShowInvoice(false);
    setSelectedOrder(null);
  };

  const handlePrint = () => {
    window.print();
  };

  // Export Functions
  const exportToCSV = () => {
    try {
      const csvRows = [];

      // Header
      csvRows.push("Dashboard Report");
      csvRows.push("Generated on: " + new Date().toLocaleString());
      csvRows.push("");

      // Revenue Summary
      csvRows.push("Revenue Summary");
      csvRows.push(`Total Revenue,₹${revenue.total.toFixed(2)}`);
      csvRows.push(`Average Daily Revenue,₹${revenue.average.toFixed(2)}`);
      csvRows.push(`Total Orders,${revenue.count}`);
      csvRows.push("");

      // Payment Breakdown
      csvRows.push("Payment Breakdown");
      csvRows.push(`Cash,₹${paymentBreakdown.CASH.toFixed(2)}`);
      csvRows.push(`UPI,₹${paymentBreakdown.UPI.toFixed(2)}`);
      csvRows.push(`Card,₹${paymentBreakdown.CARD.toFixed(2)}`);
      csvRows.push("");

      // Top Performers
      if (topProduct) {
        csvRows.push("Top Product");
        csvRows.push(`Product Name,${topProduct.productName}`);
        csvRows.push(`Orders,${topProduct.orders}`);
        csvRows.push(`Revenue,₹${topProduct.revenue.toFixed(2)}`);
        csvRows.push("");
      }

      if (topEmployee) {
        csvRows.push("Top Employee");
        csvRows.push(`Employee Name,${topEmployee.username}`);
        csvRows.push(`Revenue,₹${topEmployee.revenue.toFixed(2)}`);
        csvRows.push("");
      }

      // Orders Table
      csvRows.push("Recent Orders");
      csvRows.push(
        "Order ID,Employee,Customer,Amount,Payment Method,Status,Date/Time"
      );

      filteredOrders.forEach((order) => {
        const row = [
          order.orderId,
          order.username,
          order.customerName,
          `₹${order.grandTotal.toFixed(2)}`,
          order.paymentMethod,
          order.paymentDetails.status,
          new Date(order.createdAt).toLocaleString(),
        ].join(",");
        csvRows.push(row);
      });

      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `dashboard_report_${
        new Date().toISOString().split("T")[0]
      }.csv`;
      link.click();

      toast.success("CSV report exported successfully!");
    } catch (error) {
      console.error("CSV Export Error:", error);
      toast.error("Failed to export CSV report");
    }
  };

  const exportToPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Title
      doc.setFontSize(20);
      doc.setTextColor(0, 33, 66); // #002142
      doc.text("Dashboard Report", pageWidth / 2, 20, { align: "center" });

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(
        "Generated on: " + new Date().toLocaleString(),
        pageWidth / 2,
        28,
        { align: "center" }
      );

      let yPos = 40;

      // Revenue Summary
      doc.setFontSize(14);
      doc.setTextColor(230, 64, 81); // #e64051
      doc.text("Revenue Summary", 14, yPos);
      yPos += 8;

      autoTable(doc, {
        startY: yPos,
        head: [["Metric", "Value"]],
        body: [
          ["Total Revenue", `Rs.${revenue.total.toFixed(2)}`],
          ["Average Daily Revenue", `Rs.${revenue.average.toFixed(2)}`],
          ["Total Orders", revenue.count.toString()],
        ],
        theme: "grid",
        headStyles: { fillColor: [0, 33, 66], textColor: 255 },
        margin: { left: 14, right: 14 },
      });

      yPos = doc.lastAutoTable.finalY + 10;

      // Payment Breakdown
      doc.setFontSize(14);
      doc.setTextColor(230, 64, 81);
      doc.text("Payment Breakdown", 14, yPos);
      yPos += 8;

      autoTable(doc, {
        startY: yPos,
        head: [["Payment Mode", "Amount"]],
        body: [
          ["Cash", `Rs.${paymentBreakdown.CASH.toFixed(2)}`],
          ["UPI", `Rs.${paymentBreakdown.UPI.toFixed(2)}`],
          ["Card", `Rs.${paymentBreakdown.CARD.toFixed(2)}`],
        ],
        theme: "grid",
        headStyles: { fillColor: [0, 33, 66], textColor: 255 },
        margin: { left: 14, right: 14 },
      });

      yPos = doc.lastAutoTable.finalY + 10;

      // Top Performers
      if (topProduct || topEmployee) {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(14);
        doc.setTextColor(230, 64, 81);
        doc.text("Top Performers", 14, yPos);
        yPos += 8;

        const performersData = [];
        if (topProduct) {
          performersData.push(["Top Product", topProduct.productName]);
          performersData.push(["Product Orders", topProduct.orders.toString()]);
          performersData.push([
            "Product Revenue",
            `Rs.${topProduct.revenue.toFixed(2)}`,
          ]);
        }
        if (topEmployee) {
          performersData.push(["Top Employee", topEmployee.username]);
          performersData.push([
            "Employee Revenue",
            `Rs.${topEmployee.revenue.toFixed(2)}`,
          ]);
        }

        autoTable(doc, {
          startY: yPos,
          head: [["Category", "Value"]],
          body: performersData,
          theme: "grid",
          headStyles: { fillColor: [0, 33, 66], textColor: 255 },
          margin: { left: 14, right: 14 },
        });

        yPos = doc.lastAutoTable.finalY + 10;
      }

      // Orders Table
      if (yPos > 220) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(230, 64, 81);
      doc.text("Recent Orders", 14, yPos);
      yPos += 8;

      const ordersData = filteredOrders.map((order) => [
        order.orderId.substring(0, 8) + "...",
        order.username,
        order.customerName,
        `Rs.${order.grandTotal.toFixed(2)}`,
        order.paymentMethod,
        order.paymentDetails.status,
        new Date(order.createdAt).toLocaleDateString(),
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [
          [
            "Order ID",
            "Employee",
            "Customer",
            "Amount",
            "Payment",
            "Status",
            "Date",
          ],
        ],
        body: ordersData,
        theme: "grid",
        headStyles: { fillColor: [0, 33, 66], textColor: 255, fontSize: 8 },
        bodyStyles: { fontSize: 7 },
        margin: { left: 14, right: 14 },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 25 },
          2: { cellWidth: 25 },
          3: { cellWidth: 22 },
          4: { cellWidth: 20 },
          5: { cellWidth: 20 },
          6: { cellWidth: 22 },
        },
      });

      doc.save(
        `dashboard_report_${new Date().toISOString().split("T")[0]}.pdf`
      );
      toast.success("PDF report exported successfully!");
    } catch (error) {
      console.error("PDF Export Error:", error);
      console.error("Error details:", error.message, error.stack);
      toast.error(`Failed to export PDF: ${error.message || "Unknown error"}`);
    }
  };

  const exportToDOC = async () => {
    try {
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              // Title
              new Paragraph({
                text: "Dashboard Report",
                heading: "Heading1",
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 },
              }),
              new Paragraph({
                text: `Generated on: ${new Date().toLocaleString()}`,
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 },
              }),

              // Revenue Summary Section
              new Paragraph({
                text: "Revenue Summary",
                heading: "Heading2",
                spacing: { before: 200, after: 200 },
              }),
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({ text: "Metric", bold: true }),
                        ],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({ text: "Value", bold: true }),
                        ],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph("Total Revenue")],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph(`₹${revenue.total.toFixed(2)}`),
                        ],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph("Average Daily Revenue")],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph(`₹${revenue.average.toFixed(2)}`),
                        ],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [new Paragraph("Total Orders")],
                      }),
                      new TableCell({
                        children: [new Paragraph(revenue.count.toString())],
                      }),
                    ],
                  }),
                ],
              }),

              // Payment Breakdown Section
              new Paragraph({
                text: "Payment Breakdown",
                heading: "Heading2",
                spacing: { before: 400, after: 200 },
              }),
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({ text: "Payment Mode", bold: true }),
                        ],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({ text: "Amount", bold: true }),
                        ],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph("Cash")] }),
                      new TableCell({
                        children: [
                          new Paragraph(`₹${paymentBreakdown.CASH.toFixed(2)}`),
                        ],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph("UPI")] }),
                      new TableCell({
                        children: [
                          new Paragraph(`₹${paymentBreakdown.UPI.toFixed(2)}`),
                        ],
                      }),
                    ],
                  }),
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph("Card")] }),
                      new TableCell({
                        children: [
                          new Paragraph(`₹${paymentBreakdown.CARD.toFixed(2)}`),
                        ],
                      }),
                    ],
                  }),
                ],
              }),

              // Top Performers Section
              ...(topProduct || topEmployee
                ? [
                    new Paragraph({
                      text: "Top Performers",
                      heading: "Heading2",
                      spacing: { before: 400, after: 200 },
                    }),
                    ...(topProduct
                      ? [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: "Top Product: ",
                                bold: true,
                              }),
                              new TextRun(topProduct.productName),
                            ],
                          }),
                          new Paragraph({
                            children: [
                              new TextRun({ text: "Orders: ", bold: true }),
                              new TextRun(topProduct.orders.toString()),
                            ],
                          }),
                          new Paragraph({
                            children: [
                              new TextRun({ text: "Revenue: ", bold: true }),
                              new TextRun(`₹${topProduct.revenue.toFixed(2)}`),
                            ],
                            spacing: { after: 200 },
                          }),
                        ]
                      : []),
                    ...(topEmployee
                      ? [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: "Top Employee: ",
                                bold: true,
                              }),
                              new TextRun(topEmployee.username),
                            ],
                          }),
                          new Paragraph({
                            children: [
                              new TextRun({ text: "Revenue: ", bold: true }),
                              new TextRun(`₹${topEmployee.revenue.toFixed(2)}`),
                            ],
                          }),
                        ]
                      : []),
                  ]
                : []),

              // Orders Table Section
              new Paragraph({
                text: "Recent Orders",
                heading: "Heading2",
                spacing: { before: 400, after: 200 },
              }),
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        children: [
                          new Paragraph({ text: "Order ID", bold: true }),
                        ],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({ text: "Employee", bold: true }),
                        ],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({ text: "Customer", bold: true }),
                        ],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({ text: "Amount", bold: true }),
                        ],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({ text: "Payment", bold: true }),
                        ],
                      }),
                      new TableCell({
                        children: [
                          new Paragraph({ text: "Status", bold: true }),
                        ],
                      }),
                      new TableCell({
                        children: [new Paragraph({ text: "Date", bold: true })],
                      }),
                    ],
                  }),
                  ...filteredOrders.map(
                    (order) =>
                      new TableRow({
                        children: [
                          new TableCell({
                            children: [
                              new Paragraph(
                                order.orderId.substring(0, 8) + "..."
                              ),
                            ],
                          }),
                          new TableCell({
                            children: [new Paragraph(order.username)],
                          }),
                          new TableCell({
                            children: [new Paragraph(order.customerName)],
                          }),
                          new TableCell({
                            children: [
                              new Paragraph(`₹${order.grandTotal.toFixed(2)}`),
                            ],
                          }),
                          new TableCell({
                            children: [new Paragraph(order.paymentMethod)],
                          }),
                          new TableCell({
                            children: [
                              new Paragraph(order.paymentDetails.status),
                            ],
                          }),
                          new TableCell({
                            children: [
                              new Paragraph(
                                new Date(order.createdAt).toLocaleDateString()
                              ),
                            ],
                          }),
                        ],
                      })
                  ),
                ],
              }),
            ],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(
        blob,
        `dashboard_report_${new Date().toISOString().split("T")[0]}.docx`
      );
      toast.success("DOC report exported successfully!");
    } catch (error) {
      console.error("DOC Export Error:", error);
      toast.error("Failed to export DOC report");
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (!data) {
    return <div className="error">Failed to load the dashboard data...</div>;
  }

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const goToPrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // Compute sliding window of up to 3 page numbers
  const getPageNumbers = () => {
    if (totalPages <= 3) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    let start = Math.max(1, Math.min(currentPage - 1, totalPages - 2));
    let end = Math.min(totalPages, start + 2);
    if (end - start < 2) {
      start = Math.max(1, end - 2);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <i className="bi bi-currency-rupee"></i>
            </div>
            <div className="stat-content">
              <h3>Today's Sales</h3>
              <p>₹{data.todaySales.toFixed(2)}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <i className="bi bi-cart-check"></i>
            </div>
            <div className="stat-content">
              <h3>Today's Orders</h3>
              <p>{data.todayOrderCount}</p>
            </div>
          </div>
        </div>

        <div className="recent-orders-card">
          <div className="header-section">
            <h3 className="recent-orders-title">
              <i className="bi bi-clock-history"></i>
              Recent Orders
            </h3>

            <div className="revenue-display">
              <div className="revenue-item">
                <span className="revenue-label">Total Revenue</span>
                <span className="revenue-value">
                  ₹{revenue.total.toFixed(2)}
                </span>
              </div>
              <div className="revenue-item">
                <span className="revenue-label">Avg Daily</span>
                <span className="revenue-value">
                  ₹{revenue.average.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Export Section */}
          <div className="export-section">
            <div className="export-label">
              <i className="bi bi-download"></i> Export Report
            </div>
            <div className="export-buttons">
              <button onClick={exportToPDF} className="export-btn pdf-btn">
                <i className="bi bi-file-earmark-pdf"></i>
                <span>PDF</span>
              </button>
              <button onClick={exportToDOC} className="export-btn doc-btn">
                <i className="bi bi-file-earmark-word"></i>
                <span>DOC</span>
              </button>
              <button onClick={exportToCSV} className="export-btn csv-btn">
                <i className="bi bi-file-earmark-spreadsheet"></i>
                <span>CSV</span>
              </button>
            </div>
          </div>

          {/* Date Filter Section */}
          <div className="filter-section">
            <div className="filter-label">
              <i className="bi bi-funnel"></i> Filters
            </div>
            <div className="quick-filters">
              <select
                value={presetRange}
                onChange={handlePresetChange}
                className="filter-select"
              >
                <option value="">Preset Ranges</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="custom">Custom Range</option>
              </select>

              <select
                value={paymentMode}
                onChange={handlePaymentModeChange}
                className="filter-select"
              >
                <option value="">All Payment Modes</option>
                <option value="CASH">Cash</option>
                <option value="UPI">UPI</option>
                <option value="CARD">Card</option>
              </select>
            </div>

            <div className="custom-date-filters">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="From Date"
                className="date-input"
                disabled={presetRange !== "custom"}
              />
              <span className="date-separator">-</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="To Date"
                className="date-input"
                disabled={presetRange !== "custom"}
              />
              <button
                onClick={handleCustomDateFilter}
                className="apply-btn"
                disabled={presetRange !== "custom"}
              >
                <i className="bi bi-search"></i> Apply
              </button>
              {(dateFrom || dateTo) && (
                <button onClick={resetFilter} className="reset-btn">
                  <i className="bi bi-x-circle"></i> Reset
                </button>
              )}
            </div>
          </div>

          {/* Analytics: Top Product and Top Employee */}
          
          {/* <div className="analytics-grid">
            {topProduct ? (
              <div className="analytics-card">
                <div className="analytics-title">
                  <i className="bi bi-box-seam"></i> Top Product (by orders)
                </div>
                <div className="analytics-content">
                  <div className="row">
                    <span className="label">Product</span>
                    <span className="value">{topProduct.productName}</span>
                  </div>
                  <div className="row">
                    <span className="label">Orders</span>
                    <span className="value">{topProduct.orders}</span>
                  </div>
                  <div className="row">
                    <span className="label">Revenue</span>
                    <span className="value">
                      ₹{topProduct.revenue.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="analytics-card muted">
                <div className="analytics-title">
                  <i className="bi bi-box-seam"></i> Top Product (by orders)
                </div>
                <div className="analytics-content">
                  <div className="row">
                    <span className="label">
                      Insufficient item data to compute
                    </span>
                  </div>
                </div>
              </div>
            )}

            {topEmployee ? (
              <div className="analytics-card">
                <div className="analytics-title">
                  <i className="bi bi-person-badge"></i> Top Employee by Revenue
                </div>
                <div className="analytics-content">
                  <div className="row">
                    <span className="label">Employee</span>
                    <span className="value">{topEmployee.username}</span>
                  </div>
                  <div className="row">
                    <span className="label">Revenue</span>
                    <span className="value">
                      ₹{topEmployee.revenue.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ) : null}
          </div> */}

          {/* Payment Breakdown Table - Only show when a payment mode is selected */}
          
          {/* {paymentMode && (
            <div className="payment-breakdown-section">
              <h4 className="breakdown-title">
                <i className="bi bi-cash-coin"></i> Payment Received by Mode
              </h4>
              <table className="payment-breakdown-table">
                <thead>
                  <tr>
                    <th>Payment Mode</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <span className="payment-mode-badge cash">
                        <i className="bi bi-cash"></i> Cash
                      </span>
                    </td>
                    <td className="amount">
                      ₹{paymentBreakdown.CASH.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span className="payment-mode-badge upi">
                        <i className="bi bi-phone"></i> UPI
                      </span>
                    </td>
                    <td className="amount">
                      ₹{paymentBreakdown.UPI.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <span className="payment-mode-badge card">
                        <i className="bi bi-credit-card"></i> Card
                      </span>
                    </td>
                    <td className="amount">
                      ₹{paymentBreakdown.CARD.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
           */}

          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order Id</th>
                  <th>Employee name</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Time</th>
                  <th>Invoice</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.length > 0 ? (
                  paginatedOrders.map((order) => (
                    <tr key={order.orderId}>
                      <td>{order.orderId.substring(0, 8)}...</td>
                      <td> {order.username} </td>
                      <td>
                        {order.customerName} <br />
                        <small className="text-muted">
                          {order.phoneNumber}
                        </small>
                      </td>
                      <td>₹{order.grandTotal.toFixed(2)}</td>
                      <td>
                        <span
                          className={`payment-method ${order.paymentMethod.toLowerCase()}`}
                        >
                          {order.paymentMethod}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`status-badge ${order.paymentDetails.status.toLowerCase()}`}
                        >
                          {order.paymentDetails.status}
                        </span>
                      </td>
                      <td>
                        {new Date(order.createdAt).toLocaleDateString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td>
                        <button
                          className="print-invoice-btn"
                          onClick={() => handlePrintInvoice(order)}
                          title="Print Invoice"
                        >
                          <i className="bi bi-printer-fill"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="no-data">
                      No orders found for the selected date range
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination-container">
              <button
                onClick={goToPrevious}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                <i className="bi bi-chevron-left"></i> Previous
              </button>

              <div className="page-numbers">
                {getPageNumbers().map((page) => (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`page-number ${
                      currentPage === page ? "active" : ""
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={goToNext}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Next <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Popup */}
      {showInvoice && selectedOrder && (
        <ReceiptPopup
          orderDetails={selectedOrder}
          onClose={handleCloseInvoice}
          onPrint={handlePrint}
        />
      )}
    </div>
  );
};

export default Dashboard;
