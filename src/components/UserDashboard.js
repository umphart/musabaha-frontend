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

  // Sidebar open state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

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
      const response = await fetch(`https://musabaha-home-ltd.onrender.com/api/notifications/user/${user.id}/read-all`, {
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

  // Check screen size on resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      
      // Auto-close sidebar when switching to mobile view
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    
    // Set initial sidebar state based on screen size
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  // Toggle sidebar open state
  const toggleSidebar = () => setSidebarOpen(open => !open);

  // Close sidebar when clicking outside on mobile
  const handleOverlayClick = () => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  return (
    <div style={styles.dashboardContainer}>
      <ToastContainer />
      
      {/* Mobile hamburger button */}
      {isMobile && (
        <button 
          aria-label="Toggle Menu"
          onClick={toggleSidebar} 
          style={styles.mobileMenuBtn}
        >
          <i className="fas fa-bars"></i>
          {unreadCount > 0 && (
            <span style={styles.notificationBadge}>{unreadCount}</span>
          )}
        </button>
      )}

      {/* Overlay for mobile when sidebar is open */}
      {isMobile && sidebarOpen && (
        <div 
          style={styles.overlay}
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <nav 
        className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`} 
        style={{
          ...styles.sidebar,
          ...(isMobile ? styles.sidebarMobile : {}),
          ...(isMobile && sidebarOpen ? styles.sidebarMobileOpen : {}),
        }}
        onMouseEnter={!isMobile ? () => setSidebarOpen(true) : undefined}
        onMouseLeave={!isMobile ? () => setSidebarOpen(false) : undefined}
        aria-label="Sidebar Navigation"
      >
        <div style={styles.sidebarHeader}>
          <i className="fas fa-user-circle" style={styles.sidebarLogo}></i>
          {sidebarOpen && (
            <div style={{display: 'flex', alignItems: 'center'}}>
              <span style={{marginLeft: 10, fontWeight: 'bold', fontSize: '1.2rem'}}>User Dashboard</span>
              {unreadCount > 0 && (
                <span style={styles.sidebarNotificationBadge}>{unreadCount}</span>
              )}
            </div>
          )}
        </div>

        <ul style={styles.menu}>
          {menuItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <li key={item.path} style={styles.menuItem}>
                <Link
                  to={item.path}
                  style={{
                    ...styles.menuLink,
                    ...(active ? styles.menuActive : {}),
                  }}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => isMobile && setSidebarOpen(false)}
                >
                  <i className={item.icon} style={styles.icon}></i>
                  {sidebarOpen && <span style={{marginLeft: 12}}>{item.name}</span>}
                </Link>
              </li>
            );
          })}
          
          {/* Notifications Menu Item */}
          <li style={styles.menuItem}>
            <Link
              to="/dashboard/notifications"
              style={{
                ...styles.menuLink,
                ...(location.pathname === '/dashboard/notifications' ? styles.menuActive : {}),
              }}
              onClick={() => isMobile && setSidebarOpen(false)}
            >
              <i className="fas fa-bell" style={styles.icon}></i>
              {sidebarOpen && (
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%'}}>
                  <span style={{marginLeft: 12}}>Notifications</span>
                  {unreadCount > 0 && (
                    <span style={styles.menuNotificationBadge}>{unreadCount}</span>
                  )}
                </div>
              )}
            </Link>
          </li>
          
          <li>
            <button 
              onClick={handleLogout} 
              style={styles.logoutBtn}
              aria-label="Logout"
              onKeyDown={(e) => { if (e.key === 'Enter') handleLogout(); }}
            >
              <i className="fas fa-sign-out-alt" style={styles.icon}></i>
              {sidebarOpen && <span style={{marginLeft: 12}}>Logout</span>}
            </button>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <main style={{
        ...styles.mainContent,
        marginLeft: isMobile ? 0 : (sidebarOpen ? 220 : 60),
      }}>
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
      </main>

      {/* Internal CSS for responsiveness */}
      <style>
        {`
          .sidebar {
            background-color: #2c3e50;
            color: white;
            height: 100vh;
            padding-top: 1rem;
            overflow-x: hidden;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            position: fixed;
            top: 0;
            left: 0;
            transition: all 0.3s ease;
            z-index: 1000;
          }
          
          .sidebar.closed {
            width: 60px !important;
          }
          
          .sidebar.open {
            width: 220px !important;
          }

          @media (max-width: 768px) {
            .sidebar {
              transform: translateX(-100%);
              width: 220px !important;
              box-shadow: 2px 0 5px rgba(0,0,0,0.3);
            }
            
            .sidebar.open {
              transform: translateX(0);
            }
          }
        `}
      </style>
    </div>
  );
};

// Notifications Page Component
const NotificationsPage = ({ notifications, markAsRead, markAllAsRead }) => {
  return (
    <div style={styles.notificationsContainer}>
      <div style={styles.notificationsHeader}>
        <h2>Notifications</h2>
        {notifications.length > 0 && (
          <button 
            onClick={markAllAsRead}
            style={styles.markAllReadBtn}
          >
            Mark all as read
          </button>
        )}
      </div>
      
      {notifications.length === 0 ? (
        <div style={styles.noNotifications}>
          <i className="fas fa-bell-slash" style={styles.noNotificationsIcon}></i>
          <p>No notifications yet</p>
        </div>
      ) : (
        <div style={styles.notificationsList}>
          {notifications.map(notification => (
            <div 
              key={notification.id} 
              style={{
                ...styles.notificationItem,
                ...(notification.is_read ? {} : styles.unreadNotification)
              }}
              onClick={() => !notification.is_read && markAsRead(notification.id)}
            >
              <div style={styles.notificationIcon}>
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
              <div style={styles.notificationContent}>
                <p style={styles.notificationMessage}>{notification.message}</p>
                <span style={styles.notificationTime}>
                  {new Date(notification.created_at).toLocaleString()}
                </span>
              </div>
              {!notification.is_read && (
                <div style={styles.unreadIndicator}></div>
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
      <div style={styles.statsCards}>
        <div style={styles.statCard}>
          <i className="fas fa-map-marked" style={styles.cardIcon}></i>
          <h3>My Plots</h3>
          <p>{dashboardData.plotCount} {dashboardData.plotCount === 1 ? 'Property' : 'Properties'}</p>
        </div>
        <div style={styles.statCard}>
          <i className="fas fa-credit-card" style={styles.cardIcon}></i>
          <h3>Transactions</h3>
          <p>{dashboardData.transactionCount} {dashboardData.transactionCount === 1 ? 'Transaction' : 'Transactions'}</p>
        </div>
        <div style={styles.statCard}>
          <i className="fas fa-money-bill-wave" style={styles.cardIcon}></i>
          <h3>Total Deposited</h3>
          <p>₦{dashboardData.totalDeposited.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div style={styles.statCard}>
          <i className="fas fa-exclamation-triangle" style={{...styles.cardIcon, color: '#e74c3c'}}></i>
          <h3>Outstanding Balance</h3>
          <p>₦{dashboardData.outstandingBalance.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      </div>
    )}
  </div>
);

const styles = {
  dashboardContainer: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
    backgroundColor: '#ecf0f1',
    position: 'relative',
  },
  sidebar: {
    // width controlled inline based on state
  },
  sidebarMobile: {
    transform: 'translateX(-100%)',
  },
  sidebarMobileOpen: {
    transform: 'translateX(0)',
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px 1rem 16px',
    width: '100%',
    borderBottom: '1px solid #34495e',
    whiteSpace: 'nowrap',
  },
  sidebarLogo: {
    fontSize: '2rem',
  },
  menu: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    width: '100%',
  },
  menuItem: {
    width: '100%',
  },
  menuLink: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    textDecoration: 'none',
    color: 'white',
    width: '100%',
    transition: 'background 0.3s ease',
    whiteSpace: 'nowrap',
  },
  menuActive: {
    backgroundColor: '#34495e',
  },
  icon: {
    width: '20px',
    textAlign: 'center',
  },
  logoutBtn: {
    background: 'none',
    border: 'none',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    width: '100%',
    cursor: 'pointer',
    textAlign: 'left',
    whiteSpace: 'nowrap',
  },
  mainContent: {
    flex: 1,
    padding: '2rem',
    transition: 'margin-left 0.3s ease',
  },
  statsCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
  },
  statCard: {
    background: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  cardIcon: {
    fontSize: '2rem',
    color: '#3498db',
    marginBottom: '1rem',
  },
  mobileMenuBtn: {
    display: 'block',
    position: 'fixed',
    top: 15,
    left: 15,
    background: '#2c3e50',
    color: 'white',
    border: 'none',
    borderRadius: 4,
    padding: '8px 12px',
    zIndex: 1100,
    cursor: 'pointer',
    fontSize: '18px',
    position: 'relative',
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
  notificationBadge: {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    backgroundColor: '#e74c3c',
    color: 'white',
    borderRadius: '50%',
    width: '18px',
    height: '18px',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebarNotificationBadge: {
    backgroundColor: '#e74c3c',
    color: 'white',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: '10px',
  },
  menuNotificationBadge: {
    backgroundColor: '#e74c3c',
    color: 'white',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Notifications page styles
  notificationsContainer: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  notificationsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  markAllReadBtn: {
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  noNotifications: {
    textAlign: 'center',
    padding: '40px',
    color: '#7f8c8d',
  },
  noNotificationsIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  notificationsList: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  notificationItem: {
    display: 'flex',
    padding: '16px',
    borderBottom: '1px solid #eee',
    backgroundColor: '#fff',
    cursor: 'pointer',
    alignItems: 'center',
    transition: 'background-color 0.2s',
  },
  unreadNotification: {
    backgroundColor: '#f8f9fa',
    fontWeight: 'bold',
  },
  notificationIcon: {
    fontSize: '20px',
    marginRight: '16px',
    width: '24px',
    textAlign: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationMessage: {
    margin: '0 0 8px 0',
  },
  notificationTime: {
    fontSize: '12px',
    color: '#7f8c8d',
  },
  unreadIndicator: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#3498db',
    marginLeft: '10px',
  },
  // Media queries for mobile
  '@media (min-width: 769px)': {
    mobileMenuBtn: {
      display: 'none',
    },
    overlay: {
      display: 'none',
    },
  },
};

export default UserDashboard;