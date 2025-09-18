import React, { useState, useEffect } from 'react';  
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import Swal from 'sweetalert2';
import { 
  FiSearch, FiPlus, FiFileText, FiDownload, FiX, FiEye, 
  FiEdit, FiTrash2, FiDollarSign, FiCalendar, FiUser, 
  FiHome, FiCreditCard, FiPieChart, FiCheckCircle, FiClock,
  FiCheck, FiAlertCircle
} from 'react-icons/fi';
import './AdminUsers.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
   const [confirmDelete, setConfirmDelete] = useState({ visible: false, userId: null });
  
  
  const [newUser, setNewUser] = useState({
    name: '',
    contact: '',
    plot_taken: '',
    date_taken: '',
    initial_deposit: '',
    price_per_plot: '',
    payment_schedule: 'Monthly',
    total_balance: ''
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [paymentData, setPaymentData] = useState({ 
    amount: '', 
    date: new Date().toISOString().slice(0, 16), 
    note: '',
    admin: ''
  });
 

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://musabaha-home-ltd.onrender.com/api';

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('adminToken');
  };

  // Show SweetAlert2 notifications
  const showAlert = (type, message) => {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
      }
    });

    Toast.fire({
      icon: type,
      title: message
    });
  };

  // Show confirmation dialog
  const showConfirmDialog = (title, text, confirmButtonText = 'Yes') => {
    return Swal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText
    });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditUser(prev => ({ ...prev, [name]: value }));
  };

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      console.log('Fetched users:', data);
      if (data.success) {
        setUsers(data.data);
      } else {
        showAlert('error', data.message || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showAlert('error', 'Failed to fetch users. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const calculateTotalPrice = (pricePerPlotStr) => {
    if (!pricePerPlotStr) return 0;
    return pricePerPlotStr
      .split(",")
      .map(p => parseFloat(p.trim()) || 0)
      .reduce((a, b) => a + b, 0);
  };

  // Calculate totals
  const totalBalance = users.reduce((total, user) => {
    return total + parseFloat(user.total_balance || 0);
  }, 0);

  const totalPlotValue = users.reduce((total, user) => {
    return total + calculateTotalPrice(user.price_per_plot);
  }, 0);

  const totalDeposits = users.reduce((total, user) => {
    return total + parseFloat(user.initial_deposit || 0);
  }, 0);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.plot_taken.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Create user via API
  const handleCreateUser = async (e) => {
    e.preventDefault();

    try {
      const token = getAuthToken();
      const totalPlotPrice = calculateTotalPrice(newUser.price_per_plot);
      const totalBalance = totalPlotPrice - parseFloat(newUser.initial_deposit || 0);

      if (!newUser.name || !newUser.contact || !newUser.plot_taken) {
        showAlert('error', 'Please fill in all required fields.');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newUser,
          total_balance: totalBalance.toString()
        })
      });

      const data = await response.json();

      if (data.success) {
        setShowCreateModal(false);
        setNewUser({
          name: '',
          contact: '',
          plot_taken: '',
          date_taken: '',
          initial_deposit: '',
          price_per_plot: '',
          payment_schedule: 'Monthly',
          total_balance: ''
        });
        showAlert('success', 'User created successfully.');
        fetchUsers(); // Refresh the user list
      } else {
        showAlert('error', data.message || 'Failed to create user.');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      showAlert('error', 'Failed to create user. Please try again.');
    }
  };

  // Add payment via API
  const handleAddPayment = async (userId) => {
    if (!paymentData.amount) {
      showAlert('error', 'Please enter a payment amount.');
      return;
    }

    try {
      const token = getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/admin/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,
          amount: parseFloat(paymentData.amount),
          date: paymentData.date,
          note: paymentData.note,
          admin: paymentData.admin
        })
      });

      const data = await response.json();
console.log('Add payment response:', data);
      if (data.success) {
        setPaymentData({
          amount: '',
          date: new Date().toISOString().slice(0, 16),
          note: '',
          admin: paymentData.admin
        });
        showAlert('success', 'Payment added successfully.');
        fetchUsers(); // Refresh the user list
      } else {
        showAlert('error', data.message || 'Failed to add payment.');
      }
    } catch (error) {
      console.error('Error adding payment:', error);
      showAlert('error', 'Failed to add payment. Please try again.');
    }
  };

  // Fetch payments for a specific user
  const fetchUserPayments = async (userId) => {
    try {
      const token = getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/admin/payments/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched payments for user:', data);
        if (data.success) {
          return data.data;
        }
      }
      return [];
    } catch (error) {
      console.error('Error fetching payments:', error);
      return [];
    }
  };

  const handleViewUser = async (user) => {
    try {
      const payments = await fetchUserPayments(user.id);
      setSelectedUser({ ...user, payments });
      setShowViewModal(true);
    } catch (error) {
      console.error('Error fetching user payments:', error);
      showAlert('error', 'Failed to load user details.');
    }
  };
const handleEditUser = (user) => {
  setEditUser({ ...user });
  setShowEditModal(true);
};


  // Handle delete user

const handleDeleteUser = (userId) => {
  setConfirmDelete({ visible: true, userId });
};

const confirmDeleteUser = async () => {
  const userId = confirmDelete.userId;
  setConfirmDelete({ visible: false, userId: null });

  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (data.success) {
      showAlert("success", "User deleted successfully.");
      fetchUsers();
    } else {
      showAlert("error", data.message || "Failed to delete user.");
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    showAlert("error", "Failed to delete user. Please try again.");
  }
};

  const formatCurrency = (amount) => {
    return `₦${parseFloat(amount || 0).toLocaleString('en-NG')}`;
  };
  const handleUpdateUser = async (e) => {
  e.preventDefault();
  try {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/admin/users/${editUser.id}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editUser),
    });

    const data = await response.json();
    if (data.success) {
      showAlert("success", "User updated successfully.");
      setShowEditModal(false);
      fetchUsers();
    } else {
      showAlert("error", data.message || "Failed to update user.");
    }
  } catch (err) {
    console.error("Error updating user:", err);
    showAlert("error", "Failed to update user.");
  }
};

const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(users);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
    XLSX.writeFile(workbook, 'musabaha_users.xlsx');
    showAlert('success', 'Excel file downloaded successfully.');
  };

const exportToPDF = async () => {
  try {
    // Check if jsPDF is available via window (CDN approach)
    let doc;
    if (window.jspdf) {
      const { jsPDF } = window.jspdf;
      doc = new jsPDF();
    } else {
      doc = new jsPDF();
    }

    // Helper function to load image as base64
    const loadImageAsBase64 = async (path) => {
      try {
        const res = await fetch(path);
        const blob = await res.blob();
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.warn('Could not load logo image:', path);
        return null;
      }
    };

    // Load company logo
    const logo = await loadImageAsBase64("/images/MHL.jpg");

    // Add logo to the PDF
    if (logo) {
      doc.addImage(logo, "JPEG", 14, 5, 20, 20); // Position: x=14, y=5, width=20, height=20
    }

    // Add header information - adjust Y positions to accommodate logo
    doc.setFontSize(18);
    doc.text('MUSABAHA HOMES LTD. - Users Report', logo ? 40 : 14, 15);
    
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, logo ? 40 : 14, 22);
    
    doc.setFontSize(10);
    doc.text(`Total Outstanding Balance: ${formatCurrency(totalBalance)}`, 14, logo ? 35 : 32);
    doc.text(`Total Plot Value: ${formatCurrency(totalPlotValue)}`, 14, logo ? 41 : 38);
    doc.text(`Total Deposits Received: ${formatCurrency(totalDeposits)}`, 14, logo ? 47 : 44);
    
    // Prepare table data
    const tableData = users.map(user => [
      user.name || '',
      user.contact || '',
      user.plot_taken || '',
      user.date_taken || '',
      formatCurrency(calculateTotalPrice(user.price_per_plot)) || '',
      formatCurrency(user.initial_deposit) || '',
      user.price_per_plot ? user.price_per_plot.split(",").map(p => formatCurrency(p.trim())).join(", ") : '',
      user.payment_schedule || '',
      formatCurrency(user.total_balance) || '',
      user.status || ''
    ]);

    // Adjust startY based on whether logo is present
    const startY = logo ? 55 : 50;

    // Check if autoTable is available
    if (typeof doc.autoTable === 'function') {
      // Add table using autoTable
      doc.autoTable({
        head: [['Name', 'Contact', 'Plot Taken', 'Date Taken', 'Total Money to Pay', 'Initial Deposit', 'Price per Plot', 'Payment Schedule', 'Total Balance', 'Status']],
        body: tableData,
        startY: startY,
        styles: { 
          fontSize: 8,
          cellPadding: 1
        },
        headStyles: { 
          fillColor: [44, 62, 80],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240]
        },
        margin: { top: startY }
      });
    } else {
      // Fallback: Create a simple table without autoTable
      showAlert('warning', 'Advanced PDF features not available. Using basic table format.');
      createSimpleTable(doc, tableData, startY);
    }

    // Add company footer information
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('MUSABAHA HOMES LTD. - RC NO.: 8176032', 14, pageHeight - 15);
    doc.text('Contact: +2349064220705, +2349039108853, +2347038192719', 14, pageHeight - 10);

    // Save the PDF
    doc.save('musabaha_users_report.pdf');
    showAlert('success', 'PDF report downloaded successfully.');
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    showAlert('error', 'Failed to generate PDF. Please try again.');
  }
};

// Update the createSimpleTable function to accept startY parameter
const createSimpleTable = (doc, tableData, startY = 50) => {
  const headers = ['Name', 'Contact', 'Plot Taken', 'Date Taken', 'Total Money to Pay', 'Initial Deposit', 'Price per Plot', 'Payment Schedule', 'Total Balance', 'Status'];
  let y = startY;
  
  // Draw headers
  doc.setFillColor(44, 62, 80);
  doc.setTextColor(255, 255, 255);
  doc.rect(14, y, 182, 10, 'F');
  
  let x = 14;
  headers.forEach((header, index) => {
    doc.text(header, x + 2, y + 7);
    x += index === 0 ? 30 : 20; // Adjust column widths
  });
  
  y += 10;
  
  // Draw rows
  doc.setTextColor(0, 0, 0);
  tableData.forEach((row, rowIndex) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    
    x = 14;
    row.forEach((cell, cellIndex) => {
      doc.text(cell.substring(0, 15), x + 2, y + 7); // Limit text length
      x += cellIndex === 0 ? 30 : 20;
    });
    
    y += 10;
  });
};

  const calculateRemainingBalance = (user) => {
    const totalPlotPrice = calculateTotalPrice(user.price_per_plot);
    const totalSubsequentPayments = (user.payments || []).reduce(
      (sum, p) => sum + parseFloat(p.amount || 0),
      0
    );
    const initialDeposit = parseFloat(user.initial_deposit || 0);
    const totalPaid = initialDeposit + totalSubsequentPayments;
    
    return Math.max(0, totalPlotPrice - totalPaid);
  };
  const convertAmountToWords = (amount) => {
    let num = parseFloat(amount);
    if (isNaN(num)) return 'Invalid Amount';
    if (num === 0) return 'Zero Naira';
    
    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', 'Ten', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    const convertLessThanThousand = (n) => {
      if (n === 0) return '';
      let words = '';
      
      // Hundreds
      if (n >= 100) {
        words += units[Math.floor(n / 100)] + ' Hundred ';
        n %= 100;
      }
      
      // Tens and units
      if (n > 0) {
        if (n < 10) {
          words += units[n];
        } else if (n < 20) {
          words += teens[n - 10];
        } else {
          words += tens[Math.floor(n / 10)];
          if (n % 10 > 0) {
            words += ' ' + units[n % 10];
          }
        }
      }
      
      return words;
    };
    
    let words = '';
    let n = Math.floor(num);
    
    // Millions
    if (n >= 1000000) {
      words += convertLessThanThousand(Math.floor(n / 1000000)) + ' Million ';
      n %= 1000000;
    }
    
    // Thousands
    if (n >= 1000) {
      words += convertLessThanThousand(Math.floor(n / 1000)) + ' Thousand ';
      n %= 1000;
    }
    
    // Remainder
    if (n > 0) {
      words += convertLessThanThousand(n);
    }
    
    // Kobo (if needed)
    const kobo = Math.round((num - Math.floor(num)) * 100);
    if (kobo > 0) {
      words += ' Naira and ' + convertLessThanThousand(kobo) + ' Kobo';
    } else {
      words += ' Naira';
    }
    
    return words + ' Only';
  };

   const generateReceipt = async (payment, user) => {
     // Half A4 in landscape (148.5mm x 210mm)
     const doc = new jsPDF({
       orientation: "landscape",
       unit: "mm",
       format: [148.5, 210] // Half A4 landscape
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
 
     // Load logo and background
     const logo = await loadImageAsBase64("/images/MHL.jpg");
     const bg = await loadImageAsBase64("/images/bg.jpg");
 
     // Background image (cover full receipt area)
     doc.addImage(bg, "JPEG", 0, 20, 210, 148.5);
 
     // Logo top-left
     doc.addImage(logo, "JPEG", 10, 17, 25, 25);
 
     // Company Header
     doc.setFontSize(12);
     doc.setFont(undefined, "bold");
     doc.text("MUSABAHA HOMES LTD.", 40, 18);
 
     doc.setFontSize(9);
     doc.setFont(undefined, "normal");
     doc.text("RC NO.: 8176032", 40, 24);
     doc.text("No. 015, City Plaza Along Ring Road Western Bypass", 40, 30);
     doc.text("Along Yankaba Road, Kano State", 40, 34);
 
     doc.text("TEL: +2349064220705, +2349039108853, +2347038192719", 40, 40);
     doc.text("Email: musabahohomesltd@gmail.com", 40, 44);
 
     // Title
     doc.setFontSize(30);
     doc.setFont(undefined, "bold");
     doc.text("CASH RECEIPT", 105, 60, { align: "center" });
 
     // Receipt Number and Date (with time)
     doc.setFontSize(9);
     doc.setFont(undefined, "normal");
     doc.text("No.:", 10, 70);
     doc.line(20, 70, 70, 70);
     doc.text(`${payment.id}`, 22, 69);
 
     doc.text("Date & Time:", 130, 70);
     doc.line(160, 70, 200, 70);
     doc.text(`${new Date(payment.date).toLocaleString("en-NG")}`, 162, 69);
 
     // Received From
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
     doc.text(`Plot(s): ${user.plot_taken} - ${payment.note || "Payment on account"}`, 62, 124);
 
     // Recorded by
     doc.setFont(undefined, "bold");
     doc.text("Recorded by:", 10, 140);
     doc.line(38, 140, 100, 140);
     doc.setFont(undefined, "normal");
     doc.text(payment.admin || payment.recorded_by || "Admin", 40, 139);
 
     // Signature
     doc.setFont(undefined, "bold");
     doc.text("Signature:", 150, 140);
     doc.line(170, 140, 200, 140);
 
     doc.setFontSize(8);
     doc.setFont(undefined, "italic");
     doc.text("For MUSABAHA HOMES LTD.", 170, 145);
 
     // Save PDF
     doc.save(`receipt_${user.name.replace(/\s+/g, "_")}_${payment.id}.pdf`);
     showAlert("success", "Receipt downloaded successfully.");
   };

  if (loading) return (
    <div className="loading">
      <div className="spinner"></div>
      <p>Loading users...</p>
    </div>
  );

  return (
    <div className="admin-content">
     
      <div className="content-header"> 
        <h2><FiUser className="icon" /> User Management</h2>
        
        <div className="header-actions">
          {/* Search box */}
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="  ...Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Export + Add User */}
          <div className="action-buttons">
            <div className="action-item excel" onClick={exportToExcel}>
              <FiDownload className="icon" /> Excel
            </div>
            <div className="action-item pdf" onClick={exportToPDF}>
              <FiFileText className="icon" /> PDF
            </div>
            <div className="action-item add-user" onClick={() => setShowCreateModal(true)}>
              <FiPlus className="icon" /> Add User
            </div>
          </div>
        </div>
      </div>

  {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-icon total-balance">
            <FiDollarSign />
          </div>
          <div className="summary-content">
            <h3>{formatCurrency(totalBalance)}</h3>
            <p>Total Outstanding Balance</p>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-icon total-value">
            <FiHome />
          </div>
          <div className="summary-content">
            <h3>{formatCurrency(totalPlotValue)}</h3>
            <p>Total Plot Value</p>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-icon deposits">
            <FiCreditCard />
          </div>
          <div className="summary-content">
            <h3>{formatCurrency(totalDeposits)}</h3>
            <p>Total Deposits Received</p>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-icon users">
            <FiUser />
          </div>
          <div className="summary-content">
            <h3>{users.length}</h3>
            <p>Total Users</p>
          </div>
        </div>
      </div>

      <div className="content-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>Plot Taken</th>
              <th>Date Taken</th>
              <th>Total money to Pay</th>
              <th>Initial Deposit</th>
              <th>Price per Plot</th>
              <th>Payment Schedule</th>
              <th>Total Balance</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td>
                  {user.name}
              
                </td>
                <td>{user.contact}</td>
                <td>
                  <div className="plot-info">
                    <FiHome className="icon" />
                    <span>{user.plot_taken}</span>
                  </div>
                </td>
                <td>{user.date_taken}</td>
                <td>{formatCurrency(calculateTotalPrice(user.price_per_plot))}</td>
                <td>{formatCurrency(user.initial_deposit)}</td>
                <td>
                  {user.price_per_plot
                    .split(",")
                    .map((price, idx) => (
                      <span key={idx}>
                        {formatCurrency(price.trim())}
                        {idx < user.price_per_plot.split(",").length - 1 && ", "}
                      </span>
                    ))}
                </td>
                <td>
                  <div className="payment-schedule">
                    <FiCalendar className="icon" />
                    <span>{user.payment_schedule}</span>
                  </div>
                </td>
                <td>
                  <div className={`balance ${parseFloat(user.total_balance) === 0 ? 'paid' : ''}`}>
                    {formatCurrency(user.total_balance)}
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${user.status.toLowerCase()}`}>
                    {user.status === 'Completed' && <FiCheckCircle className="icon" />}
                    {user.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <FiEye className="action-icon view" onClick={() => handleViewUser(user)} />
                    <FiEdit className="action-icon edit" onClick={() => handleEditUser(user)} />
                    <FiTrash2 className="action-icon delete" onClick={() => handleDeleteUser(user.id)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FiUser className="icon" /> Add New User</h3>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreateUser}>
                <div className="form-group">
                  <label><FiUser className="icon" /> Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={newUser.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label><FiCalendar className="icon" /> Contact *</label>
                  <input
                    type="text"
                    name="contact"
                    value={newUser.contact}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label><FiHome className="icon" /> Plot Taken *</label>
                  <input
                    type="text"
                    name="plot_taken"
                    value={newUser.plot_taken}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label><FiCalendar className="icon" /> Date Taken *</label>
                  <input
                    type="date"
                    name="date_taken"
                    value={newUser.date_taken}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label><FiDollarSign className="icon" /> Price per Plot (₦) *</label>
                  <input
                    type="text"
                    name="price_per_plot"
                    value={newUser.price_per_plot}
                    onChange={handleInputChange}
                    placeholder="e.g. 2000000,400000"
                    required
                  />
                </div>
                <div className="form-group">
                  <label><FiDollarSign className="icon" /> Total Price Plots (₦) *</label>
                  <input
                    type="text"
                    value={formatCurrency(calculateTotalPrice(newUser.price_per_plot))}
                    disabled
                  />
                </div>
                <div className="form-group">
                  <label><FiDollarSign className="icon" /> Initial Deposit (₦) *</label>
                  <input
                    type="number"
                    name="initial_deposit"
                    value={newUser.initial_deposit}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label><FiPieChart className="icon" /> Payment Schedule *</label>
                  <select
                    name="payment_schedule"
                    value={newUser.payment_schedule}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Bi-Annual">Bi-Annual</option>
                    <option value="Annual">Annual</option>
                  </select>
                </div>
                <div className="form-group">
                  <label><FiDollarSign className="icon" /> Remaining Balance (₦)</label>
                  <input
                    type="text"
                    value={formatCurrency(calculateTotalPrice(newUser.price_per_plot) - parseFloat(newUser.initial_deposit || 0))}
                    disabled
                  />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Edit User Modal */}
{showEditModal && editUser && (
  <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h3><FiEdit className="icon" /> Edit User</h3>
        <button className="modal-close" onClick={() => setShowEditModal(false)}>
          <FiX />
        </button>
      </div>
      <div className="modal-body">
        <form onSubmit={handleUpdateUser}>
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              name="name"
              value={editUser.name}
              onChange={handleEditInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Contact *</label>
            <input
              type="text"
              name="contact"
              value={editUser.contact}
              onChange={handleEditInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Plot Taken *</label>
            <input
              type="text"
              name="plot_taken"
              value={editUser.plot_taken}
              onChange={handleEditInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Date Taken *</label>
            <input
              type="date"
              name="date_taken"
              value={editUser.date_taken}
              onChange={handleEditInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Price per Plot *</label>
            <input
              type="text"
              name="price_per_plot"
              value={editUser.price_per_plot}
              onChange={handleEditInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Initial Deposit *</label>
            <input
              type="number"
              name="initial_deposit"
              value={editUser.initial_deposit}
              onChange={handleEditInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Payment Schedule *</label>
            <select
              name="payment_schedule"
              value={editUser.payment_schedule}
              onChange={handleEditInputChange}
              required
            >
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Bi-Annual">Bi-Annual</option>
              <option value="Annual">Annual</option>
            </select>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Update User
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
)}
  
     
      {/* View User Modal with Payment History */}
      {showViewModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FiUser className="icon" /> User Details: {selectedUser.name}</h3>
              <button className="modal-close" onClick={() => setShowViewModal(false)}>
                <FiX />
              </button>
            </div>
            <div className="modal-body">
              <div className="user-details">
                <div className="detail-row">
                  <div className="detail-item">
                    <label>Contact:</label>
                    <span>{selectedUser.contact}</span>
                  </div>
                  <div className="detail-item">
                    <label>Plot Taken:</label>
                    <span>{selectedUser.plot_taken}</span>
                  </div>
                </div>
                <div className="detail-row">
                  <div className="detail-item">
                    <label>Date Taken:</label>
                    <span>{selectedUser.date_taken}</span>
                  </div>
                  <div className="detail-item">
                    <label>Payment Schedule:</label>
                    <span>{selectedUser.payment_schedule}</span>
                  </div>
                </div>
                <div className="detail-row">
                  <div className="detail-item">
                    <label>Total Price:</label>
                    <span className="total-price">{formatCurrency(calculateTotalPrice(selectedUser.price_per_plot))}</span>
                  </div>
                  <div className="detail-item">
                    <label>Initial Deposit:</label>
                    <span className="deposit">{formatCurrency(selectedUser.initial_deposit)}</span>
                  </div>
                </div>
                
                {/* Calculate and display payment summary */}
                {selectedUser.payments && (
                  <div className="payment-summary">
                    <div className="summary-row">
                      <label>Total Subsequent Payments:</label>
                      <span>{formatCurrency(selectedUser.payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0))}</span>
                    </div>
                    <div className="summary-row">
                      <label>Total Paid (Deposit + Payments):</label>
                      <span className="total-paid">
                        {formatCurrency(parseFloat(selectedUser.initial_deposit || 0) + selectedUser.payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0))}
                      </span>
                    </div>
                    <div className="summary-row outstanding">
                      <label>Outstanding Balance:</label>
                      <span className={calculateRemainingBalance(selectedUser) === 0 ? 'paid' : 'pending'}>
                        {formatCurrency(calculateRemainingBalance(selectedUser))}
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="detail-row">
                  <div className="detail-item">
                    <label>Status:</label>
                    <span className={`status-badge ${selectedUser.status.toLowerCase()}`}>
                      {selectedUser.status === 'Completed' && <FiCheckCircle className="icon" />}
                      {selectedUser.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="payment-section">
                <h4><FiDollarSign className="icon" /> Payment History</h4>
                {selectedUser.payments.map(payment => (
                  <div key={payment.id} className="payment-item">
                    <div className="payment-info">
                      <div className="payment-date">
                        <FiClock className="icon" /> 
                        {formatDateTime(payment.date)}
                      </div>
                      <div className="payment-note">{payment.note}</div>
                      <div className="payment-admin">Recorded by: {payment.admin || payment.recorded_by || "Admin"}</div>
                    </div>
                    <div className="payment-actions">
                      <div className="payment-amount">{formatCurrency(payment.amount)}</div>
                      <button 
                        className="btn btn-sm btn-success"
                        onClick={() => generateReceipt(payment, selectedUser)}
                        title="Download Receipt"
                      >
                        <FiFileText />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="add-payment-section">
                <h4><FiPlus className="icon" /> Add New Payment</h4>
                <div className="payment-form">
                  <div className="form-group">
                    <label>Amount (₦) *</label>
                    <input
                      type="number"
                      value={paymentData.amount}
                      onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                      required
                      placeholder="Enter payment amount"
                    />
                  </div>
                  <div className="form-group">
                    <label>Date & Time</label>
                    <input
                      type="datetime-local"
                      value={paymentData.date}
                      onChange={(e) => setPaymentData({...paymentData, date: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Note</label>
                    <input
                      type="text"
                      value={paymentData.note}
                      onChange={(e) => setPaymentData({...paymentData, note: e.target.value})}
                      placeholder="Payment note (e.g., Monthly installment)"
                    />
                  </div>
                  <div className="form-group">
                    <label>Recorded By</label>
                    <input
                      type="text"
                      value={paymentData.admin}
                      onChange={(e) => setPaymentData({...paymentData, admin: e.target.value})}
                      placeholder="Admin name"
                    />
                  </div>
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleAddPayment(selectedUser.id)}
                    disabled={!paymentData.amount}
                  >
                    Add Payment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {confirmDelete.visible && (
  <div className="modal-overlay" onClick={() => setConfirmDelete({ visible: false, userId: null })}>
    <div className="modal-content small" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header danger">
        <h3><FiTrash2 className="icon" /> Confirm Delete</h3>
        <button 
          className="modal-close" 
          onClick={() => setConfirmDelete({ visible: false, userId: null })}
        >
          <FiX />
        </button>
      </div>
      <div className="modal-body">
        <p>Are you sure you want to delete this user? <strong>This action cannot be undone.</strong></p>
      </div>
      <div className="modal-footer">
        <button 
          className="btn btn-danger" 
          onClick={confirmDeleteUser}
        >
          <FiTrash2 className="icon" /> Yes, Delete
        </button>
        <button 
          className="btn btn-secondary" 
          onClick={() => setConfirmDelete({ visible: false, userId: null })}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default AdminUsers;