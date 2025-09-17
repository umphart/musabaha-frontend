import React, { useEffect, useState } from "react";
import {
  FiX,
  FiFileText,
  FiPlus,
  FiUser,
  FiEdit,
  FiDollarSign,
  FiClock,
} from "react-icons/fi";
import Swal from "sweetalert2";
import { jsPDF } from "jspdf";


const UserPayments = ({ user }) => {
  const [payments, setPayments] = useState([]);
  const [subsequentPayments, setSubsequentPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState({
    amount: "",
    payment_method: "",
    transaction_reference: "",
    note: "",
    receipt: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // ✅ Fetch main payments
  useEffect(() => {
    if (!user?.id) return;

    const fetchPayments = async () => {
      try {
        const res = await fetch(
          `https://musabaha-home-ltd.onrender.com/api/user-payments/user/${user.id}`
        );
        const data = await res.json();
        if (data.success) {
          setPayments(data.payments);
        }
      } catch (err) {
        console.error("Error fetching payments:", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Could not load payments.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [user]);

  // ✅ Fetch subsequent payments
  useEffect(() => {
    if (!user?.id) return;

    const fetchSubsequentPayments = async () => {
      try {
        const res = await fetch(
          `https://musabaha-home-ltd.onrender.com/api/user-subsequent-payments/user/${user.id}`
        );
        const data = await res.json();
        if (data.success) {
          setSubsequentPayments(data.payments);
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to fetch your subsequent payments.",
          });
        }
      } catch (err) {
        console.error("Error fetching subsequent payments:", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "An error occurred while fetching subsequent payments.",
        });
      }
    };

    fetchSubsequentPayments();
  }, [user]);

  // ✅ Add new subsequent payment
  const handleAddPayment = async () => {
    if (!paymentData.amount) {
      Swal.fire({
        icon: "warning",
        title: "Missing Amount",
        text: "Please enter the payment amount before submitting.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();

      formData.append("amount", paymentData.amount);
      formData.append("payment_method", paymentData.payment_method);
      formData.append("transaction_reference", paymentData.transaction_reference);

      // User info
      formData.append("user_id", selectedPayment.user_id);
      formData.append("user_name", selectedPayment.name);
      formData.append("user_contact", selectedPayment.contact);

      // Plot info
      formData.append("plot_id", selectedPayment.plot_id);
      formData.append("number_of_plots", selectedPayment.number_of_plots);
      formData.append("plot_size", selectedPayment.plot_size);

      // Finance info
      formData.append("total_price", selectedPayment.total_price);
      formData.append("outstanding_balance", selectedPayment.outstanding_balance);

      // Optional
      formData.append("note", paymentData.note || "");
      if (paymentData.receipt) {
        formData.append("receipt", paymentData.receipt);
      }

      const res = await fetch(
        `https://musabaha-home-ltd.onrender.com/api/user-subsequent-payments`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (data.success) {
        // update local subsequent list
        setSubsequentPayments((prev) => [...prev, data.payment]);

        // Reset form
        setPaymentData({
          amount: "",
          payment_method: "",
          transaction_reference: "",
          note: "",
          receipt: null,
        });

        setShowModal(false);

        Swal.fire({
          icon: "success",
          title: "Payment Added",
          text: "Your payment was submitted successfully!",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: data.error || "Failed to add payment",
        });
      }
    } catch (err) {
      console.error("Error adding payment:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while adding the payment.",
      });
    } finally {
      setSubmitting(false);
    }
  };
  const formatCurrency = (amount) => {
  if (!amount) return "₦0";
  return `₦${Number(amount).toLocaleString()}`;
};
const convertAmountToWords = (num) => {
  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen"
  ];
  const b = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
  ];

  const inWords = (n) => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
    if (n < 1000) return a[Math.floor(n / 100)] + " Hundred " + inWords(n % 100);
    if (n < 1000000) return inWords(Math.floor(n / 1000)) + " Thousand " + inWords(n % 1000);
    return n;
  };

  return inWords(Number(num)) + " Naira Only";
};

  const generateReceipt = async (payment, user) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [148.5, 210], // Half A4 landscape
  });

  // Helper: load image as base64
  const loadImageAsBase64 = async (path) => {
    const res = await fetch(path);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  };

  const logo = await loadImageAsBase64("/images/MHL.jpg");
  const bg = await loadImageAsBase64("/images/bg.jpg");

  // Background
  doc.addImage(bg, "JPEG", 0, 20, 210, 148.5);
  // Logo
  doc.addImage(logo, "JPEG", 10, 17, 25, 25);

  // Header
  doc.setFontSize(12).setFont(undefined, "bold");
  doc.text("MUSABAHA HOMES LTD.", 40, 18);

  doc.setFontSize(9).setFont(undefined, "normal");
  doc.text("RC NO.: 8176032", 40, 24);
  doc.text("No. 015, City Plaza Along Ring Road Western Bypass", 40, 30);
  doc.text("Along Yankaba Road, Kano State", 40, 34);
  doc.text("TEL: +2349064220705, +2349039108853, +2347038192719", 40, 40);
  doc.text("Email: musabahohomesltd@gmail.com", 40, 44);

  // Title
  doc.setFontSize(30).setFont(undefined, "bold");
  doc.text("CASH RECEIPT", 105, 60, { align: "center" });

  // Receipt details
  doc.setFontSize(9).setFont(undefined, "normal");
  doc.text("No.:", 10, 70);
  doc.line(20, 70, 70, 70);
  doc.text(`${payment.id}`, 22, 69);

  doc.text("Date & Time:", 130, 70);
  doc.line(160, 70, 200, 70);
  const paymentDate = payment.created_at
  ? new Date(payment.created_at)
  : new Date();

doc.text(paymentDate.toLocaleString("en-NG"), 162, 69);


  // Received from
  doc.setFont(undefined, "bold");
  doc.text("Received from:", 10, 85);
  doc.line(45, 85, 200, 85);
  doc.setFont(undefined, "normal");
  doc.text(user.name, 47, 84);

  // Amount in words
  const amountInWords = convertAmountToWords(payment.amount);
  const splitWords = doc.splitTextToSize(amountInWords, 150);

  doc.setFont(undefined, "bold");
  doc.text("The Sum of:", 10, 100);
  doc.line(40, 100, 200, 100);
  doc.setFont(undefined, "normal");
  doc.text(splitWords, 42, 99);

  // Amount in figures
  doc.setFont(undefined, "bold");
  doc.text("Naira:", 120, 115);
  doc.line(140, 115, 200, 115);
  doc.setFont(undefined, "normal");
  doc.text(`${formatCurrency(payment.amount)}`, 142, 114);

  // Payment For
  doc.setFont(undefined, "bold");
  doc.text("Being payment for:", 10, 125);
  doc.line(60, 125, 200, 125);
  doc.setFont(undefined, "normal");
  doc.text(
    `Plot(s): ${user.number_of_plots || "N/A"} - ${payment.note || "Payment on account"}`,
    62,
    124
  );

  // Recorded by
  doc.setFont(undefined, "bold");
  doc.text("Approved by:", 10, 140);
  doc.line(38, 140, 100, 140);
  doc.setFont(undefined, "normal");
  doc.text(payment.admin || payment.recorded_by  || "Admin", 40, 139);

  // Signature
  doc.setFont(undefined, "bold");
  doc.text("Signature:", 150, 140);
  doc.line(170, 140, 200, 140);

  doc.setFontSize(8).setFont(undefined, "italic");
  doc.text("For MUSABAHA HOMES LTD.", 170, 145);

  // Save file
  doc.save(`receipt_${user.name.replace(/\s+/g, "_")}_${payment.id}.pdf`);

  Swal.fire({
    icon: "success",
    title: "Receipt Generated",
    text: "Receipt downloaded successfully!",
    timer: 2000,
    showConfirmButton: false,
  });
};


  if (loading) {
    return <p>Loading payment history...</p>;
  }

  return (
    <div className="payments-container">
      <h2>Payments</h2>

      {payments.length === 0 ? (
        <p>No payments found.</p>
      ) : (
        <table className="payments-table">
          <thead>
            <tr>
              <th>SN</th>
              <th>Name</th>
              <th>Contact</th>
              <th>Date</th>
              <th>Amount (₦)</th>
              <th>Plot Size</th>
              <th>Plots</th>
              <th>Total Price</th>
              <th>Outstanding</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p, index) => (
              <tr key={p.id}>
                <td>{index + 1}</td>
                <td>{p.name}</td>
                <td>{p.contact}</td>
                <td>
                  {p.created_at
                    ? new Date(p.created_at).toLocaleDateString()
                    : "-"}
                </td>
                <td>{Number(p.amount).toLocaleString()}</td>
                <td>{p.plot_size}</td>
                <td>{p.number_of_plots}</td>
                <td>
                  {p.total_price
                    ? Number(p.total_price).toLocaleString()
                    : "N/A"}
                </td>
                <td>
                  {p.outstanding_balance
                    ? Number(p.outstanding_balance).toLocaleString()
                    : "N/A"}
                </td>
                <td>
                  <span className={`status-badge ${p.status}`}>{p.status}</span>
                </td>
                <td>
                  <button
                    className={`btn btn-sm ${
                      p.status === "approved" ? "btn-success" : "btn-secondary"
                    }`}
                    onClick={() => {
                      if (p.status === "approved") {
                        setSelectedPayment(p);
                        setShowModal(true);
                      }
                    }}
                    disabled={p.status !== "approved"}
                    title={
                      p.status !== "approved"
                        ? "Only approved payments can receive additional payments"
                        : "Add payment"
                    }
                  >
                    <FiEdit />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* ✅ Modal */}
{showModal && selectedPayment && (
  <div className="modal-overlay" onClick={() => setShowModal(false)}>
    <div
      className="modal-content large"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Modal Header */}
      <div className="modal-header">
        <h3>
          <FiUser className="icon" /> User Details: {selectedPayment.name}
        </h3>
        <button className="modal-close" onClick={() => setShowModal(false)}>
          <FiX />
        </button>
      </div>

      <div className="modal-body">
        {/* ✅ User + Plot Details */}
        <div className="user-details">
          <div className="detail-row">
            <div className="detail-item">
              <label>Contact:</label>
              <span>{selectedPayment.contact}</span>
            </div>
            <div className="detail-item">
              <label>Plot Size:</label>
              <span>{selectedPayment.plot_size}</span>
            </div>
          </div>
          <div className="detail-row">
            <div className="detail-item">
              <label>Number of Plots:</label>
              <span>{selectedPayment.number_of_plots}</span>
            </div>
            <div className="detail-item">
              <label>Total Price:</label>
              <span className="total-price">
                ₦{Number(selectedPayment.total_price || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* ✅ Payment Summary */}
        <div className="payment-summary">
          <div className="summary-row">
            <label>Total Paid:</label>
            <span className="total-paid">
              ₦{Number(selectedPayment.amount || 0).toLocaleString()}
            </span>
          </div>
          <div className="summary-row outstanding">
            <label>Outstanding Balance:</label>
            <span
              className={
                selectedPayment.outstanding_balance === 0 ? "paid" : "pending"
              }
            >
              ₦{Number(selectedPayment.outstanding_balance || 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* ✅ Subsequent Payment History */}
        <div className="payment-section">
          <h4>
            <FiDollarSign className="icon" /> Subsequent Payment History
          </h4>
          {subsequentPayments.filter(
            (p) => p.user_id === selectedPayment.user_id
          ).length === 0 ? (
            <p>No previous subsequent payments found.</p>
          ) : (
            subsequentPayments
              .filter((p) => p.user_id === selectedPayment.user_id)
              .map((payment, idx) => (
                <div key={payment.id} className="payment-item">
                  <div className="payment-info">
                    <div className="payment-date">
                      <FiClock className="icon" />{" "}
                      {payment.created_at
                        ? new Date(payment.created_at).toLocaleDateString()
                        : "-"}
                    </div>
                    <div className="payment-note">{payment.user_name || "-"}</div>
                    <div className="payment-method">
                      {payment.payment_method || "N/A"}
                    </div>
                    <div className="payment-status">
                      <span className={`status-badge ${payment.status}`}>
                        {payment.status}
                      </span>
                    </div>
                  </div>
                  <div className="payment-actions">
                    <div className="payment-amount">
                      ₦{Number(payment.amount).toLocaleString()}
                    </div>
                <button
  className={`btn btn-sm ${
    payment.status === "approved" ? "btn-success" : "btn-secondary"
  }`}
  onClick={() => {
    if (payment.status === "approved") {
      generateReceipt(payment, selectedPayment);
    } else {
      Swal.fire({
        icon: "warning",
        title: "Not Approved",
        text: "You cannot generate a receipt until this payment is approved.",
      });
    }
  }}
  disabled={payment.status !== "approved"}
  title={
    payment.status !== "approved"
      ? "Receipt available only after approval"
      : "Generate Receipt"
  }
>
  <FiFileText />
</button>


                  </div>
                </div>
              ))
          )}
        </div>

        {/* ✅ Add New Payment */}
        <div className="add-payment-section">
          <h4>
            <FiPlus className="icon" /> Add New Payment
          </h4>
          <div className="payment-form">
            <div className="form-group">
              <label>Amount (₦) *</label>
              <input
                type="number"
                value={paymentData.amount}
                onChange={(e) =>
                  setPaymentData({ ...paymentData, amount: e.target.value })
                }
                required
                placeholder="Enter payment amount"
              />
            </div>
            <div className="form-group">
              <label>Payment Method *</label>
              <select
                value={paymentData.payment_method}
                onChange={(e) =>
                  setPaymentData({
                    ...paymentData,
                    payment_method: e.target.value,
                  })
                }
                required
              >
                <option value="">Select Method</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Card">Card</option>
                <option value="Cash">Cash</option>
                <option value="Online Transfer">Online Transfer</option>
              </select>
            </div>
            <div className="form-group">
              <label>Transaction Reference *</label>
              <input
                type="text"
                value={paymentData.transaction_reference}
                onChange={(e) =>
                  setPaymentData({
                    ...paymentData,
                    transaction_reference: e.target.value,
                  })
                }
                required
                placeholder="Bank ref no / transaction ID"
              />
            </div>
            <div className="form-group">
              <label>Note</label>
              <textarea
                value={paymentData.note}
                onChange={(e) =>
                  setPaymentData({ ...paymentData, note: e.target.value })
                }
                placeholder="Optional note about this payment"
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>Upload Receipt *</label>
              <input
                type="file"
                accept="image/*,.pdf,.doc,.docx"
                onChange={(e) =>
                  setPaymentData({
                    ...paymentData,
                    receipt: e.target.files[0],
                  })
                }
                required
              />
            </div>

            <button
              className="btn btn-primary"
              onClick={handleAddPayment}
              disabled={
                submitting ||
                !paymentData.amount ||
                !paymentData.payment_method ||
                !paymentData.transaction_reference ||
                !paymentData.receipt
              }
            >
              {submitting ? "Processing..." : "Submit Payment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default UserPayments;
