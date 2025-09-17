import React, { useState, useEffect } from "react";

const UserProfile = ({ user, users = [], approveUser, setSelectedUser, setModalType }) => {
  const [subscriptions, setSubscriptions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const styles = {
    profileContainer: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "20px",
      fontFamily: "Arial, sans-serif",
    },
    section: {
      marginBottom: "30px",
      border: "1px solid #ddd",
      borderRadius: "8px",
      overflow: "hidden",
      boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    },
    sectionHeader: {
      backgroundColor: "#007bff",
      color: "#fff",
      padding: "12px 16px",
      fontSize: "18px",
      fontWeight: "bold",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
    },
    th: {
      backgroundColor: "#f9f9f9",
      fontWeight: "bold",
      padding: "8px",
      border: "1px solid #ddd",
      textAlign: "left",
      width: "12.5%", // 1/8th of row
    },
    td: {
      padding: "8px",
      border: "1px solid #ddd",
      textAlign: "left",
      width: "12.5%",
    },
    loadingText: {
      textAlign: "center",
      padding: "20px",
      fontSize: "18px",
    },
    errorMessage: {
      color: "#dc3545",
      padding: "10px",
      background: "#f8d7da",
      border: "1px solid #f5c6cb",
      borderRadius: "4px",
      marginBottom: "15px",
    },
  };

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const response = await fetch(
          `https://musabaha-home-ltd.onrender.com/api/subscriptions?email=${user.email}`
        );
        const result = await response.json();

        if (result.success) {
          const subscription = Array.isArray(result.data)
            ? result.data[0]
            : result.data;
          setSubscriptions(subscription);
        } else {
          setError("Failed to fetch subscriptions");
        }
      } catch (err) {
        setError("Error loading subscription data");
      } finally {
        setLoading(false);
      }
    };

    if (user?.email) {
      fetchSubscriptions();
    }
  }, [user]);

  if (loading) {
    return (
      <div style={styles.profileContainer}>
        <div style={styles.loadingText}>Loading subscriptions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.profileContainer}>
        <div style={styles.errorMessage}>{error}</div>
      </div>
    );
  }

  if (!subscriptions) {
    return (
      <div style={styles.profileContainer}>
        <div style={styles.errorMessage}>No subscription data found.</div>
      </div>
    );
  }

  // Helper to render 4 fields (8 columns)
  const renderRow = (f1, v1, f2, v2, f3, v3, f4, v4) => (
    <tr>
      <th style={styles.th}>{f1}</th><td style={styles.td}>{v1 || "N/A"}</td>
      <th style={styles.th}>{f2}</th><td style={styles.td}>{v2 || "N/A"}</td>
      <th style={styles.th}>{f3}</th><td style={styles.td}>{v3 || "N/A"}</td>
      <th style={styles.th}>{f4}</th><td style={styles.td}>{v4 || "N/A"}</td>
    </tr>
  );

  return (
    <div style={styles.profileContainer}>
      <h2>User Profile</h2>

      {/* Personal Data */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>Personal Data</div>
        <table style={styles.table}>
          <tbody>
            {renderRow("Full Name", subscriptions.name, "Email", subscriptions.email, "Phone", subscriptions.telephone, "Sex", subscriptions.sex)}
            {renderRow("DOB", subscriptions.dob ? new Date(subscriptions.dob).toLocaleDateString() : null, "Nationality", subscriptions.nationality, "State of Origin", subscriptions.state_of_origin, "Occupation", subscriptions.occupation)}
            {renderRow("Residential Address", subscriptions.residential_address, "Postal Address", subscriptions.postal_address, "", "", "", "")}
          </tbody>
        </table>
      </div>

      {/* Alternate Contact */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>Alternate Contact</div>
        <table style={styles.table}>
          <tbody>
            {renderRow("Name", subscriptions.alt_contact_name, "Email", subscriptions.alt_contact_email, "Phone", subscriptions.alt_contact_tel, "Relationship", subscriptions.alt_contact_relationship)}
            {renderRow("Address", subscriptions.alt_contact_address, "", "", "", "", "", "")}
          </tbody>
        </table>
      </div>

      {/* Plot Information */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>Plot Information</div>
        <table style={styles.table}>
          <tbody>
            {renderRow("Estate", subscriptions.estate_name, "No. of Plots", subscriptions.number_of_plots, "Plot Size", subscriptions.plot_size, "Proposed Type", subscriptions.proposed_type)}
            {renderRow("Proposed Use", subscriptions.proposed_use, "Payment Terms", subscriptions.payment_terms, "Status", subscriptions.status, "Created At", subscriptions.created_at ? new Date(subscriptions.created_at).toLocaleString() : null)}
            {renderRow("Updated At", subscriptions.updated_at ? new Date(subscriptions.updated_at).toLocaleString() : null, "", "", "", "", "", "")}
          </tbody>
        </table>
      </div>

      {/* Next of Kin */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>Next of Kin</div>
        <table style={styles.table}>
          <tbody>
            {renderRow("Name", subscriptions.next_of_kin_name, "Email", subscriptions.next_of_kin_email, "Phone", subscriptions.next_of_kin_tel, "Relationship", subscriptions.next_of_kin_relationship)}
            {renderRow("Address", subscriptions.next_of_kin_address, "Occupation", subscriptions.next_of_kin_occupation, "Office Address", subscriptions.next_of_kin_office_address, "", "")}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserProfile;
