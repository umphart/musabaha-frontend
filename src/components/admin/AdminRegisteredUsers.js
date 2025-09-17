// src/components/admin/AdminRegisteredUsers.js
import React, { useState, useEffect } from "react";

const AdminRegisteredUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalType, setModalType] = useState(null); // "docs" | "details"

  const API_BASE_URL =
    process.env.REACT_APP_API_URL || "https://musabaha-home-ltd.onrender.com/api";

  const getAuthToken = () => localStorage.getItem("adminToken");

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
                        href={`${API_BASE_URL.replace(
                          "/api",
                          ""
                        )}/${selectedUser.passport_photo}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="doc-link"
                      >
                        <i className="fas fa-eye"></i>
                      </a>
                    </li>
                  )}
                  {selectedUser.identification_file && (
                    <li>
                      <span>🪪 Identification</span>
                      <a
                        href={`${API_BASE_URL.replace(
                          "/api",
                          ""
                        )}/${selectedUser.identification_file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="doc-link"
                      >
                        <i className="fas fa-eye"></i>
                      </a>
                    </li>
                  )}
                  {selectedUser.utility_bill_file && (
                    <li>
                      <span>💡 Utility Bill</span>
                      <a
                        href={`${API_BASE_URL.replace(
                          "/api",
                          ""
                        )}/${selectedUser.utility_bill_file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="doc-link"
                      >
                        <i className="fas fa-eye"></i>
                      </a>
                    </li>
                  )}
                  {selectedUser.signature_file && (
                    <li>
                      <span>✍️ Signature</span>
                      <a
                        href={`${API_BASE_URL.replace(
                          "/api",
                          ""
                        )}/${selectedUser.signature_file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="doc-link"
                      >
                        <i className="fas fa-eye"></i>
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
