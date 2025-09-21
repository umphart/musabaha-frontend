import React, { useEffect, useState } from "react";
import "./AdminPaymentApproval.css";
import { FiEye, FiCheck, FiX } from "react-icons/fi";
import { DollarSign, TrendingUp, Users, Clock } from "lucide-react";
import Swal from "sweetalert2";

const AdminPaymentApproval = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all"); // "all", "pending", "approved", "rejected"
  const [stats, setStats] = useState({
    totalDeposited: 0,
    pendingPayments: 0,
    approvedPayments: 0,
    totalUsers: 0
  });

  useEffect(() => {
    fetchAllPayments();
    setupWebSocket();
  }, []);

  const fetchAllPayments = async () => {
    try {
      const res = await fetch("https://musabaha-home-ltd.onrender.com/api/user-subsequent-payments");
      const data = await res.json();
      console.log("All payments data:", data);
      if (data.success) {
        setPayments(data.payments);
        calculateStats(data.payments);
      } else {
        console.error("Failed to fetch payments:", data.error);
      }
    } catch (err) {
      console.error("Error fetching payments:", err);
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocket = () => {
    // In a real app, you'd connect to your WebSocket server
    // This is a simulation of receiving new payment notifications
    console.log("Setting up WebSocket connection for real-time notifications...");
    
    // Simulate receiving a new payment notification after 5 seconds
    setTimeout(() => {
      // This would come from your WebSocket in a real implementation
      simulateNewPaymentNotification();
    }, 5000);
  };

  const simulateNewPaymentNotification = () => {
    // Simulate a new payment being made
    Swal.fire({
      title: 'New Subsequent Payment Received!',
      text: 'A user has made a new subsequent payment. Check the payments list for details.',
      icon: 'info',
      confirmButtonText: 'View Payments',
      toast: true,
      position: 'top-end',
      timer: 5000,
      showConfirmButton: true
    });
    
    // Refresh the payments list to include the new payment
    fetchAllPayments();
  };

  const calculateStats = (paymentsData) => {
    let totalDeposited = 0;
    let pendingPayments = 0;
    let approvedPayments = 0;
    const uniqueUsers = new Set();

    paymentsData.forEach(payment => {
      if (payment.status === "approved") {
        totalDeposited += Number(payment.amount) || 0;
        approvedPayments++;
      } else if (payment.status === "pending") {
        pendingPayments++;
      }
      
      if (payment.user_id) {
        uniqueUsers.add(payment.user_id);
      } else if (payment.user_contact) {
        // Use contact as a fallback user identifier
        uniqueUsers.add(payment.user_contact);
      }
    });

    setStats({
      totalDeposited,
      pendingPayments,
      approvedPayments,
      totalUsers: uniqueUsers.size
    });
  };

  const formatCurrency = (value) => {
    if (!value || isNaN(value)) return "₦0";
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(Number(value));
  };

  const handleStatusUpdate = async (paymentId, newStatus) => {
    // Show confirmation popup before updating
    const result = await Swal.fire({
      title: `Are you sure?`,
      text: `Do you want to mark this payment as "${newStatus}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: `Yes, ${newStatus}!`,
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(
        `https://musabaha-home-ltd.onrender.com/api/user-subsequent-payments/${paymentId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await res.json();
      console.log(data)
      if (data.success) {
        // Update the local state to reflect the change
        setPayments((prevPayments) =>
          prevPayments.map((payment) =>
            payment.id === paymentId
              ? { ...payment, status: newStatus }
              : payment
          )
        );
        
        // Recalculate stats after status change
        fetchAllPayments();
        
        Swal.fire({
          icon: "success",
          title: "Success",
          text: `Payment status updated to ${newStatus}`,
          showConfirmButton: false,
          timer: 2000,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to update payment status",
        });
      }
    } catch (err) {
      console.error("Error updating payment status:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error updating payment status",
      });
    }
  };

  const filteredPayments =
    filterStatus === "all"
      ? payments
      : payments.filter((p) => p.status === filterStatus);

  if (loading) {
    return <p>Loading payments...</p>;
  }

  return (
    <div className="admin-payments-container">
      <h2>Admin Payment Approval</h2>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total-deposits">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <h3>{formatCurrency(stats.totalDeposited)}</h3>
            <p>Total Deposited</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon pending-payments">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.pendingPayments}</h3>
            <p>Pending Payments</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon approved-payments">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.approvedPayments}</h3>
            <p>Approved Payments</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon total-users">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.totalUsers}</h3>
            <p>Total Users</p>
          </div>
        </div>
      </div>

      <div className="filter-controls">
        <label>
          Filter by status:
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </label>
      </div>

      {filteredPayments.length === 0 ? (
        <p>No payments found.</p>
      ) : (
        <table className="payments-table">
          <thead>
            <tr>
              <th>#</th>
              <th>User Name</th>
              <th>Contact</th>
              <th>Amount (₦)</th>
              <th>Method</th>
              <th>Reference</th>
              <th>Note</th>
              <th>Date</th>
              <th>Outstanding</th>
              <th>Receipt</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map((p, idx) => (
              <tr key={p.id}>
                <td>{idx + 1}</td>
                <td>{p.user_name || "N/A"}</td>
                <td>{p.user_contact || "N/A"}</td>
                <td>{Number(p.amount).toLocaleString()}</td>
                <td>{p.payment_method || "N/A"}</td>
                <td>{p.transaction_reference || "N/A"}</td>
                <td>{p.note || p.notes || "-"}</td>
                <td>{new Date(p.created_at).toLocaleDateString()}</td>
                <td>{p.outstanding_balance}</td>
                <td>
                  {p.receipt_file ? (
                    <a
                      href={`https://musabaha-home-ltd.onrender.com/uploads/receipts/${p.receipt_file}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-receipt"
                      title="View Receipt"
                    >
                      <FiEye />
                    </a>
                  ) : (
                    <span className="no-receipt">No Receipt</span>
                  )}
                </td>
                <td>
                  <span className={`status-badge ${p.status}`}>
                    {p.status || "pending"}
                  </span>
                </td>
                <td>
                  {p.status === "pending" && (
                    <div className="action-buttons">
                      <button
                        className="btn-approve"
                        onClick={() => handleStatusUpdate(p.id, "approved")}
                        title="Approve"
                      >
                        <FiCheck />
                      </button>
                      <button
                        className="btn-reject"
                        onClick={() => handleStatusUpdate(p.id, "rejected")}
                        title="Reject"
                      >
                        <FiX />
                      </button>
                    </div>
                  )}
                  {p.status !== "pending" && (
                    <span className="action-complete">Processed</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminPaymentApproval;