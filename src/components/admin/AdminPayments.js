import React, { useState, useEffect } from "react"; 
import * as XLSX from 'xlsx';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getAuthToken } from "../../utils/auth";
import { API_BASE_URL } from "../../config";
import { FiUser, FiPrinter, FiDownload, FiX, FiCheck, FiAlertCircle, FiInfo } from "react-icons/fi";
import "./payment.css";

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [alert, setAlert] = useState({ type: "", message: "", visible: false });

  // Show alerts
  const showAlert = (type, message) => {
    setAlert({ type, message, visible: true });
    setTimeout(() => {
      setAlert({ type: "", message: "", visible: false });
    }, 4000);
  };

  // Helper function to safely parse amounts
  const parseAmount = (amount) => {
    if (amount === null || amount === undefined) return 0;
    const parsed = parseFloat(amount);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Fetch all users with their payments
  const fetchUsersWithPayments = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch users");

      const data = await response.json();
      
      if (data.success) {
        const usersData = data.data || data;
        setUsers(usersData);
        
        // Extract all payments from users
        const allPayments = [];
        usersData.forEach(user => {
          if (user.payments && user.payments.length > 0) {
            user.payments.forEach(payment => {
              // Ensure amount is properly parsed
              const safeAmount = parseAmount(payment.amount);
              
              allPayments.push({
                ...payment,
                amount: safeAmount,
                userId: user.id,
                userName: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 
                          user.name || 
                          user.username || 
                          `User ${user.id}`,
                userContact: user.phone || user.contact || user.email || '', // Store contact for PDF/Excel
                userPlot: user.plot_taken || 'N/A'
              });
            });
          }
        });
        
        setPayments(allPayments);
        showAlert("success", "Payment data loaded successfully.");
      } else {
        showAlert("error", data.message || "Failed to fetch payment data");
      }
    } catch (error) {
      console.error("Error fetching payment data:", error);
      showAlert("error", "Failed to fetch payment data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersWithPayments();
  }, []);

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date)) return "Invalid Date";

      return {
        date: date.toLocaleDateString("en-NG", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        time: date.toLocaleTimeString("en-NG", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      };
    } catch {
      return { date: "Invalid Date", time: "Invalid Time" };
    }
  };

  const formatCurrency = (amount) => {
    const safeAmount = parseAmount(amount);
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(safeAmount);
  };

  const convertAmountToWords = (amount) => {
    const num = parseAmount(amount);
    if (num === 0) return 'Zero Naira';
    
    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', 'Ten', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    const convertLessThanThousand = (n) => {
      if (n === 0) return '';
      let words = '';
      
      // Hundreds
      if (n >= 100) {
        words += units[Math.floor(n / 100)] + ' Hundred ';
        n %= 100;
      }
      
      // Tens and units
      if (n > 0) {
        if (n < 10) {
          words += units[n];
        } else if (n < 20) {
          words += teens[n - 10];
        } else {
          words += tens[Math.floor(n / 10)];
          if (n % 10 > 0) {
            words += ' ' + units[n % 10];
          }
        }
      }
      
      return words;
    };
    
    let words = '';
    let n = Math.floor(num);
    
    // Millions
    if (n >= 1000000) {
      words += convertLessThanThousand(Math.floor(n / 1000000)) + ' Million ';
      n %= 1000000;
    }
    
    // Thousands
    if (n >= 1000) {
      words += convertLessThanThousand(Math.floor(n / 1000)) + ' Thousand ';
      n %= 1000;
    }
    
    // Remainder
    if (n > 0) {
      words += convertLessThanThousand(n);
    }
    
    // Kobo (if needed)
    const kobo = Math.round((num - Math.floor(num)) * 100);
    if (kobo > 0) {
      words += ' Naira and ' + convertLessThanThousand(kobo) + ' Kobo';
    } else {
      words += ' Naira';
    }
    
    return words + ' Only';
  };

  const generateReceipt = async (user, payments) => {
    showAlert("info", "Generating PDF receipt...");

    try {
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [148.5, 210]
      });

      // Helper: load image as base64
      const loadImageAsBase64 = async (path) => {
        try {
          const res = await fetch(path);
          const blob = await res.blob();
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
        } catch (error) {
          console.error("Error loading image:", error);
          return null;
        }
      };

      // Load logo and background
      const logo = await loadImageAsBase64("/images/MHL.jpg");
      const bg = await loadImageAsBase64("/images/bg.jpg");

      // Background
      if (bg) doc.addImage(bg, "JPEG", 0, 20, 210, 148.5);

      // Logo
      if (logo) doc.addImage(logo, "JPEG", 10, 17, 25, 25);

      // Company Header
      doc.setFontSize(12);
      doc.setFont(undefined, "bold");
      doc.text("MUSABAHA HOMES LTD.", 40, 18);

      doc.setFontSize(9);
      doc.setFont(undefined, "normal");
      doc.text("RC NO.: 8176032", 40, 24);
      doc.text("No. 015, City Plaza Along Ring Road Western Bypass", 40, 30);
      doc.text("Along Yankaba Road, Kano State", 40, 34);
      doc.text("TEL: +2349064220705, +2349039108853, +2347038192719", 40, 40);
      doc.text("Email: musabahohomesltd@gmail.com", 40, 44);

      // Title
      doc.setFontSize(22);
      doc.setFont(undefined, "bold");
      doc.text("PAYMENT RECEIPT / STATEMENT", 105, 60, { align: "center" });

      // User Info - Contact is included here for PDF
      doc.setFontSize(10);
      doc.setFont(undefined, "normal");
      doc.text(`Received from: ${user.userName}`, 10, 75);
      doc.text(`Contact: ${user.userContact || "N/A"}`, 10, 82); // Contact in PDF
      doc.text(`Plot(s): ${user.userPlot || "N/A"}`, 10, 89);

      // Payments Table
      const tableData = payments.map((p, i) => [
        i + 1,
        p.id,
        new Date(p.date).toLocaleDateString("en-NG"),
        new Date(p.date).toLocaleTimeString("en-NG"),
        formatCurrency(p.amount),
        p.note || "Payment on account",
        p.admin || p.recorded_by || p.processed_by || "Admin"
      ]);

      autoTable(doc, {
        head: [["#", "Payment ID", "Date", "Time", "Amount", "Note", "Recorded By"]],
        body: tableData,
        startY: 100,
        theme: "striped",
        styles: { fontSize: 8 }
      });

      // Total
      const total = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
      doc.setFontSize(10);
      doc.setFont(undefined, "bold");
      doc.text(
        `TOTAL: ${formatCurrency(total)} (${convertAmountToWords(total)})`,
        10,
        doc.lastAutoTable.finalY + 10
      );

      // Footer
      doc.setFont(undefined, "bold");
      doc.text("Signature:", 150, doc.lastAutoTable.finalY + 20);
      doc.line(170, doc.lastAutoTable.finalY + 20, 200, doc.lastAutoTable.finalY + 20);

      doc.setFontSize(8);
      doc.setFont(undefined, "italic");
      doc.text("For MUSABAHA HOMES LTD.", 170, doc.lastAutoTable.finalY + 25);

      // Save PDF
      doc.save(`receipt_${user.userName.replace(/\s+/g, "_")}.pdf`);

      showAlert("success", "Receipt downloaded successfully.");
    } catch (error) {
      console.error("PDF generation failed:", error);
      showAlert("error", "Failed to generate receipt. Please try again.");
    }
  };

  const downloadAllUserPayments = (user) => {
    const userPayments = payments.filter(p => p.userId === user.id);

    if (userPayments.length === 0) {
      showAlert("info", "No payments found for this user.");
      return;
    }

    showAlert("info", "Preparing Excel file...");

    const wb = XLSX.utils.book_new();

    const excelData = userPayments.map(payment => {
      const { date, time } = formatDateTime(payment.date);
      return {
        "Payment ID": payment.id,
        "Date": date,
        "Time": time,
        "Amount": parseAmount(payment.amount),
        "Status": payment.status,
        "Recorded By": payment.admin || payment.recorded_by || payment.processed_by || "Admin",
        "Note": payment.note || "",
        "Contact": user.userContact || "N/A" // Contact in Excel
      };
    });

    const ws = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(wb, ws, "Payments");

    XLSX.writeFile(wb, `${user.userName.replace(/\s+/g, "_")}_payment_history.xlsx`);

    showAlert("success", "Payment history downloaded successfully.");
  };

  // Get unique users with their payment summaries
  const getUserPaymentSummary = () => {
    const userMap = {};
    
    payments.forEach(payment => {
      if (!userMap[payment.userId]) {
        userMap[payment.userId] = {
          id: payment.userId,
          userName: payment.userName,
          userContact: payment.userContact, // Store contact but not displayed in table
          userPlot: payment.userPlot,
          totalPayments: 0,
          totalAmount: 0,
          payments: []
        };
      }
      
      userMap[payment.userId].totalPayments++;
      userMap[payment.userId].totalAmount += parseAmount(payment.amount);
      userMap[payment.userId].payments.push(payment);
    });
    
    // Apply filter if needed
    let userList = Object.values(userMap);
    
    if (filter !== "all") {
      userList = userList.filter(user => 
        user.payments.some(p => p.status && p.status.toLowerCase() === filter.toLowerCase())
      );
    }
    
    return userList;
  };

  const userPaymentSummary = getUserPaymentSummary();

  const totalRevenue = payments
    .filter((p) => p.status && p.status.toLowerCase() === "completed")
    .reduce((sum, p) => sum + parseAmount(p.amount), 0);

  const pendingPaymentsCount = payments.filter(
    (p) => p.status && p.status.toLowerCase() === "pending"
  ).length;

  if (loading) return <div className="loading">Loading payments...</div>;

  return (
    <div className="admin-content">
      {/* Alert Container */}
      {alert.visible && (
        <div className={`alert alert-${alert.type}`}>
          <div className="alert-content">
            <div className="alert-icon">
              {alert.type === "success" && <FiCheck />}
              {alert.type === "error" && <FiAlertCircle />}
              {alert.type === "info" && <FiInfo />}
            </div>
            <div className="alert-message">{alert.message}</div>
            <button 
              className="alert-close"
              onClick={() => setAlert({ type: "", message: "", visible: false })}
            >
              <FiX />
            </button>
          </div>
        </div>
      )}

      <div className="content-header">
        <h2>Payment Management</h2>

        <div className="header-stats">
          <div className="stat-card">
            <h3>Total Revenue</h3>
            <p className="stat-amount">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="stat-card">
            <h3>Total Payments</h3>
            <p className="stat-amount">{payments.length}</p>
          </div>
          <div className="stat-card">
            <h3>Pending Payments</h3>
            <p className="stat-amount">{pendingPaymentsCount}</p>
          </div>
        </div>

        <div className="header-actions">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Users</option>
            <option value="completed">With Completed Payments</option>
            <option value="pending">With Pending Payments</option>
            <option value="failed">With Failed Payments</option>
          </select>
          <button 
            className="btn btn-primary"
            onClick={fetchUsersWithPayments}
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="content-table">
        <table>
          <thead>
            <tr>
              <th>S.No</th>
              <th>User Name</th>
              <th>Plot</th>
              <th>Total Payments</th>
              <th>Total Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {userPaymentSummary.map((user, index) => (
              <tr key={user.id}>
                <td>{index + 1}</td>
                <td>{user.userName}</td>
                <td>{user.userPlot}</td>
                <td>{user.totalPayments}</td>
                <td>{formatCurrency(user.totalAmount)}</td>
                <td>
                  <div className="action-buttons">
                    <FiDownload
                      className="action-icon download"
                      onClick={() => downloadAllUserPayments(user)}
                      title="Download All Payments"
                    />
                    {user.payments.length > 0 && (
                      <FiPrinter
                        className="action-icon view"
                        onClick={() => generateReceipt(user, user.payments)}
                        title="Print Payment Statement"
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {userPaymentSummary.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  No users with payments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPayments;