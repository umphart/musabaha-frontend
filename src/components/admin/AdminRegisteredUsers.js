// src/components/admin/AdminRegisteredUsers.js
import React, { useState, useEffect } from "react";

const AdminRegisteredUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalType, setModalType] = useState(null); // "docs" | "details"

  const API_BASE_URL = "https://musabaha-home-ltd.onrender.com/api";
  const BASE_URL = "https://musabaha-home-ltd.onrender.com";

  const getAuthToken = () => localStorage.getItem("adminToken");

  // Simplified function to get file URL
  const getFileUrl = (filePath) => {
    if (!filePath) return null;
    
    console.log("File path from DB:", filePath);
    
    // If it's already a full URL, return as is
    if (filePath.startsWith('http')) {
      return filePath;
    }
    
    // If it contains backslashes (Windows path), extract filename
    if (filePath.includes('\\')) {
      const filename = filePath.split('\\').pop();
      console.log("Extracted filename from Windows path:", filename);
      return `${BASE_URL}/uploads/${encodeURIComponent(filename)}`;
    }
    
    // If it contains forward slashes but not http (Unix path), extract filename
    if (filePath.includes('/') && !filePath.startsWith('http')) {
      const filename = filePath.split('/').pop();
      console.log("Extracted filename from Unix path:", filename);
      return `${BASE_URL}/uploads/${encodeURIComponent(filename)}`;
    }
    
    // If it's just a filename, use it directly
    console.log("Using as filename:", filePath);
    return `${BASE_URL}/uploads/${encodeURIComponent(filePath)}`;
  };

  // Test if a file exists
  const testFileExists = async (url) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      console.log(`File ${url} exists:`, response.ok);
      return response.ok;
    } catch (error) {
      console.log(`File ${url} check failed:`, error);
      return false;
    }
  };

  // Fetch all registered users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/subscriptions/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch users");

      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      } else {
        setError(data.message || "Failed to fetch users");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to fetch users. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Approve user
  const approveUser = async (id) => {
    try {
      const token = getAuthToken();
      const response = await fetch(
        `${API_BASE_URL}/subscriptions/${id}/approve`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to approve user");

      const data = await response.json();
      if (data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === id ? { ...u, status: "approved" } : u))
        );
      }
    } catch (err) {
      console.error("Error approving user:", err);
      alert("Could not approve user. Please try again.");
    }
  };

  // Reject user
  const rejectUser = async (id) => {
    try {
      const token = getAuthToken();
      const response = await fetch(
        `${API_BASE_URL}/subscriptions/${id}/reject`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to reject user");

      const data = await response.json();
      if (data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === id ? { ...u, status: "rejected" } : u))
        );
      }
    } catch (err) {
      console.error("Error rejecting user:", err);
      alert("Could not reject user. Please try again.");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Debug file access when modal opens
  useEffect(() => {
    if (selectedUser && modalType === "docs") {
      console.log("=== DEBUGGING FILE PATHS ===");
      console.log("Selected user:", selectedUser.name);
      
      const files = {
        passport: selectedUser.passport_photo,
        identification: selectedUser.identification_file,
        utility: selectedUser.utility_bill_file,
        signature: selectedUser.signature_file
      };
      
      Object.entries(files).forEach(([type, path]) => {
        if (path) {
          const url = getFileUrl(path);
          console.log(`${type} URL:`, url);
          testFileExists(url);
        }
      });
    }
  }, [selectedUser, modalType]);

  // Modal close
  const closeModal = () => {
    setSelectedUser(null);
    setModalType(null);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading registered users...</p>
      </div>
    );
  }

  return (
    <div className="admin-users">
      <h2>Registered Users</h2>

      {error && (
        <div className="alert alert-error">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}

      <table className="users-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Email</th>
            <th>Telephone</th>
            <th>Occupation</th>
            <th>Estate</th>
            <th>Plots</th>
            <th>Status</th>
            <th style={{ textAlign: "center" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="9" style={{ textAlign: "center" }}>
                No registered users found.
              </td>
            </tr>
          ) : (
            users.map((user, index) => (
              <tr key={user.id}>
                <td>{index + 1}</td>
                <td>{user.name || "-"}</td>
                <td>{user.email || "-"}</td>
                <td>{user.telephone || "-"}</td>
                <td>{user.occupation || "-"}</td>
                <td>{user.estate_name || "-"}</td>
                <td>{user.number_of_plots || 0}</td>
                <td>
                  <span
                    className={`status-badge ${
                      user.status === "approved"
                        ? "approved"
                        : user.status === "rejected"
                        ? "rejected"
                        : "pending"
                    }`}
                  >
                    {user.status || "pending"}
                  </span>
                </td>
                <td className="action-buttons">
                  <button
                    className="icon-btn"
                    title="View Documents"
                    onClick={() => {
                      setSelectedUser(user);
                      setModalType("docs");
                    }}
                  >
                    <i className="fas fa-file-alt"></i>
                  </button>
                  <button
                    className="icon-btn"
                    title="View Details"
                    onClick={() => {
                      setSelectedUser(user);
                      setModalType("details");
                    }}
                  >
                    <i className="fas fa-eye"></i>
                  </button>
                  {user.status !== "approved" && (
                    <button
                      className="icon-btn approve"
                      title="Approve User"
                      onClick={() => approveUser(user.id)}
                    >
                      <i className="fas fa-user-check"></i>
                    </button>
                  )}
                  {user.status !== "rejected" && (
                    <button
                      className="icon-btn reject"
                      title="Reject User"
                      onClick={() => rejectUser(user.id)}
                    >
                      <i className="fas fa-user-times"></i>
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* MODAL */}
      {selectedUser && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              ×
            </button>

            {modalType === "docs" && (
              <div className="docs-modal">
                <h3>
                  <i className="fas fa-file-alt"></i> Uploaded Documents
                </h3>
                <ul className="doc-list">
                  {selectedUser.passport_photo && (
                    <li>
                      <span>📸 Passport Photo</span>
                      <a
                        href={getFileUrl(selectedUser.passport_photo)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="doc-link"
                        onClick={(e) => {
                          e.preventDefault();
                          window.open(getFileUrl(selectedUser.passport_photo), '_blank');
                        }}
                      >
                        <i className="fas fa-eye"></i> View
                      </a>
                    </li>
                  )}
                  {selectedUser.identification_file && (
                    <li>
                      <span>🪪 Identification</span>
                      <a
                        href={getFileUrl(selectedUser.identification_file)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="doc-link"
                        onClick={(e) => {
                          e.preventDefault();
                          window.open(getFileUrl(selectedUser.identification_file), '_blank');
                        }}
                      >
                        <i className="fas fa-eye"></i> View
                      </a>
                    </li>
                  )}
                  {selectedUser.utility_bill_file && (
                    <li>
                      <span>💡 Utility Bill</span>
                      <a
                        href={getFileUrl(selectedUser.utility_bill_file)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="doc-link"
                        onClick={(e) => {
                          e.preventDefault();
                          window.open(getFileUrl(selectedUser.utility_bill_file), '_blank');
                        }}
                      >
                        <i className="fas fa-eye"></i> View
                      </a>
                    </li>
                  )}
                  {selectedUser.signature_file && (
                    <li>
                      <span>✍️ Signature</span>
                      <a
                        href={getFileUrl(selectedUser.signature_file)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="doc-link"
                        onClick={(e) => {
                          e.preventDefault();
                          window.open(getFileUrl(selectedUser.signature_file), '_blank');
                        }}
                      >
                        <i className="fas fa-eye"></i> View
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            )}

            {modalType === "details" && (
              <>
                <h3>
                  <i className="fas fa-user"></i> User Details
                </h3>
                <div className="details-grid">
                  {Object.entries(selectedUser).map(([key, value]) => (
                    <div key={key} className="detail-row">
                      <strong>{key}:</strong> {value || "-"}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRegisteredUsers;