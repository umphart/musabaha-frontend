import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import AdminUsers from './AdminUsers';
import AdminPlots from './AdminPlots';
import AdminPayments from './AdminPayments';
import AdminNotifications from './AdminNotifications';
import './adminDashboard.css';
import AdminRegisteredUsers from './AdminRegisteredUsers';
import AdminUserPayments from './AdminUserPayments';
import AdminPaymentApproval from './AdminPaymentApproval';
import { DollarSign, TrendingUp, Users, Clock, Map, CheckCircle, AlertCircle, CreditCard, UserCheck, Bell, Menu, X } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminDashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [adminCreatedUsers, setAdminCreatedUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [subsequentPayments, setSubsequentPayments] = useState([]);
  const [adminCreatedPayments, setAdminCreatedPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [lastNotificationTime, setLastNotificationTime] = useState(null);
  const location = useLocation();

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://musabaha-home-ltd.onrender.com';

  const menuItems = [
    { path: '/admin', name: 'Dashboard', icon: 'fas fa-tachometer-alt' },
    { path: '/admin/users', name: 'Users', icon: 'fas fa-users' },
    { path: '/admin/plots', name: 'Plots', icon: 'fas fa-map-marked' },
    { path: '/admin/payments', name: 'Payments', icon: 'fas fa-money-check' },
    { path: '/admin/registered', name: 'Register', icon: 'fas fa-user-check' },
    { path: '/admin/payment-approval', name: 'Payment Approval', icon: 'fas fa-check-circle' },
    { path: '/admin/user-payment', name: 'Users Payments', icon: 'fas fa-money-check' },
    { path: '/admin/notifications', name: 'Notifications', icon: 'fas fa-bell' },
  ];

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(false);
        setSidebarCollapsed(true); // Collapse by default on large screens
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getAuthToken = () => localStorage.getItem('adminToken');

  // Fetch all data for dashboard statistics
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();

      // Fetch registered users using the correct endpoint
      const usersResponse = await fetch(`${API_BASE_URL}/api/subscriptions/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!usersResponse.ok) throw new Error('Failed to fetch users');
      const usersData = await usersResponse.json();

      // Fetch admin-created users
      const adminUsersResponse = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      let adminUsersData = { success: false, data: [] };
      if (adminUsersResponse.ok) {
        adminUsersData = await adminUsersResponse.json();
      }

      // Fetch initial payments
      const paymentsResponse = await fetch(`${API_BASE_URL}/api/user-payments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const paymentsData = await paymentsResponse.json();

      // Fetch subsequent payments
      const subsequentPaymentsResponse = await fetch(`${API_BASE_URL}/api/user-subsequent-payments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const subsequentPaymentsData = await subsequentPaymentsResponse.json();

      // Fetch admin-created payments
      const adminPaymentsResponse = await fetch(`${API_BASE_URL}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      let adminPaymentsData = { success: false, data: [] };
      if (adminPaymentsResponse.ok) {
        adminPaymentsData = await adminPaymentsResponse.json();
      }

      if (usersData.success) {
        setUsers(usersData.data || []);
      } else {
        console.error('Failed to fetch users:', usersData.message);
      }

      if (adminUsersData.success) {
        setAdminCreatedUsers(adminUsersData.data || []);
      } else {
        console.error('Failed to fetch admin-created users:', adminUsersData.message);
      }

      if (paymentsData.success) {
        setPayments(paymentsData.payments || []);
      } else {
        console.error('Failed to fetch payments:', paymentsData.message);
      }

      if (subsequentPaymentsData.success) {
        setSubsequentPayments(subsequentPaymentsData.payments || []);
      } else {
        console.error('Failed to fetch subsequent payments:', subsequentPaymentsData.message);
      }

      if (adminPaymentsData.success) {
        setAdminCreatedPayments(adminPaymentsData.data || []);
      } else {
        console.error('Failed to fetch admin-created payments:', adminPaymentsData.message);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to fetch dashboard data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate pending requests
  const calculatePendingRequests = () => {
    const allUsers = [...users, ...adminCreatedUsers];
    const pendingUsers = allUsers.filter(u => u.status?.toLowerCase() === "pending").length;
    
    const allPayments = [
      ...payments,
      ...subsequentPayments,
      ...adminCreatedPayments
    ];
    
    const pendingPayments = allPayments.filter(p => p.status === "pending").length;
    
    return pendingUsers + pendingPayments;
  };

  // Show notification if there are pending requests
  const showPendingNotifications = (currentPending, stats) => {
    if (currentPending > 0) {
      if (!lastNotificationTime || currentPending > pendingRequests) {
        const content = (
          <div className="toast-notification">
            <div className="toast-header">
              <AlertCircle size={22} className="toast-icon" />
              <strong>Pending Requests</strong>
            </div>
            <p>
              You have <strong>{currentPending}</strong> pending requests needing your attention!
            </p>
            <div className="toast-actions">
              <Link to="/admin/registered" className="btn-link">
                New Registrations ({stats.pendingUsers})
              </Link>
              <Link to="/admin/payment-approval" className="btn-link">
                New Payments ({stats.pendingAllPayments})
              </Link>
            </div>
          </div>
        );

        toast.info(content, {
          position: "top-right",
          autoClose: 6000,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          className: "custom-toast",
        });

        setLastNotificationTime(new Date());
      }
    }
    setPendingRequests(currentPending);
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Set up interval to check for updates every 2 minutes
    const intervalId = setInterval(fetchDashboardData, 120000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Calculate statistics
  const calculateStatistics = () => {
    // Combine regular users and admin-created users
    const allUsers = [...users, ...adminCreatedUsers];
    
    // User statistics
    const totalUsers = allUsers.length;
    const pendingUsers = allUsers.filter(u => u.status?.toLowerCase() === "pending").length;
    const approvedUsers = allUsers.filter(u => u.status?.toLowerCase() === "approved" || u.status?.toLowerCase() === "completed").length;

    // Plot statistics
    const totalPlots = allUsers.reduce((sum, u) => sum + (u.plot_taken?.split(",").length || 0), 0);
    const revenueFromPlots = allUsers.reduce((sum, u) => {
      if (!u.price_per_plot) return sum;
      return sum + u.price_per_plot
        .split(",")
        .map(p => parseFloat(p.trim()) || 0)
        .reduce((a, b) => a + b, 0);
    }, 0);

    // Combine all payments (initial, subsequent, and admin-created)
    const allPayments = [
      ...payments,
      ...subsequentPayments,
      ...adminCreatedPayments
    ];

    // Initial payments
    const totalInitialPayments = payments.length;
    const pendingInitialPayments = payments.filter(p => p.status === "pending").length;
    const approvedInitialPayments = payments.filter(p => p.status === "approved").length;
    const totalInitialAmount = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    // Subsequent payments
    const totalSubsequentPayments = subsequentPayments.length;
    const pendingSubsequentPayments = subsequentPayments.filter(p => p.status === "pending").length;
    const approvedSubsequentPayments = subsequentPayments.filter(p => p.status === "approved").length;
    const totalSubsequentAmount = subsequentPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    // Admin-created payments
    const totalAdminPayments = adminCreatedPayments.length;
    const pendingAdminPayments = adminCreatedPayments.filter(p => p.status === "pending").length;
    const approvedAdminPayments = adminCreatedPayments.filter(p => p.status === "approved").length;
    const totalAdminAmount = adminCreatedPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    // Combined
    const totalAllPayments = totalInitialPayments + totalSubsequentPayments + totalAdminPayments;
    const totalAllAmount = totalInitialAmount + totalSubsequentAmount + totalAdminAmount;
    const pendingAllPayments = pendingInitialPayments + pendingSubsequentPayments + pendingAdminPayments;

    // Total revenue (plots + payments)
    const totalRevenue = revenueFromPlots + totalAllAmount;

    return {
      totalUsers, pendingUsers, approvedUsers,
      totalPlots, revenueFromPlots,
      totalInitialPayments, pendingInitialPayments, approvedInitialPayments, totalInitialAmount,
      totalSubsequentPayments, pendingSubsequentPayments, approvedSubsequentPayments, totalSubsequentAmount,
      totalAdminPayments, pendingAdminPayments, approvedAdminPayments, totalAdminAmount,
      totalAllPayments, totalAllAmount, pendingAllPayments,
      totalRevenue
    };
  };

  const stats = calculateStatistics();
  
  // Calculate and show notifications for pending requests
  useEffect(() => {
    const currentPending = calculatePendingRequests();
    showPendingNotifications(currentPending, stats);
  }, [users, payments, subsequentPayments, adminCreatedUsers, adminCreatedPayments]);

  const displayStats = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      change: `${stats.approvedUsers} approved, ${stats.pendingUsers} pending`,
      icon: <Users size={24} />,
      color: '#4e73df'
    },
    {
      title: 'Total Account Balance',
      value: `₦${stats.totalRevenue.toLocaleString()}`,
      change: `Admin: ₦${stats.revenueFromPlots.toLocaleString()}, Users: ₦${stats.totalAllAmount.toLocaleString()}`,
      icon: <CreditCard size={24} />,
      color: '#10b981'
    },
    {
      title: 'Total Payments',
      value: stats.totalAllPayments,
      change: `Amount: ₦${stats.totalAllAmount.toLocaleString()}`,
      icon: <CreditCard size={24} />,
      color: '#36b9cc'
    },
    {
      title: 'Initial Payments',
      value: stats.totalInitialPayments,
      change: `Approved: ${stats.approvedInitialPayments}, Pending: ${stats.pendingInitialPayments}, Amount: ₦${stats.totalInitialAmount.toLocaleString()}`,
      icon: <CheckCircle size={24} />,
      color: '#10b981'
    },
    {
      title: 'Subsequent Payments',
      value: stats.totalSubsequentPayments,
      change: `Approved: ${stats.approvedSubsequentPayments}, Pending: ${stats.pendingSubsequentPayments}, Amount: ₦${stats.totalSubsequentAmount.toLocaleString()}`,
      icon: <TrendingUp size={24} />,
      color: '#8b5cf6'
    },
    {
      title: 'Admin Payments',
      value: stats.totalAdminPayments,
      change: `Amount: ₦${stats.revenueFromPlots.toLocaleString()}`,
      icon: <UserCheck size={24} />,
      color: '#8b5cf6'
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingAllPayments,
      change: `${stats.pendingInitialPayments} initial, ${stats.pendingSubsequentPayments} subsequent, ${stats.pendingAdminPayments} admin`,
      icon: <Clock size={24} />,
      color: '#f6c23e'
    },
    {
      title: 'Plots Sales ',
      value: stats.totalPlots,
      change: `Amount: ₦${stats.revenueFromPlots.toLocaleString()}`,
      icon: <Map size={24} />,
      color: '#1cc88a'
    }
  ];

  const formatCurrency = (value) => {
    if (!value || isNaN(value)) return "₦0";
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(Number(value));
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const getSidebarClass = () => {
    if (isMobile) {
      return sidebarOpen ? 'expanded' : 'collapsed';
    }
    return sidebarCollapsed ? 'collapsed' : 'expanded';
  };

  return (
    <div className="dashboard-container">
      {/* Mobile Toggle Button */}
      {isMobile && (
        <button className="mobile-menu-btn" onClick={toggleSidebar}>
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}

      {/* Overlay for mobile when sidebar is open */}
      {isMobile && sidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar}></div>
      )}

      {/* Toast notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      {/* Sidebar */}
      <div
        className={`sidebar ${getSidebarClass()}`}
        onMouseEnter={() => !isMobile && setSidebarCollapsed(false)}
        onMouseLeave={() => !isMobile && setSidebarCollapsed(true)}
      >
        <div className="sidebar-header">
          <h3>{!sidebarCollapsed || isMobile ? 'Admin Panel' : '🕵️‍♂️'}</h3>
          {/* Notification bell with badge */}
          <div className="notification-bell" onClick={() => setShowNotifications(!showNotifications)}>
            <Bell size={20} />
            {pendingRequests > 0 && <span className="notification-badge">{pendingRequests}</span>}
          </div>
        </div>
        
        {/* Notification dropdown */}
        {showNotifications && (
          <div className="notification-dropdown">
            <div className="notification-header">
              <h4>Pending Requests</h4>
              <span>{pendingRequests} items need attention</span>
            </div>
            <div className="notification-list">
              {stats.pendingUsers > 0 && (
                <div className="notification-item">
                  <Users size={16} />
                  <div className="notification-content">
                    <span className="notification-title">{stats.pendingUsers} User Registrations</span>
                    <span className="notification-desc">Pending approval</span>
                  </div>
                  <Link to="/admin/registered" className="notification-action" onClick={closeSidebar}>Review</Link>
                </div>
              )}
              
              {stats.pendingAllPayments > 0 && (
                <div className="notification-item">
                  <CreditCard size={16} />
                  <div className="notification-content">
                    <span className="notification-title">{stats.pendingAllPayments} Payments</span>
                    <span className="notification-desc">Awaiting approval</span>
                  </div>
                  <Link to="/admin/payment-approval" className="notification-action" onClick={closeSidebar}>Review</Link>
                </div>
              )}
              
              {pendingRequests === 0 && (
                <div className="notification-item">
                  <CheckCircle size={16} />
                  <div className="notification-content">
                    <span className="notification-title">All caught up!</span>
                    <span className="notification-desc">No pending requests</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        <ul className="sidebar-menu">
          {menuItems.map(item => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={location.pathname === item.path ? 'active' : ''}
                title={sidebarCollapsed && !isMobile ? item.name : ''}
                onClick={closeSidebar}
              >
                <i className={item.icon}></i>
                {(!sidebarCollapsed || isMobile) && <span>{item.name}</span>}
                {/* Show notification badge on menu items if they have pending items */}
                {item.path === '/admin/registered' && stats.pendingUsers > 0 && (
                  <span className="menu-badge">{stats.pendingUsers}</span>
                )}
                {item.path === '/admin/payment-approval' && stats.pendingAllPayments > 0 && (
                  <span className="menu-badge">{stats.pendingAllPayments}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className={`main-content ${isMobile && sidebarOpen ? 'sidebar-open' : ''}`}>
        <Routes>
          <Route path="/" element={
            <div className="dashboard-content">
              <h2>Dashboard Overview</h2>

              {loading && (
                <div className="loading">Loading dashboard data...</div>
              )}

              {error && (
                <div className="alert alert-error">
                  <i className="fas fa-exclamation-circle"></i>
                  {error}
                </div>
              )}

              {/* Stats Cards */}
              <div className="stats-grid">
                {displayStats.map((stat, index) => (
                  <div key={index} className="stat-card" style={{ borderLeft: `4px solid ${stat.color}` }}>
                    <div className="stat-content">
                      <div className="stat-title">{stat.title}</div>
                      <div className="stat-value">{stat.value}</div>
                      <div className="stat-change">
                        {stat.change}
                      </div>
                    </div>
                    <div className="stat-icon" style={{ color: stat.color }}>
                      {stat.icon}
                    </div>
                  </div>
                ))}
              </div>

              {/* Enhanced Charts and detailed overview */}
              <div className="dashboard-charts">
                {/* Payment Overview */}
                <div className="chart-container enhanced-card">
                  <div className="chart-header">
                    <h3><i className="fas fa-money-bill-wave"></i> Payment Overview</h3>
                    <div className="header-actions">
                      <span className="total-amount">Total: {formatCurrency(stats.totalAllAmount)}</span>
                    </div>
                  </div>
                  <div className="payment-overview-grid">
                    <div className="payment-category" style={{ borderColor: '#10b981' }}>
                      <div className="payment-header">
                        <CheckCircle size={20} color="#10b981" />
                        <h4>Initial Payments</h4>
                      </div>
                      <div className="payment-stats">
                        <div className="stat-row">
                          <span className="label">Total</span>
                          <span className="value">{stats.totalInitialPayments}</span>
                        </div>
                        <div className="stat-row">
                          <span className="label">Approved</span>
                          <span className="value approved">{stats.approvedInitialPayments}</span>
                        </div>
                        <div className="stat-row">
                          <span className="label">Pending</span>
                          <span className="value pending">{stats.pendingInitialPayments}</span>
                        </div>
                        <div className="stat-row total-row">
                          <span className="label">Amount</span>
                          <span className="value amount">{formatCurrency(stats.totalInitialAmount)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="payment-category" style={{ borderColor: '#8b5cf6' }}>
                      <div className="payment-header">
                        <TrendingUp size={20} color="#8b5cf6" />
                        <h4>Subsequent Payments</h4>
                      </div>
                      <div className="payment-stats">
                        <div className="stat-row">
                          <span className="label">Total</span>
                          <span className="value">{stats.totalSubsequentPayments}</span>
                        </div>
                        <div className="stat-row">
                          <span className="label">Approved</span>
                          <span className="value approved">{stats.approvedSubsequentPayments}</span>
                        </div>
                        <div className="stat-row">
                          <span className="label">Pending</span>
                          <span className="value pending">{stats.pendingSubsequentPayments}</span>
                        </div>
                        <div className="stat-row total-row">
                          <span className="label">Amount</span>
                          <span className="value amount">{formatCurrency(stats.totalSubsequentAmount)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="payment-summary" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                      <div className="summary-header">
                        <CreditCard size={24} color="#fff" />
                        <h4>Combined Totals</h4>
                      </div>
                      <div className="summary-stats">
                        <div className="summary-row">
                          <span className="label">Total Payments</span>
                          <span className="value">{stats.totalAllPayments}</span>
                        </div>
                        <div className="summary-row">
                          <span className="label">Pending Approval</span>
                          <span className="value">{stats.pendingAllPayments}</span>
                        </div>
                        <div className="summary-row highlight">
                          <span className="label">Total Amount</span>
                          <span className="value">{formatCurrency(stats.totalAllAmount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Revenue Summary with Admin Payments and Quick Actions */}
                <div className="chart-container enhanced-card">
                  <div className="chart-header">
                    <h3><i className="fas fa-chart-line"></i> Account Summary & Admin Overview</h3>
                    <div className="header-actions">
                      <span className="total-revenue">Total: {formatCurrency(stats.totalRevenue)}</span>
                    </div>
                  </div>
                  
                  <div className="revenue-admin-container">
                    {/* Admin Payments Section */}
                    <div className="admin-payments-section">
                      <h4 className="section-title">
                        <UserCheck size={18} color="#4e73df" />
                        Admin Payments
                      </h4>
                      <div className="admin-payments-grid">
                        <div className="admin-stat">
                          <span className="admin-label">Total</span>
                          <span className="admin-value">{stats.totalAdminPayments}</span>
                        </div>
                        <div className="admin-stat">
                          <span className="admin-label">Approved</span>
                          <span className="admin-value approved">{stats.approvedAdminPayments}</span>
                        </div>
                        <div className="admin-stat">
                          <span className="admin-label">Pending</span>
                          <span className="admin-value pending">{stats.pendingAdminPayments}</span>
                        </div>
                        <div className="admin-stat total">
                          <span className="admin-label">Amount Received</span>
                          <span>{formatCurrency(stats.revenueFromPlots)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Revenue Breakdown */}
                    <div className="revenue-breakdown">
                      <div className="revenue-chart">
                        <div className="chart-visual">
                          <div className="revenue-bar" style={{ height: '100%', width: `${(stats.revenueFromPlots / stats.totalRevenue) * 100}%`, backgroundColor: '#1cc88a' }}></div>
                          <div className="revenue-bar" style={{ height: '100%', width: `${(stats.totalAllAmount / stats.totalRevenue) * 100}%`, backgroundColor: '#4e73df' }}></div>
                        </div>
                        <div className="chart-legend">
                          <div className="legend-item">
                            <div className="color-box" style={{ backgroundColor: '#1cc88a' }}></div>
                            <span>Payment By Admin</span>
                            <span className="legend-value">{formatCurrency(stats.revenueFromPlots)}</span>
                          </div>
                          <div className="legend-item">
                            <div className="color-box" style={{ backgroundColor: '#4e73df' }}></div>
                            <span>Payment By User</span>
                            <span className="legend-value">{formatCurrency(stats.totalAllAmount)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="revenue-details">
                        <div className="revenue-category">
                          <h5>Payment Breakdown</h5>
                          <div className="revenue-item">
                            <span>Initial Payments</span>
                            <span>{formatCurrency(stats.totalInitialAmount)}</span>
                          </div>
                          <div className="revenue-item">
                            <span>Subsequent Payments</span>
                            <span>{formatCurrency(stats.totalSubsequentAmount)}</span>
                          </div>
                          
                          <div className="revenue-total">
                            <span>Total Payments</span>
                            <span>{formatCurrency(stats.totalAllAmount)}</span>
                          </div>
                        </div>
                        
                        <div className="revenue-category">
                          <h5>Overall Revenue</h5>
                          <div className="revenue-item highlight">
                            <span>Admin </span>
                            <span>{formatCurrency(stats.revenueFromPlots)}</span>
                          </div>
                          <div className="revenue-item highlight">
                            <span>User</span>
                            <span>{formatCurrency(stats.totalAllAmount)}</span>
                          </div>
                          <div className="revenue-grand-total">
                            <span>Total Balance</span>
                            <span>{formatCurrency(stats.totalRevenue)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions Section */}
                    <div className="quick-actions-section">
                      <h4 className="section-title">
                        <i className="fas fa-bolt"></i>
                        Quick Actions
                      </h4>
                      <div className="quick-actions-grid">
                        <Link to="/admin/payment-approval" className="quick-action-btn">
                          <AlertCircle size={16} />
                          <span>Review Payments ({stats.pendingAllPayments})</span>
                        </Link>
                        <Link to="/admin/users" className="quick-action-btn">
                          <Users size={16} />
                          <span>Manage Users ({stats.totalUsers})</span>
                        </Link>
                        <Link to="/admin/user-payment" className="quick-action-btn">
                          <DollarSign size={16} />
                          <span>Payment History</span>
                        </Link>
                        <Link to="/admin/registered" className="quick-action-btn">
                          <CheckCircle size={16} />
                          <span>Approve Registrations ({stats.pendingUsers})</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          } />
          <Route path="/users" element={<AdminUsers />} />
          <Route path="/plots" element={<AdminPlots />} />
          <Route path="/payments" element={<AdminPayments />} />
          <Route path="/registered" element={<AdminRegisteredUsers />} />
          <Route path="/user-payment" element={<AdminUserPayments />} />
          <Route path="/payment-approval" element={<AdminPaymentApproval />} />
          <Route path="/notifications" element={<AdminNotifications />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminDashboard;