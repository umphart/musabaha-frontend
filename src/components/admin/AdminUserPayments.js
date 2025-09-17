import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { DollarSign, TrendingUp, Users, Clock } from "lucide-react";
import { FiCheck, FiEye, FiX } from "react-icons/fi";

const AdminUserPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDeposited: 0,
    pendingPayments: 0,
    approvedPayments: 0,
    totalUsers: 0
  });

  useEffect(() => {
    fetchPayments();
    setupWebSocket();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await fetch("https://musabaha-home-ltd.onrender.com/api/user-payments");
      const result = await response.json();

      console.log("API result:", result);

      if (result.success && Array.isArray(result.payments)) {
        setPayments(result.payments);
        calculateStats(result.payments);
      } else {
        setPayments([]);
      }
    } catch (err) {
      console.error("Error fetching payments:", err);
      setPayments([]);
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
      title: 'New Payment Received!',
      text: 'A user has made a new payment. Check the payments list for details.',
      icon: 'info',
      confirmButtonText: 'View Payments',
      toast: true,
      position: 'top-end',
      timer: 5000,
      showConfirmButton: true
    });
    
    // Refresh the payments list to include the new payment
    fetchPayments();
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
      } else if (payment.contact) {
        // Use contact as a fallback user identifier
        uniqueUsers.add(payment.contact);
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

  const handlePaymentAction = async (paymentId, action) => {
    try {
      // Map frontend actions to backend status values
      const statusMap = {
        approve: "approved",
        reject: "rejected",
        pending: "pending"
      };
      
      const backendStatus = statusMap[action] || action;
      
      const response = await fetch(
        `https://musabaha-home-ltd.onrender.com/api/user-payments/${paymentId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: backendStatus }),
        }
      );

      console.log(`Response for ${action}:`, response);

      const result = await response.json();

      if (result.success) {
        Swal.fire("Success!", `Payment ${action}d successfully!`, "success");
        // Refresh data to get updated stats
        fetchPayments();
      } else {
        Swal.fire("Error!", result.error || `Failed to ${action} payment`, "error");
      }
    } catch (err) {
      console.error(`Error updating payment (${action}):`, err);
      Swal.fire("Error!", `Error trying to ${action} payment.`, "error");
    }
  };

  if (loading) return <div className="loading">Loading payments...</div>;

  return (
    <div className="admin-content">
      <div className="content-header">
        <h2>User Payments</h2>
      </div>

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

      {payments.length === 0 ? (
        <div className="alert error">No payments found.</div>
      ) : (
        <div className="content-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Plots</th>
                <th>Plot Size</th>
                <th>Amount Paid</th>
                <th>Total Price</th>
                <th>Outstanding</th>
                <th>Method</th>
                <th>Reference</th>
                <th>Date</th>
                <th>Status</th>
                <th>Receipt</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.contact}</td>
                  <td>{p.number_of_plots}</td>
                  <td>{p.plot_size}</td>
                  <td>{formatCurrency(p.amount)}</td>
                  <td>{formatCurrency(p.total_price)}</td>
                  <td>{formatCurrency(p.outstanding_balance)}</td>
                  <td>{p.payment_method}</td>
                  <td>{p.transaction_reference}</td>
                  <td>{new Date(p.transaction_date).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge ${p.status}`}>
                      {p.status}
                    </span>
                  </td>
                  <td>
                    {p.receipt_file ? (
                      <a
                        href={`https://musabaha-home-ltd.onrender.com/uploads/receipts/${p.receipt_file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="View Receipt"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FiEye size={18} />
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>

                  <td className="flex gap-2">
                    {p.status === "pending" && (
                      <>
                        <button
                          className="text-green-600 hover:text-green-800"
                          onClick={() => handlePaymentAction(p.id, "approved")}
                          title="Approve"
                        >
                          <FiCheck size={16} />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-800"
                          onClick={() => handlePaymentAction(p.id, "reject")}
                          title="Reject"
                        >
                          <FiX size={16} />
                        </button>
                      </>
                    )}
                    {p.status !== "pending" && (
                      <span className="action-complete">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUserPayments;