import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import './App.css';
import MHL from './images/MHL.jpg'; 
import Swal from "sweetalert2";

// Components
import AuthForm from './components/AuthForm';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminLogin from './components/admin/AdminLogin';
import LandingPage from './components/LandingPage';
import Header from './components/Header'; // Import Header component

// Navbar component that only shows when not authenticated
const Navbar = ({ isAuthenticated, user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []); 

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    closeMenu();
    onLogout();
  };

  // Don't render navbar if user is authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <>
      <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
        <div className="navbar-container">
          {/* Logo and Brand */}
          <div className="navbar-brand">
            <img src={MHL} alt="MUSABAHA Logo" className="navbar-logo" />
            <span className="navbar-title">MUSABAHA HOMES LTD.</span>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="navbar-overlay" onClick={closeMenu}></div>
      )}
    </>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on app start
  useEffect(() => {
    Swal.fire({
      title: 'Loading...',
      text: 'Please wait while we check your session',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const token = localStorage.getItem('userToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      const userDataObj = JSON.parse(userData);
      setUser(userDataObj);
      setIsAuthenticated(true);
    }

    // Close Swal after check
    setTimeout(() => {
      Swal.close();
      setLoading(false);
    }, 1000); // simulate short delay
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('userToken', 'your-auth-token-here'); 
    localStorage.setItem('userData', JSON.stringify(userData));
  };

  const handleAdminLogin = () => {
    const adminUser = { username: 'admin', role: 'admin' };
    setUser(adminUser);
    setIsAuthenticated(true);
    localStorage.setItem('userToken', 'admin-auth-token-here'); 
    localStorage.setItem('userData', JSON.stringify(adminUser));
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    setUser(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    return null; // we already show Swal instead of a div
  }

  return (
    <Router>
      <div className="App">
        {/* Show header only if authenticated */}
        {isAuthenticated && <Header user={user} />}

        <Navbar isAuthenticated={isAuthenticated} user={user} onLogout={handleLogout} />

        <Routes>
          <Route 
            path="/" 
            element={
              isAuthenticated ? 
              (user && user.role === 'admin' ? 
                <Navigate to="/admin" replace /> : 
                <Navigate to="/dashboard" replace />
              ) : 
              <LandingPage />
            } 
          />
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
              (user && user.role === 'admin' ? 
                <Navigate to="/admin" replace /> : 
                <Navigate to="/dashboard" replace />
              ) : 
              <AuthForm onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/admin-login" 
            element={isAuthenticated && user && user.role === 'admin' ? 
              <Navigate to="/admin" replace /> : 
              <AdminLogin onAdminLogin={handleAdminLogin} />
            } 
          />
          <Route 
            path="/dashboard/*" 
            element={
              isAuthenticated ? 
              <UserDashboard user={user} onLogout={handleLogout} /> : 
              <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/admin/*" 
            element={
              isAuthenticated && user && user.role === 'admin' ? 
              <AdminDashboard user={user} onLogout={handleLogout} /> : 
              <Navigate to="/admin-login" replace />
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
