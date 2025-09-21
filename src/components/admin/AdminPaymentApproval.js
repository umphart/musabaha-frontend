import React, { useEffect, useState } from "react";
import { FiEye, FiCheck, FiX, FiDownload } from "react-icons/fi";
import { DollarSign, TrendingUp, Users, Clock, Filter } from "lucide-react";
import Swal from "sweetalert2";

const AdminPaymentApproval = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
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
    console.log("Setting up WebSocket connection for real-time notifications...");
    
    setTimeout(() => {
      simulateNewPaymentNotification();
    }, 5000);
  };

  const simulateNewPaymentNotification = () => {
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
    const result = await Swal.fire({
      title: `Are you sure?`,
      text: `Do you want to mark this payment as "${newStatus}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: newStatus === "approved" ? '#10B981' : '#EF4444',
      cancelButtonColor: '#6B7280',
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
        setPayments((prevPayments) =>
          prevPayments.map((payment) =>
            payment.id === paymentId
              ? { ...payment, status: newStatus }
              : payment
          )
        );
        
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
    return (
      <div className="admin-payments-container">
        <div className="loading-spinner">Loading payments...</div>
      </div>
    );
  }

  return (
    <div className="admin-payments-container">
      <div className="page-header">
        <h2>Payment Approval Dashboard</h2>
        <p>Manage and approve user payments</p>
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

      <div className="filter-section">
        <div className="filter-header">
          <Filter size={18} />
          <span>Filter Payments</span>
        </div>
        <div className="filter-controls">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Payments</option>
            <option value="pending">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <span className="results-count">
            {filteredPayments.length} payment{filteredPayments.length !== 1 ? 's' : ''} found
          </span>
        </div>
      </div>

      {filteredPayments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💸</div>
          <h3>No payments found</h3>
          <p>There are no payments matching your current filter criteria.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="payments-table">
            <thead>
              <tr>
                <th>#</th>
                <th>User Name</th>
                <th>Contact</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Reference</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((p, idx) => (
                <tr key={p.id} className={p.status}>
                  <td className="index-cell">{idx + 1}</td>
                  <td className="user-cell">
                    <div className="user-info">
                      <span className="user-name">{p.user_name || "N/A"}</span>
                      {p.note && <span className="user-note">{p.note}</span>}
                    </div>
                  </td>
                  <td>{p.user_contact || "N/A"}</td>
                  <td className="amount-cell">{formatCurrency(p.amount)}</td>
                  <td>{p.payment_method || "N/A"}</td>
                  <td className="reference-cell">{p.transaction_reference || "N/A"}</td>
                  <td>{new Date(p.created_at).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge ${p.status}`}>
                      {p.status || "pending"}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {p.receipt_file && (
                        <a
                          href={`https://musabaha-home-ltd.onrender.com/uploads/receipts/${p.receipt_file}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-action btn-view"
                          title="View Receipt"
                        >
                          <FiEye />
                        </a>
                      )}
                      {p.status === "pending" ? (
                        <>
                          <button
                            className="btn-action btn-approve"
                            onClick={() => handleStatusUpdate(p.id, "approved")}
                            title="Approve Payment"
                          >
                            <FiCheck />
                          </button>
                          <button
                            className="btn-action btn-reject"
                            onClick={() => handleStatusUpdate(p.id, "rejected")}
                            title="Reject Payment"
                          >
                            <FiX />
                          </button>
                        </>
                      ) : (
                        <span className="action-complete">
                          Processed
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style jsx>{`
        .admin-payments-container {
          padding: 24px;
          max-width: 100%;
          overflow-x: auto;
        }

        .page-header {
          margin-bottom: 32px;
        }

        .page-header h2 {
          font-size: 28px;
          font-weight: 700;
          color: #1F2937;
          margin: 0 0 8px 0;
        }

        .page-header p {
          color: #6B7280;
          margin: 0;
          font-size: 16px;
        }

        .loading-spinner {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 200px;
          font-size: 18px;
          color: #6B7280;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          display: flex;
          align-items: center;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
        }

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;
          color: white;
        }

        .stat-icon.total-deposits {
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
        }

        .stat-icon.pending-payments {
          background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
        }

        .stat-icon.approved-payments {
          background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
        }

        .stat-icon.total-users {
          background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
        }

        .stat-content h3 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          color: #1F2937;
        }

        .stat-content p {
          margin: 4px 0 0;
          color: #6B7280;
          font-size: 14px;
          font-weight: 500;
        }

        /* Filter Section */
        .filter-section {
          background: white;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .filter-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
          color: #374151;
          font-weight: 600;
        }

        .filter-controls {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .filter-select {
          padding: 10px 16px;
          border: 2px solid #E5E7EB;
          border-radius: 8px;
          background-color: white;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          cursor: pointer;
          transition: border-color 0.2s;
        }

        .filter-select:focus {
          outline: none;
          border-color: #3B82F6;
        }

        .results-count {
          color: #6B7280;
          font-size: 14px;
          font-weight: 500;
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .empty-state h3 {
          font-size: 20px;
          color: #374151;
          margin: 0 0 8px 0;
        }

        .empty-state p {
          color: #6B7280;
          margin: 0;
        }

        /* Table Container */
        .table-container {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        /* Table */
        .payments-table {
          width: 100%;
          border-collapse: collapse;
          background-color: white;
        }

        .payments-table th {
          background-color: #F9FAFB;
          padding: 16px 20px;
          text-align: left;
          font-weight: 600;
          color: #374151;
          border-bottom: 2px solid #E5E7EB;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .payments-table td {
          padding: 16px 20px;
          border-bottom: 1px solid #F3F4F6;
          color: #374151;
        }

        .payments-table tr:hover {
          background-color: #F9FAFB;
        }

        .payments-table tr:last-child td {
          border-bottom: none;
        }

        /* Specific cell styles */
        .index-cell {
          font-weight: 500;
          color: #6B7280;
          text-align: center;
        }

        .user-cell .user-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .user-cell .user-name {
          font-weight: 500;
          color: #1F2937;
        }

        .user-cell .user-note {
          font-size: 12px;
          color: #6B7280;
          font-style: italic;
        }

        .amount-cell {
          font-weight: 600;
          color: #059669;
        }

        .reference-cell {
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 13px;
          color: #6B7280;
        }

        /* Status badges */
        .status-badge {
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: inline-block;
        }

        .status-badge.pending {
          background-color: #FFFBEB;
          color: #D97706;
          border: 1px solid #FCD34D;
        }

        .status-badge.approved {
          background-color: #ECFDF5;
          color: #059669;
          border: 1px solid #34D399;
        }

        .status-badge.rejected {
          background-color: #FEF2F2;
          color: #DC2626;
          border: 1px solid #FCA5A5;
        }

        /* Action buttons */
        .action-buttons {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .btn-action {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.2s;
          text-decoration: none;
        }

        .btn-view {
          background-color: #EFF6FF;
          color: #3B82F6;
        }

        .btn-view:hover {
          background-color: #DBEAFE;
          transform: translateY(-1px);
        }

        .btn-approve {
          background-color: #ECFDF5;
          color: #059669;
        }

        .btn-approve:hover {
          background-color: #D1FAE5;
          transform: translateY(-1px);
        }

        .btn-reject {
          background-color: #FEF2F2;
          color: #DC2626;
        }

        .btn-reject:hover {
          background-color: #FEE2E2;
          transform: translateY(-1px);
        }

        .action-complete {
          font-size: 12px;
          color: #6B7280;
          font-style: italic;
          padding: 6px 12px;
          background-color: #F3F4F6;
          border-radius: 6px;
        }

        /* Responsive design */
        @media (max-width: 1024px) {
          .admin-payments-container {
            padding: 16px;
          }
          
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .payments-table {
            min-width: 1000px;
          }
          
          .table-container {
            overflow-x: auto;
          }
        }

        @media (max-width: 640px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .filter-controls {
            flex-direction: column;
            align-items: stretch;
          }
          
          .filter-select {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminPaymentApproval;