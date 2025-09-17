import React, { useState, useEffect } from 'react';

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('users'); // Changed default to 'users'
  const [newNotification, setNewNotification] = useState({ 
    title: '', 
    message: '', 
    type: 'info',
    recipient: 'all'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch users from API
        const res = await fetch('https://musabaha-home-ltd.onrender.com/api/auth/users');
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        
        if (data.success) {
          // Transform API data to match our expected format
          const userData = data.data.map(user => ({
            id: user.id,
            name: user.name || user.fullName || 'N/A',
            email: user.email,
            createdAt: user.created_at || user.createdAt,
            active: user.active !== undefined ? user.active : true
          }));
          
          setUsers(userData);
        } else {
          console.error('Failed to fetch users:', data.message);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSendNotification = (e) => {
    e.preventDefault();
    if (newNotification.title && newNotification.message) {
      const notification = {
        id: Date.now(), // Use timestamp for unique ID
        ...newNotification,
        date: new Date().toISOString(),
        read: false
      };
      setNotifications([notification, ...notifications]);
      setNewNotification({ title: '', message: '', type: 'info', recipient: 'all' });
      
      // Show success message
      alert(`Notification sent to ${newNotification.recipient === 'all' ? 'all users' : newNotification.recipient}`);
    }
  };

  const handleUserAction = (id) => {
    alert(`Action clicked for user ID: ${id}`);
    // You can expand: block user, edit, etc.
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  if (loading) return <div className="loading">Loading notifications...</div>;

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="header-actions">
          <button className="btn btn-primary">Refresh Data</button>
        </div>
      </div>

      <div className="dashboard-tabs">
        {/* User Management tab now comes first */}
        <button 
          className={activeTab === 'users' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('users')}
        >
          User Management
        </button>
        <button 
          className={activeTab === 'notifications' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('notifications')}
        >
          Notifications
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'users' ? ( // User Management content shown first
          <div className="users-container">
            <div className="content-header">
              <h2>User Management</h2>
              <p>Manage system users and permissions</p>
            </div>

            <div className="dashboard-card">
              <h3>Registered Users</h3>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Full Name</th>
                      <th>Email</th>
                      <th>Registered Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <tr key={user.id}>
                        <td>{index + 1}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{new Date(user.createdAt).toLocaleString()}</td>
                        <td>
                          <span className={`status-badge ${user.active ? 'active' : 'inactive'}`}>
                            {user.active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="btn btn-sm btn-secondary"
                            onClick={() => handleUserAction(user.id)}
                          >
                            Actions
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="notifications-container">
            <div className="content-header">
              <h2>Notification Center</h2>
              <p>Send and manage system notifications</p>
            </div>

            <div className="dashboard-card">
              <h3>Send New Notification</h3>
              <form onSubmit={handleSendNotification} className="notification-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Recipient</label>
                    <select
                      value={newNotification.recipient}
                      onChange={(e) => setNewNotification({...newNotification, recipient: e.target.value})}
                    >
                      <option value="all">All Users</option>
                      {users.map(user => (
                        <option key={user.id} value={user.email}>{user.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Type</label>
                    <select
                      value={newNotification.type}
                      onChange={(e) => setNewNotification({...newNotification, type: e.target.value})}
                    >
                      <option value="info">Info</option>
                      <option value="success">Success</option>
                      <option value="warning">Warning</option>
                      <option value="error">Error</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    placeholder="Notification title"
                    value={newNotification.title}
                    onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Message</label>
                  <textarea
                    placeholder="Notification message"
                    value={newNotification.message}
                    onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                    required
                  />
                </div>
                
                <button type="submit" className="btn btn-primary">Send Notification</button>
              </form>
            </div>

            <div className="dashboard-card">
              <h3>Recent Notifications</h3>
              <div className="notifications-list">
                {notifications.length === 0 ? (
                  <p className="no-data">No notifications sent yet</p>
                ) : (
                  notifications.map(notif => (
                    <div key={notif.id} className={`notification-item ${notif.type} ${notif.read ? 'read' : 'unread'}`}>
                      <div className="notification-content">
                        <div className="notification-header">
                          <h4>{notif.title}</h4>
                          <span className={`badge ${notif.type}`}>{notif.type}</span>
                        </div>
                        <p>{notif.message}</p>
                        <div className="notification-footer">
                          <span className="date">{new Date(notif.date).toLocaleString()}</span>
                          <div className="actions">
                            {!notif.read && (
                              <button 
                                className="btn btn-sm btn-outline"
                                onClick={() => markAsRead(notif.id)}
                              >
                                Mark as Read
                              </button>
                            )}
                            <button 
                              className="btn btn-sm btn-danger"
                              onClick={() => deleteNotification(notif.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .admin-dashboard {
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f5f7f9;
          min-height: 100vh;
        }
        
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #e1e4e8;
        }
        
        .dashboard-header h1 {
          color: #2c3e50;
          margin: 0;
        }
        
        .header-actions {
          display: flex;
          gap: 10px;
        }
        
        .dashboard-tabs {
          display: flex;
          border-bottom: 1px solid #e1e4e8;
          margin-bottom: 20px;
        }
        
        .tab {
          padding: 10px 20px;
          background: none;
          border: none;
          cursor: pointer;
          font-weight: 500;
          color: #7f8c8d;
          border-bottom: 2px solid transparent;
        }
        
        .tab.active {
          color: #3498db;
          border-bottom: 2px solid #3498db;
        }
        
        .dashboard-content {
          background-color: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }
        
        .content-header {
          padding: 20px;
          border-bottom: 1px solid #e1e4e8;
        }
        
        .content-header h2 {
          margin: 0 0 5px 0;
          color: #2c3e50;
        }
        
        .content-header p {
          margin: 0;
          color: #7f8c8d;
        }
        
        .dashboard-card {
          padding: 20px;
        }
        
        .dashboard-card h3 {
          margin-top: 0;
          color: #2c3e50;
        }
        
        .notification-form {
          display: flex;
          flex-direction: column;
          gap: 15px;
          max-width: 600px;
        }
        
        .form-row {
          display: flex;
          gap: 15px;
        }
        
        .form-row .form-group {
          flex: 1;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
        }
        
        .form-group label {
          margin-bottom: 5px;
          font-weight: 500;
          color: #2c3e50;
        }
        
        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-family: inherit;
        }
        
        .form-group textarea {
          min-height: 100px;
          resize: vertical;
        }
        
        .notifications-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        
        .notification-item {
          border-left: 4px solid;
          padding: 15px;
          background-color: #f8f9fa;
          border-radius: 4px;
        }
        
        .notification-item.info {
          border-left-color: #3498db;
        }
        
        .notification-item.success {
          border-left-color: #2ecc71;
        }
        
        .notification-item.warning {
          border-left-color: #f39c12;
        }
        
        .notification-item.error {
          border-left-color: #e74c3c;
        }
        
        .notification-item.unread {
          background-color: #edf2f7;
        }
        
        .notification-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        
        .notification-header h4 {
          margin: 0;
          color: #2c3e50;
        }
        
        .badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          text-transform: capitalize;
        }
        
        .badge.info {
          background-color: #ebf5fb;
          color: #3498db;
        }
        
        .badge.success {
          background-color: #eafaf1;
          color: #2ecc71;
        }
        
        .badge.warning {
          background-color: #fef9e7;
          color: #f39c12;
        }
        
        .badge.error {
          background-color: #fdedec;
          color: #e74c3c;
        }
        
        .notification-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 10px;
          font-size: 14px;
        }
        
        .date {
          color: #7f8c8d;
        }
        
        .actions {
          display: flex;
          gap: 10px;
        }
        
        .table-container {
          overflow-x: auto;
        }
        
        .data-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .data-table th,
        .data-table td {
          padding: 12px 15px;
          text-align: left;
          border-bottom: 1px solid #e1e4e8;
        }
        
        .data-table th {
          background-color: #f8f9fa;
          font-weight: 600;
          color: #2c3e50;
        }
        
        .data-table tr:hover {
          background-color: #f8f9fa;
        }
        
        .status-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .status-badge.active {
          background-color: #eafaf1;
          color: #2ecc71;
        }
        
        .status-badge.inactive {
          background-color: #fdedec;
          color: #e74c3c;
        }
        
        .btn {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s;
        }
        
        .btn-primary {
          background-color: #3498db;
          color: white;
        }
        
        .btn-primary:hover {
          background-color: #2980b9;
        }
        
        .btn-secondary {
          background-color: #95a5a6;
          color: white;
        }
        
        .btn-secondary:hover {
          background-color: #7f8c8d;
        }
        
        .btn-danger {
          background-color: #e74c3c;
          color: white;
        }
        
        .btn-danger:hover {
          background-color: #c0392b;
        }
        
        .btn-outline {
          background-color: transparent;
          border: 1px solid #95a5a6;
          color: #7f8c8d;
        }
        
        .btn-outline:hover {
          background-color: #f8f9fa;
        }
        
        .btn-sm {
          padding: 5px 10px;
          font-size: 12px;
        }
        
        .no-data {
          text-align: center;
          color: #7f8c8d;
          padding: 20px;
        }
        
        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 200px;
          font-size: 18px;
          color: #7f8c8d;
        }
      `}</style>
    </div>
  );
};

export default AdminNotifications;