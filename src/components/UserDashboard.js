import React, { useState, useEffect } from 'react'; 
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import UserProfile from './users/UserProfile';
import UserPlots from './users/UserPlots';
import UserPayments from './users/UserPayments';
import UserDocuments from './users/UserDocuments';
import SubscriptionForm from './users/SubscriptionForm';
import Swal from 'sweetalert2';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UserDashboard = ({ user, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Sidebar states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [dashboardData, setDashboardData] = useState({
    plotCount: 0,
    transactionCount: 0,
    totalDeposited: 0,
    outstandingBalance: 0
  });
  const [loading, setLoading] = useState(true);
  
  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastChecked, setLastChecked] = useState(new Date());

  const menuItems = [
    { path: '/dashboard', name: 'Dashboard', icon: 'fas fa-tachometer-alt' },
    { path: '/dashboard/profile', name: 'Profile', icon: 'fas fa-user' },
    { path: '/dashboard/plots', name: 'My Plots', icon: 'fas fa-map-marked' },
    { path: '/dashboard/payments', name: 'Payments', icon: 'fas fa-credit-card' },
    { path: '/dashboard/documents', name: 'Subsequent Payments', icon: 'fas fa-file' },
    { path: '/dashboard/subscribe', name: 'Apply for Plot', icon: 'fas fa-file-signature' },
  ];

  // Check screen size on resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      
      // Auto-close sidebar when switching to mobile view
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarCollapsed(true); // Collapse by default on large screens
      }
    };

    window.addEventListener('resize', handleResize);
    
    // Set initial sidebar state based on screen size
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`https://musabaha-home-ltd.onrender.com/api/notifications/user/${user.id}`);
      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.notifications);
        
        // Count unread notifications
        const unread = data.notifications.filter(n => !n.is_read).length;
        setUnreadCount(unread);
        
        // Check for new approvals since last check
        checkForNewApprovals(data.notifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // Check for new approval notifications
  const checkForNewApprovals = (notifications) => {
    const newApprovals = notifications.filter(n => 
      !n.is_read && 
      new Date(n.created_at) > lastChecked &&
      (n.type === 'payment_approved' || n.type === 'registration_approved')
    );
    
    if (newApprovals.length > 0) {
      newApprovals.forEach(notification => {
        showApprovalNotification(notification);
      });
    }
    
    // Update last checked time
    setLastChecked(new Date());
  };

  // Show approval notification toast
  const showApprovalNotification = (notification) => {
    let message = "";
    
    if (notification.type === 'payment_approved') {
      message = `Your payment of ₦${parseFloat(notification.amount).toLocaleString()} has been approved!`;
    } else if (notification.type === 'registration_approved') {
      message = "Your registration has been approved! You can now access all features.";
    }
    
    toast.success(
      <div>
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
          <i className="fas fa-check-circle" style={{ marginRight: '8px' }}></i>
          Approval Notice
        </div>
        <div>{message}</div>
        <div style={{ fontSize: '12px', marginTop: '5px', color: '#666' }}>
          {new Date(notification.created_at).toLocaleString()}
        </div>
      </div>,
      {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      }
    );
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`https://musabaha-home-ltd.onrender.com/api/notifications/${notificationId}/read`, {
        method: 'PUT'
      });
      
      if (response.ok) {
        // Update local state
        setNotifications(notifications.map(n => 
          n.id === notificationId ? { ...n, is_read: true } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/notifications/user/${user.id}/read-all`, {
        method: 'PUT'
      });
      
      if (response.ok) {
        setNotifications(notifications.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch payments data (contains plot count and outstanding balance)
        const paymentsRes = await fetch(`https://musabaha-home-ltd.onrender.com/api/user-payments/user/${user.id}`);
        const paymentsData = await paymentsRes.json();
        
        // Fetch subsequent payments
        const subsequentRes = await fetch(`https://musabaha-home-ltd.onrender.com/api/user-subsequent-payments/user/${user.id}`);
        const subsequentData = await subsequentRes.json();

        let totalDeposited = 0;
        let outstandingBalance = 0;
        let plotCount = 0;
        
        if (paymentsData.success && paymentsData.payments && paymentsData.payments.length > 0) {
          const payment = paymentsData.payments[0]; // first payment
          totalDeposited += parseFloat(payment.amount) || 0;
          outstandingBalance = parseFloat(payment.outstanding_balance) || 0;
          plotCount = parseInt(payment.number_of_plots) || 0;
        }

        if (subsequentData.success && subsequentData.payments) {
          subsequentData.payments.forEach(payment => {
            totalDeposited += parseFloat(payment.amount_paid) || 0;
          });
        }

        setDashboardData({
          plotCount,
          transactionCount: (paymentsData.success && paymentsData.payments ? paymentsData.payments.length : 0) + 
                           (subsequentData.success && subsequentData.payments ? subsequentData.payments.length : 0),
          totalDeposited,
          outstandingBalance
        });
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Could not load dashboard data.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    fetchNotifications();
    
    // Set up interval to check for new notifications every 30 seconds
    const notificationInterval = setInterval(fetchNotifications, 30000);
    
    return () => {
      clearInterval(notificationInterval);
    };
  }, [user]);

  const handleLogout = () => {
    onLogout();
    navigate('/');
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
      <ToastContainer />
      
      {/* Mobile Toggle Button - Fixed at top left corner */}
      {isMobile && (
        <button className="mobile-menu-btn" onClick={toggleSidebar}>
          {sidebarOpen ? <i className="fas fa-times"></i> : <i className="fas fa-bars"></i>}
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}
        </button>
      )}

      {/* Overlay for mobile when sidebar is open */}
      {isMobile && sidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar}></div>
      )}

      {/* Sidebar */}
      <div
        className={`sidebar ${getSidebarClass()}`}
        onMouseEnter={() => !isMobile && setSidebarCollapsed(false)}
        onMouseLeave={() => !isMobile && setSidebarCollapsed(true)}
      >
        <div className="sidebar-header">
          <h3>{!sidebarCollapsed || isMobile ? 'User Dashboard' : '👤'}</h3>
          {/* Notification bell with badge */}
          <div className="notification-bell">
            <i className="fas fa-bell"></i>
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </div>
        </div>
        
        <ul className="sidebar-menu">
          {menuItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={active ? 'active' : ''}
                  title={sidebarCollapsed && !isMobile ? item.name : ''}
                  onClick={closeSidebar}
                >
                  <i className={item.icon}></i>
                  {(!sidebarCollapsed || isMobile) && <span>{item.name}</span>}
                </Link>
              </li>
            );
          })}
          
          {/* Notifications Menu Item */}
          <li>
            <Link
              to="/dashboard/notifications"
              className={location.pathname === '/dashboard/notifications' ? 'active' : ''}
              onClick={closeSidebar}
            >
              <i className="fas fa-bell"></i>
              {(!sidebarCollapsed || isMobile) && (
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%'}}>
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="menu-badge">{unreadCount}</span>
                  )}
                </div>
              )}
            </Link>
          </li>
          
          <li>
            <button 
              onClick={handleLogout} 
              className="logout-btn"
              aria-label="Logout"
            >
              <i className="fas fa-sign-out-alt"></i>
              {(!sidebarCollapsed || isMobile) && <span>Logout</span>}
            </button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className={`main-content ${isMobile && sidebarOpen ? 'sidebar-open' : ''}`}>
        <Routes>
          <Route path="/" element={<DashboardHome dashboardData={dashboardData} loading={loading} />} />
          <Route path="/profile" element={<UserProfile user={user} />} />
          <Route path="/plots" element={<UserPlots user={user} />} />
          <Route path="/payments" element={<UserPayments user={user} />} />
          <Route path="/documents" element={<UserDocuments user={user} />} />
          <Route path="/subscribe" element={<SubscriptionForm />} />
          <Route path="/notifications" element={
            <NotificationsPage 
              notifications={notifications} 
              markAsRead={markAsRead}
              markAllAsRead={markAllAsRead}
            />
          } />
        </Routes>
      </div>

      {/* Add CSS for the new sidebar behavior */}
      <style>
        {`
          .dashboard-container {
            display: flex;
            min-height: 100vh;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #ecf0f1;
            position: relative;
          }

          /* Sidebar behavior */
          .sidebar {
            position: fixed;
            left: 0;
            top: 0;
            height: 100vh;
            background: #2c3e50;
            color: white;
            transition: all 0.3s ease;
            z-index: 1000;
            overflow-y: auto;
            box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
          }

          .sidebar.collapsed {
            width: 70px;
          }

          .sidebar.expanded {
            width: 250px;
          }

          /* Mobile styles */
          @media (max-width: 768px) {
            .sidebar.collapsed {
              transform: translateX(-100%);
            }
            
            .sidebar.expanded {
              transform: translateX(0);
              width: 280px;
            }
            
            .sidebar-overlay {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(0, 0, 0, 0.5);
              z-index: 999;
            }
            
            .mobile-menu-btn {
              position: fixed;
              top: 15px;
              left: 15px;
              z-index: 1001;
              background: #2c3e50;
              color: white;
              border: none;
              border-radius: 4px;
              padding: 8px 10px;
              cursor: pointer;
              box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
              display: flex;
              align-items: center;
              justify-content: center;
              width: 40px;
              height: 40px;
            }
            
            .main-content {
              padding-top: 70px;
            }
          }

          /* Desktop styles */
          @media (min-width: 769px) {
            .sidebar.collapsed {
              width: 70px;
            }
            
            .sidebar.expanded {
              width: 250px;
            }
            
            .main-content {
              margin-left: 70px;
              transition: margin-left 0.3s ease;
            }
            
            .sidebar.expanded + .main-content {
              margin-left: 250px;
            }
            
            .mobile-menu-btn {
              display: none;
            }
            
            .sidebar-overlay {
              display: none;
            }
          }

          /* Sidebar menu items */
          .sidebar-menu {
            list-style: none;
            padding: 0;
            margin: 0;
          }

          .sidebar-menu li {
            width: 100%;
          }

          .sidebar-menu li a, .sidebar-menu li button {
            display: flex;
            align-items: center;
            padding: 12px 20px;
            color: #ecf0f1;
            text-decoration: none;
            transition: all 0.3s ease;
            position: relative;
            width: 100%;
            background: none;
            border: none;
            text-align: left;
            cursor: pointer;
          }

          .sidebar-menu li a:hover, .sidebar-menu li button:hover {
            background: #34495e;
          }

          .sidebar-menu li a.active {
            background: #3498db;
          }

          .sidebar-menu li a i, .sidebar-menu li button i {
            margin-right: 15px;
            width: 20px;
            text-align: center;
          }

          .sidebar.collapsed .sidebar-menu li a span,
          .sidebar.collapsed .sidebar-menu li button span {
            display: none;
          }

          .sidebar.collapsed .sidebar-menu li a i,
          .sidebar.collapsed .sidebar-menu li button i {
            margin-right: 0;
          }

          /* Menu badges */
          .menu-badge {
            background: #e74c3c;
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
          }

          .sidebar.collapsed .menu-badge {
            position: absolute;
            right: 5px;
            top: 5px;
          }

          /* Sidebar header */
          .sidebar-header {
            padding: 20px;
            border-bottom: 1px solid #34495e;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .sidebar-header h3 {
            margin: 0;
            font-size: 18px;
          }

          /* Notification bell */
          .notification-bell {
            position: relative;
            cursor: pointer;
            padding: 5px;
          }

          .notification-badge {
            position: absolute;
            top: -5px;
            right: -5px;
            background: #e74c3c;
            color: white;
            border-radius: 50%;
            width: 18px;
            height: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: bold;
          }

          /* Main content */
          .main-content {
            flex: 1;
            padding: 2rem;
            transition: margin-left 0.3s ease;
          }

          /* Stats cards */
          .stats-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
          }

          .stat-card {
            background: white;
            padding: 1.5rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            text-align: center;
          }

          .card-icon {
            font-size: 2rem;
            color: #3498db;
            margin-bottom: 1rem;
          }
        `}
      </style>
    </div>
  );
};

// Notifications Page Component
const NotificationsPage = ({ notifications, markAsRead, markAllAsRead }) => {
  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h2>Notifications</h2>
        {notifications.length > 0 && (
          <button 
            onClick={markAllAsRead}
            className="mark-all-read-btn"
          >
            Mark all as read
          </button>
        )}
      </div>
      
      {notifications.length === 0 ? (
        <div className="no-notifications">
          <i className="fas fa-bell-slash"></i>
          <p>No notifications yet</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`notification-item ${notification.is_read ? '' : 'unread-notification'}`}
              onClick={() => !notification.is_read && markAsRead(notification.id)}
            >
              <div className="notification-icon">
                {notification.type === 'payment_approved' && (
                  <i className="fas fa-money-bill-wave" style={{color: '#27ae60'}}></i>
                )}
                {notification.type === 'registration_approved' && (
                  <i className="fas fa-user-check" style={{color: '#3498db'}}></i>
                )}
                {notification.type === 'general' && (
                  <i className="fas fa-info-circle" style={{color: '#f39c12'}}></i>
                )}
              </div>
              <div className="notification-content">
                <p className="notification-message">{notification.message}</p>
                <span className="notification-time">
                  {new Date(notification.created_at).toLocaleString()}
                </span>
              </div>
              {!notification.is_read && (
                <div className="unread-indicator"></div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const DashboardHome = ({ dashboardData, loading }) => (
  <div>
    <h2>Dashboard Overview</h2>
    {loading ? (
      <p>Loading dashboard data...</p>
    ) : (
      <div className="stats-cards">
        <div className="stat-card">
          <i className="fas fa-map-marked card-icon"></i>
          <h3>My Plots</h3>
          <p>{dashboardData.plotCount} {dashboardData.plotCount === 1 ? 'Property' : 'Properties'}</p>
        </div>
        <div className="stat-card">
          <i className="fas fa-credit-card card-icon"></i>
          <h3>Transactions</h3>
          <p>{dashboardData.transactionCount} {dashboardData.transactionCount === 1 ? 'Transaction' : 'Transactions'}</p>
        </div>
        <div className="stat-card">
          <i className="fas fa-money-bill-wave card-icon"></i>
          <h3>Total Deposited</h3>
          <p>₦{dashboardData.totalDeposited.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div className="stat-card">
          <i className="fas fa-exclamation-triangle card-icon" style={{color: '#e74c3c'}}></i>
          <h3>Outstanding Balance</h3>
          <p>₦{dashboardData.outstandingBalance.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      </div>
    )}
  </div>
);

export default UserDashboard;