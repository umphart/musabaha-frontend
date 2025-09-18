import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FiUser, FiPrinter, FiDownload, FiX, FiCheck, FiInfo } from "react-icons/fi";
import { getAuthToken } from "../../utils/auth";
import { API_BASE_URL } from "../../config";
import "./payment.css";

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");


  // Helper to parse amount safely
  const parseAmount = (amount) => {
    const parsed = parseFloat(amount);
    return isNaN(parsed) ? 0 : parsed;
  };

  const formatCurrency = (amount) => {
    const safe = parseAmount(amount);
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(safe);
  };

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
        // Extract all payments
        const allPayments = [];
        usersData.forEach(user => {
          if (user.payments && user.payments.length > 0) {
            user.payments.forEach(payment => {
              allPayments.push({
                ...payment,
                amount: parseAmount(payment.amount),
                userId: user.id,
                userName: user.name || `${user.first_name} ${user.last_name}` || `User ${user.id}`,
                userPlot: user.plot_taken || "N/A",
              });
            });
          }
        });
        setPayments(allPayments);
      } else {
        console.error("Error:", data.message || "Fetch error");
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersWithPayments();
  }, []);

  // Build summary of payments per user
  const getUserPaymentSummary = () => {
    const userMap = {};
    payments.forEach(payment => {
      if (!userMap[payment.userId]) {
        userMap[payment.userId] = {
          id: payment.userId,
          userName: payment.userName,
          userPlot: payment.userPlot,
          totalPayments: 0,
          totalAmount: 0,
          payments: [],
        };
      }
      userMap[payment.userId].totalPayments += 1;
      userMap[payment.userId].totalAmount += payment.amount;
      userMap[payment.userId].payments.push(payment);
    });

    let userList = Object.values(userMap);
   if (filter !== "all") {
  userList = userList.filter(user =>
    user.payments.some(p => p.status && p.status.toLowerCase() === filter.toLowerCase())
  );
}

if (searchQuery.trim()) {
  const query = searchQuery.toLowerCase();
  userList = userList.filter(user =>
    user.userName.toLowerCase().includes(query) ||
    user.userPlot.toLowerCase().includes(query)
  );
}

    return userList;
  };

  const userPaymentSummary = getUserPaymentSummary();
  const totalRevenue = payments
    .filter(p => p.status && p.status.toLowerCase() === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingPaymentsCount = payments.filter(
    p => p.status && p.status.toLowerCase() === "pending"
  ).length;

  const downloadAllUserPayments = (user) => {
    const userPayments = payments.filter(p => p.userId === user.id);
    if (userPayments.length === 0) {
      console.info("No payments for this user");
      return;
    }
    const wb = XLSX.utils.book_new();
    const excelData = userPayments.map((payment, idx) => {
      const date = new Date(payment.date);
      return {
        "#": idx + 1,
        "Payment ID": payment.id,
        Date: date.toLocaleDateString("en-NG"),
        Amount: payment.amount,
        Status: payment.status || "",
        "Recorded By": payment.admin || "",
      };
    });
    const ws = XLSX.utils.json_to_sheet(excelData);
    XLSX.utils.book_append_sheet(wb, ws, "Payments");
    XLSX.writeFile(wb, `${user.userName.replace(/\s+/g, "_")}_payments.xlsx`);
  };

  const generateReceipt = async (user, paymentsForUser) => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    doc.setFontSize(16);
    doc.text("Payment Statement", 14, 20);
    doc.setFontSize(10);
    doc.text(`User: ${user.userName}`, 14, 30);
    doc.text(`Plot: ${user.userPlot}`, 14, 36);

    autoTable(doc, {
      head: [["#", "Payment ID", "Date", "Amount", "Status"]],
      body: paymentsForUser.map((p, idx) => [
        idx + 1,
        p.id,
        new Date(p.date).toLocaleDateString("en-NG"),
        formatCurrency(p.amount),
        p.status || "",
      ]),
      startY: 45,
      theme: "striped",
    });

    doc.save(`receipt_${user.userName.replace(/\s+/g, "_")}.pdf`);
  };

  if (loading) {
    return <div className="loading">Loading payments...</div>;
  }

  return (
    <div className="admin-content">
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
  <input
    type="text"
    placeholder="Search by name or plot"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="search-input"
  />
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
            {userPaymentSummary.length > 0 ? (
              userPaymentSummary.map((user, index) => (
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
                        title="Download Excel"
                      />
                      <FiPrinter
                        className="action-icon view"
                        onClick={() => generateReceipt(user, user.payments)}
                        title="Print Statement"
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
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
