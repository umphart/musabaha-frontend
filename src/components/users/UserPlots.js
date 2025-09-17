import React, { useState, useEffect } from 'react';
import { FiX, FiCreditCard, FiCalendar, FiFileText, FiDollarSign, FiBank, FiUpload, 
  FiUser, FiPhone, FiHome, FiLayers } from 'react-icons/fi';
import Swal from 'sweetalert2'; 
import 'animate.css';

const UserPlots = ({ user }) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]); 
  const [error, setError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [paymentData, setPaymentData] = useState({
    amountSent: '',
    paymentMethod: 'bank_transfer',
    transactionDate: new Date().toISOString().split('T')[0],
    transactionReference: '',
    notes: '',
    receiptFile: null,
    confirmed: false
  });
  // utils inside UserPlots.js
const formatCurrency = (value) => {
  if (!value || isNaN(value)) return "₦0";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(Number(value));
};


  const styles = {
    profileContainer: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    },
    subscriptionsSection: {
      marginTop: '30px'
    },
    subscriptionsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '20px',
      marginTop: '20px'
    },
    subscriptionCard: {
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '20px',
      background: '#fff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    },
    subscriptionDetails: {
      marginBottom: '15px',
      flexGrow: 1
    },
    subscriptionDetailsP: {
      margin: '8px 0',
      fontSize: '14px',
      lineHeight: '1.4'
    },
    subscriptionActions: {
      display: 'flex',
      gap: '10px',
      marginTop: 'auto',
      paddingTop: '15px',
      borderTop: '1px solid #eee'
    },
    buttonSuccess: {
      padding: '8px 16px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      backgroundColor: '#28a745',
      color: 'white',
      fontSize: '14px',
      flex: 1
    },
    buttonWarning: {
      padding: '8px 16px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      backgroundColor: '#ffc107',
      color: 'black',
      fontSize: '14px',
      flex: 1
    },
    errorMessage: {
      color: '#dc3545',
      padding: '10px',
      background: '#f8d7da',
      border: '1px solid #f5c6cb',
      borderRadius: '4px',
      marginBottom: '15px'
    },
    loadingText: {
      textAlign: 'center',
      padding: '20px',
      fontSize: '18px'
    },
    statusBadge: {
      display: 'inline-block',
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: 'bold',
      marginLeft: '8px'
    },
    statusPending: {
      backgroundColor: '#fff3cd',
      color: '#856404'
    },
    statusApproved: {
      backgroundColor: '#d4edda',
      color: '#155724'
    },
    statusRejected: {
      backgroundColor: '#f8d7da',
      color: '#721c24'
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '15px'
    },
    subscriptionId: {
      color: '#6c757d',
      fontSize: '14px',
      margin: 0
    },
    estateName: {
      margin: '0 0 10px 0',
      color: '#2c3e50',
      fontSize: '18px'
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: '8px',
      width: '90%',
      maxWidth: '600px',
      maxHeight: '90vh',
      overflow: 'auto',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
    },
    modalHeader: {
      padding: '20px',
      borderBottom: '1px solid #eee',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    modalBody: {
      padding: '20px'
    },
    modalClose: {
      background: 'none',
      border: 'none',
      fontSize: '24px',
      cursor: 'pointer',
      color: '#999'
    },
    paymentSummary: {
      backgroundColor: '#f8f9fa',
      padding: '15px',
      borderRadius: '6px',
      marginBottom: '20px'
    },
    paymentForm: {
      display: 'grid',
      gap: '15px'
    },
    formGroup: {
      marginBottom: '15px'
    },
    label: {
      display: 'block',
      marginBottom: '5px',
      fontWeight: 'bold'
    },
    input: {
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '16px',
      boxSizing: 'border-box'
    },
    textarea: {
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '16px',
      minHeight: '80px',
      resize: 'vertical',
      boxSizing: 'border-box'
    },
    select: {
      width: '100%',
      padding: '10px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      fontSize: '16px'
    },
    submitButton: {
      padding: '12px 20px',
      backgroundColor: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      marginTop: '10px'
    },
    accountDetails: {
      backgroundColor: '#e8f4f8',
      padding: '15px',
      borderRadius: '6px',
      marginBottom: '20px',
      border: '1px solid #b8d8e6'
    },
    accountInfo: {
      marginBottom: '10px'
    },
    note: {
      fontSize: '14px',
      color: '#2c5282',
      fontStyle: 'italic',
      margin: '10px 0 0 0'
    },
    fileInfo: {
      fontSize: '14px',
      color: '#4a5568',
      margin: '5px 0 0 0',
      fontStyle: 'italic'
    },
    confirmation: {
      margin: '15px 0',
      padding: '10px',
      backgroundColor: '#f7fafc',
      borderRadius: '4px',
      border: '1px solid #e2e8f0'
    },
    checkboxLabel: {
      display: 'flex',
      alignItems: 'center',
      fontSize: '14px',
      cursor: 'pointer'
    }
  };

 useEffect(() => {
  const fetchSubscriptions = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/subscriptions?email=${user.email}`);
      const result = await response.json();
      
      if (result.success) {
        // First set subscriptions
        setSubscriptions(result.data);
        
        // Then fetch payments for these subscriptions
        const paymentsResponse = await fetch(
          `http://localhost:5000/api/user-payments/user/${user.id}`
        );
        const paymentsData = await paymentsResponse.json();
        
        if (paymentsData.success) {
          setPayments(paymentsData.payments);
          
          // Enrich subscriptions with payment status
          const subscriptionsWithPaymentStatus = result.data.map(subscription => {
            // Find payment for this subscription
            const paymentForSubscription = paymentsData.payments.find(
              payment => payment.subscription_id === subscription.id
            );
            
            return {
              ...subscription,
              payment: paymentForSubscription || null
            };
          });
          
          setSubscriptions(subscriptionsWithPaymentStatus);
        }
      } else {
        setError('Failed to fetch subscriptions');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Error loading subscription data');
    } finally {
      setLoading(false);
    }
  };

  if (user?.email && user?.id) {
    fetchSubscriptions();
  }
}, [user]);

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return { ...styles.statusBadge, ...styles.statusApproved };
      case 'rejected':
        return { ...styles.statusBadge, ...styles.statusRejected };
      default:
        return { ...styles.statusBadge, ...styles.statusPending };
    }
  };

const handleProceedToPayment = (subscription) => {
  // Show confirmation alert
  Swal.fire({
    title: 'Payment Instructions',
    html: `
      <div style="text-align: left;">
        <p><strong>Bank Details:</strong></p>
        <p>Bank Name: Moniepoint Microfinance</p>
        <p>Account Name: Musabaha Homes LTD</p>
        <p>Account Number: 814567887</p>
        <br>
        <p><strong>Initial Deposit:</strong> ${formatCurrency(subscription.price * 0.25)}</p>
        <p><strong>Total Price:</strong> ${formatCurrency(subscription.price)}</p>
      </div>
    `,
    icon: 'info',
    confirmButtonText: 'I Understand',
    confirmButtonColor: '#2b6cb0',
    showCancelButton: true,
    cancelButtonText: 'Cancel',
    width: '600px'
  }).then((result) => {
    if (result.isConfirmed) {
      setSelectedSubscription(subscription);
      const initialAmount = calculateInitialPaymentAmount(subscription);
      setPaymentData({
        amountSent: initialAmount,
        paymentMethod: 'bank_transfer',
        transactionDate: new Date().toISOString().split('T')[0],
        transactionReference: '',
        notes: '',
        receiptFile: null,
        confirmed: false
      });
      setShowPaymentModal(true);
    }
  });
};

  const calculateInitialPaymentAmount = (subscription) => {
    const plotPrice = parseFloat(subscription.price) / subscription.number_of_plots;
    return (subscription.number_of_plots * plotPrice * 0.3).toFixed(2); // 30% initial payment
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('name', selectedSubscription.name);
      formData.append('contact', selectedSubscription.telephone);
      formData.append('subscriptionId', selectedSubscription.id);
      formData.append('userId', user.id);
       formData.append('plotId', selectedSubscription.plot_id);
      formData.append('paymentMethod', paymentData.paymentMethod);
      formData.append('transactionDate', paymentData.transactionDate);
      formData.append('transactionReference', paymentData.transactionReference);
      formData.append('notes', paymentData.notes);
      formData.append('confirmed', paymentData.confirmed);
      formData.append('plotSize', selectedSubscription.plot_size);
      formData.append('numberOfPlots', selectedSubscription.number_of_plots);
      formData.append('totalPrice', selectedSubscription.price);
      formData.append('outstandingBalance', selectedSubscription.price * 0.75);
      formData.append('amount', selectedSubscription.price * 0.25);
      
      if (paymentData.receiptFile) {
        formData.append('receipt', paymentData.receiptFile);
      }
      
      console.log('Submitting payment data:');
      for (let [key, value] of formData.entries()) {
        console.log(key + ': ' + value);
      }

      // Submit payment to backend
      const response = await fetch('https://musabaha-home-ltd.onrender.com/api/user-payments', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      console.log('Payment submission result:', result);
      
      if (result.success) {
        // SweetAlert success notification
        Swal.fire({
          title: 'Success!',
          text: 'Payment submitted successfully!',
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#2b6cb0',
          timer: 3000,
          timerProgressBar: true,
          showClass: {
            popup: 'animate__animated animate__fadeInDown'
          },
          hideClass: {
            popup: 'animate__animated animate__fadeOutUp'
          }
        });
        
        setShowPaymentModal(false);
        // Reset payment data
        setPaymentData({
          paymentMethod: '',
          transactionDate: '',
          transactionReference: '',
          notes: '',
          confirmed: false,
          receiptFile: null
        });
        
        // Refresh subscriptions to update status
        const subscriptionsResponse = await fetch(`https://musabaha-home-ltd.onrender.com/api/subscriptions?email=${user.email}`);
        const subscriptionsResult = await subscriptionsResponse.json();
        if (subscriptionsResult.success) {
          setSubscriptions(subscriptionsResult.data);
        }
      } else {
        // SweetAlert error notification
        Swal.fire({
          title: 'Error!',
          text: 'Payment submission failed: ' + result.message,
          icon: 'error',
          confirmButtonText: 'Try Again',
          confirmButtonColor: '#dc3545'
        });
      }
    } catch (error) {
      console.error('Error submitting payment:', error);
      // SweetAlert error notification
      Swal.fire({
        title: 'Error!',
        text: 'Error submitting payment. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#dc3545'
      });
    }
  };

  if (loading) {
    return (
      <div style={styles.profileContainer}>
        <div style={styles.loadingText}>Loading subscriptions...</div>
      </div>
    );
  }

  return (
    <div style={styles.profileContainer}>
      <h2>Plots Management</h2>

      {/* Subscription Records */}
<div style={styles.subscriptionsGrid}>
  {subscriptions.map((subscription) => (
    <div key={subscription.id} style={styles.subscriptionCard}>
      <div style={styles.cardHeader}>
        <h4 style={styles.estateName}>{subscription.estate_name}</h4>
        <span style={getStatusStyle(subscription.status)}>
          {subscription.status}
        </span>
      </div>
      <p style={styles.subscriptionId}>ID: #{subscription.id}</p>

      <div style={styles.subscriptionDetails}>
        <p style={styles.subscriptionDetailsP}><strong>Plots:</strong> {subscription.number_of_plots}</p>
        <p style={styles.subscriptionDetailsP}><strong>Plot Size:</strong> {subscription.plot_size}</p>
        <p style={styles.subscriptionDetailsP}><strong>Price:</strong> {subscription.price}</p>
        <p style={styles.subscriptionDetailsP}><strong>Payment Terms:</strong> {subscription.payment_terms}</p>
        <p style={styles.subscriptionDetailsP}><strong>Submitted:</strong> {new Date(subscription.created_at).toLocaleDateString()}</p>
        {/* Payment Status Information */}
        {subscription.payment && (
          <>
            <p style={styles.subscriptionDetailsP}>
              <strong>Payment Status:</strong> 
              <span style={getStatusStyle(subscription.payment.status)}>
                {subscription.payment.status || 'Pending'}
              </span>
            </p>
            {subscription.payment.amount && (
              <p style={styles.subscriptionDetailsP}>
                <strong>Amount Paid:</strong> {formatCurrency(subscription.payment.amount)}
              </p>
            )}
            {subscription.payment.transaction_reference && (
              <p style={styles.subscriptionDetailsP}>
                <strong>Reference:</strong> {subscription.payment.transaction_reference}
              </p>
            )}
          </>
        )}
      </div>

<div style={styles.subscriptionActions}>
  {/* Only show "Proceed to Payment" if subscription is approved AND no payment exists */}
  {subscription.status?.toLowerCase() === "approved" && !subscription.payment && (
    <button
      style={styles.buttonSuccess}
      onClick={() => handleProceedToPayment(subscription)}
    >
      Proceed to Payment
    </button>
  )}

  {/* Show disabled button if payment is approved/completed */}
  {subscription.payment && 
   (subscription.payment.status?.toLowerCase() === "approved" || 
    subscription.payment.status?.toLowerCase() === "completed") && (
    <button 
      style={{ ...styles.buttonSuccess, backgroundColor: "#6c757d", cursor: "not-allowed" }} 
      disabled
    >
      Payment Approved
    </button>
  )}

  {/* For approved subscriptions with pending payment - ONLY show "Waiting Approval" */}
  {subscription.status?.toLowerCase() === "approved" && 
   subscription.payment && 
   subscription.payment.status?.toLowerCase() === "pending" && (
    <button style={{...styles.buttonWarning, cursor: "not-allowed"}} disabled>
      Waiting Approval
    </button>
  )}
  
  {/* For approved subscriptions with rejected payment */}
  {subscription.status?.toLowerCase() === "approved" && 
   subscription.payment && 
   subscription.payment.status?.toLowerCase() === "rejected" && (
    <button style={{...styles.buttonWarning, backgroundColor: "#dc3545", color: "white", cursor: "not-allowed"}} disabled>
      Payment Rejected
    </button>
  )}

  {/* For pending/rejected subscriptions without payment */}
  {(!subscription.status || subscription.status.toLowerCase() !== "approved") && 
   !subscription.payment && (
    <button style={styles.buttonWarning}>Cancel</button>
  )}
</div>
    </div>
  ))}
</div>
{showPaymentModal && selectedSubscription && ( 
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    animation: 'fadeIn 0.3s ease-in-out'
  }} onClick={() => setShowPaymentModal(false)}>
    
    <div style={{
      background: '#fff',
      borderRadius: '16px',
      padding: '24px',
      width: '700px',
      maxHeight: '90vh',
      overflowY: 'auto',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
      animation: 'slideUp 0.4s ease'
    }} onClick={(e) => e.stopPropagation()}>
      
      {/* Header with Account Details */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #eee',
        paddingBottom: '10px',
        marginBottom: '20px'
      }}>
        <h3 style={{margin: 0, color: '#2d3748', display: 'flex', alignItems: 'center', gap: '3px'}}>
          <FiCreditCard />Payment
        </h3>
        <div style={{
          textAlign: 'right',
          fontSize: '13px',
          color: '#2b6cb0',
          fontWeight: '600'
        }}>
          <div>Bank Name: Moniepoint Microfinance <br/>
          Account Name: Musabaha Homes LTD Account Number: 814567887</div>
        </div>
      </div>

      {/* Body */}
      <div>
        <form onSubmit={handlePaymentSubmit} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          
          {/* User Info in 2-column grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px'
          }}>
            {/* Column 1 */}
            <div style={{display: 'flex', flexDirection: 'column', gap: '6px'}}>
              <label style={{fontWeight: 600, fontSize: '14px', color: '#4a5568'}}>
                <FiUser /> Name
              </label>
              <input 
                type="text" 
                value={selectedSubscription.name || ""} 
                disabled 
                style={{
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Column 2 */}
            <div style={{display: 'flex', flexDirection: 'column', gap: '6px'}}>
              <label style={{fontWeight: 600, fontSize: '14px', color: '#4a5568'}}>
                <FiPhone /> Contact
              </label>
              <input 
                type="text" 
                value={selectedSubscription.telephone || ""} 
                disabled 
                style={{
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Column 1 */}
            <div style={{display: 'flex', flexDirection: 'column', gap: '6px'}}>
              <label style={{fontWeight: 600, fontSize: '14px', color: '#4a5568'}}>
                <FiHome /> Plots Taken
              </label>
              <input 
                type="text" 
                value={selectedSubscription.number_of_plots || ""} 
                disabled 
                style={{
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Column 2 */}
            <div style={{display: 'flex', flexDirection: 'column', gap: '6px'}}>
              <label style={{fontWeight: 600, fontSize: '14px', color: '#4a5568'}}>
                <FiLayers /> Plot Size
              </label>
              <input 
                type="text" 
                value={selectedSubscription.plot_size || ""} 
                disabled 
                style={{
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Column 1 */}
            <div style={{display: 'flex', flexDirection: 'column', gap: '6px'}}>
              <label style={{fontWeight: 600, fontSize: '14px', color: '#4a5568'}}>
                <FiDollarSign /> Total Price (₦)
              </label>
              <input 
                type="text" 
                value={formatCurrency(selectedSubscription.price) || ""} 
                disabled 
                style={{
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Column 2 */}
            <div style={{display: 'flex', flexDirection: 'column', gap: '6px'}}>
              <label style={{fontWeight: 600, fontSize: '14px', color: '#4a5568'}}>
                <FiDollarSign /> Initial Deposit (₦)
              </label>
              <input 
                type="text" 
                value={
                  selectedSubscription.price 
                    ? formatCurrency(selectedSubscription.price * 0.25) 
                    : ""
                } 
                disabled 
                style={{
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Outstanding Balance - full width */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              gridColumn: 'span 2' // Makes this span both columns
            }}>
              <label style={{fontWeight: 600, fontSize: '14px', color: '#4a5568'}}>
                <FiDollarSign /> Outstanding Balance (₦)
              </label>
              <input 
                type="text" 
                value={
                  selectedSubscription.price 
                    ? formatCurrency(selectedSubscription.price * 0.75) 
                    : ""
                } 
                disabled 
                style={{
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          {/* Payment details in 2-column grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px'
          }}>
            {/* Column 1 */}
            <div style={{display: 'flex', flexDirection: 'column', gap: '6px'}}>
              <label style={{fontWeight: 600, fontSize: '14px', color: '#4a5568'}}>
                <FiCreditCard /> Payment Method
              </label>
              <select
                value={paymentData.paymentMethod}
                onChange={(e) => setPaymentData({...paymentData, paymentMethod: e.target.value})}
                required
                style={{
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  transition: 'border 0.2s, box-shadow 0.2s'
                }}
              >
                <option value="bank_transfer">Bank Transfer</option>
                <option value="card">Credit/Debit Card</option>
                <option value="ussd">USSD</option>
                <option value="bank_deposit">Bank Deposit</option>
                <option value="cash">Cash Deposit</option>
              </select>
            </div>

            {/* Column 2 */}
            <div style={{display: 'flex', flexDirection: 'column', gap: '6px'}}>
              <label style={{fontWeight: 600, fontSize: '14px', color: '#4a5568'}}>
                <FiCalendar /> Transaction Date
              </label>
              <input
                type="date"
                value={paymentData.transactionDate}
                onChange={(e) => setPaymentData({...paymentData, transactionDate: e.target.value})}
                required
                style={{
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  transition: 'border 0.2s, box-shadow 0.2s'
                }}
              />
            </div>

            {/* Transaction Reference - full width */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              gridColumn: 'span 2' // Makes this span both columns
            }}>
              <label style={{fontWeight: 600, fontSize: '14px', color: '#4a5568'}}>
                <FiFileText /> Transaction Reference/Receipt Number
              </label>
              <input
                type="text"
                value={paymentData.transactionReference}
                onChange={(e) => setPaymentData({...paymentData, transactionReference: e.target.value})}
                placeholder="Enter transaction reference or receipt number"
                required
                style={{
                  padding: '10px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '14px',
                  transition: 'border 0.2s, box-shadow 0.2s'
                }}
              />
            </div>
          </div>

          {/* File Upload and Notes (full width) */}
          <div style={{display: 'flex', flexDirection: 'column', gap: '6px'}}>
            <label style={{fontWeight: 600, fontSize: '14px', color: '#4a5568'}}>
              <FiUpload /> Upload Payment Receipt (Optional)
            </label>
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setPaymentData({...paymentData, receiptFile: file});
                }
              }}
              accept=".jpg,.jpeg,.png,.pdf"
              style={{
                padding: '10px 0',
                fontSize: '14px'
              }}
            />
            {paymentData.receiptFile && (
              <p style={{fontSize: '13px', marginTop: '4px', color: '#555'}}>
                Selected file: {paymentData.receiptFile.name}
              </p>
            )}
          </div>

          <div style={{display: 'flex', flexDirection: 'column', gap: '6px'}}>
            <label style={{fontWeight: 600, fontSize: '14px', color: '#4a5568'}}>
              Payment Notes
            </label>
            <textarea
              value={paymentData.notes}
              onChange={(e) => setPaymentData({...paymentData, notes: e.target.value})}
              placeholder="Any additional information about this payment"
              rows="3"
              style={{
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px',
                transition: 'border 0.2s, box-shadow 0.2s'
              }}
            />
          </div>

          {/* Confirmation */}
          <div style={{
            background: '#edf2f7',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '14px'
          }}>
            <label>
              <input
                type="checkbox"
                checked={paymentData.confirmed}
                onChange={(e) => setPaymentData({...paymentData, confirmed: e.target.checked})}
                required
              />
              I confirm that I have made the payment with the details provided above
            </label>
          </div>

          {/* Footer */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '20px'
          }}>
            <button 
              type="button" 
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                background: '#fff',
                border: '1px solid #ccc',
                color: '#333',
                transition: 'background 0.2s, transform 0.1s'
              }}
              onClick={() => setShowPaymentModal(false)}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                background: !paymentData.confirmed ? '#a0aec0' : '#2b6cb0',
                border: 'none',
                color: '#fff',
                transition: 'background 0.2s, transform 0.1s'
              }}
              disabled={!paymentData.confirmed}
            >
              Submit Payment Proof
            </button>
          </div>
        </form>
      </div>
    </div>
    
    {/* Add these styles to your global CSS or a style tag */}
    <style>
      {`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        input:focus, select:focus, textarea:focus {
          outline: none;
          border-color: #2b6cb0;
          box-shadow: 0 0 0 2px rgba(43, 108, 176, 0.2);
        }
        button:hover {
          transform: translateY(-1px);
        }
      `}
    </style>
  </div>
)}

    </div>
  );
};

export default UserPlots;