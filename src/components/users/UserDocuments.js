import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

const UserSubsequentPayments = ({ user }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetchPayments = async () => {
      try {
        const res = await fetch(
          `https://musabaha-home-ltd.onrender.com/api/user-subsequent-payments/user/${user.id}`
        );
        const data = await res.json();
        console.log("Payment data:", data);

        if (data.success) {
          setPayments(data.payments);

          // Optional: show a success message
          Swal.fire({
            icon: "success",
            title: "Payments Loaded",
            text: "Your subsequent payments were fetched successfully.",
            showConfirmButton: false,
            timer: 1500,
          });
        } else {
          console.error("Failed to fetch payments:", data.error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to fetch your payments.",
          });
        }
      } catch (err) {
        console.error("Error fetching payments:", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "An error occurred while fetching payments.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [user]);

  if (loading) {
    return <p>Loading payments...</p>;
  }

  return (
    <div className="documents-container">
      <h2>Subsequent Payments</h2>

      {payments.length === 0 ? (
        <p>No subsequent payments found.</p>
      ) : (
        <table className="payments-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Contact</th>
              <th>Amount (₦)</th>
              <th>Method</th>
              <th>Reference</th>
              <th>Note</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p, idx) => (
              <tr key={p.id}>
                <td>{idx + 1}</td>
                <td>{p.user_name || "N/A"}</td>
                <td>{p.user_contact || "N/A"}</td>
                <td>{Number(p.amount).toLocaleString()}</td>
                <td>{p.payment_method || "N/A"}</td>
                <td>{p.transaction_reference || "N/A"}</td>
                <td>{p.note || p.notes || "-"}</td>
                <td>{new Date(p.created_at).toLocaleDateString()}</td>
            
                <td>
                  <span className={`status-badge ${p.status}`}>
                    {p.status || "pending"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserSubsequentPayments;
