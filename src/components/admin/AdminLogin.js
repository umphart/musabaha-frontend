// components/AdminLogin.js
import React, { useState } from 'react';
import { FiLogIn, FiMail, FiLock, FiUser } from 'react-icons/fi';
import './adminStyle.css';

const AdminLogin = ({ onAdminLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Use the correct backend URL - adjust port if needed
  const API_BASE_URL = 'https://musabaha-home-ltd.onrender.com';
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/admin/login' : '/api/admin/register';
      
      // Prepare request body based on login/signup
      const requestBody = isLogin 
        ? { email, password }
        : { name, email, password };

      // For signup, validate passwords match
      if (!isLogin && password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.success) {
        if (isLogin) {
          // Store token and admin data in localStorage
          localStorage.setItem('adminToken', data.data.token);
          localStorage.setItem('adminData', JSON.stringify(data.data));
          setSuccess('Login successful! Redirecting...');
          
          // Call the parent callback after a short delay
          setTimeout(() => {
            onAdminLogin(data.data);
          }, 1000);
        } else {
          setSuccess('Admin registered successfully! Please login.');
          // Reset form and switch to login
          setName('');
          setEmail('');
          setPassword('');
          setConfirmPassword('');
          setIsLogin(true);
        }
      } else {
        setError(data.message || `${isLogin ? 'Login' : 'Registration'} failed`);
      }
    } catch (error) {
      setError(error.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <div className="auth-header">
          <h2>Musabaha Homes</h2>
          <p>{isLogin ? 'Admin Portal Login' : 'Create Admin Account'}</p>
        </div>

        <div className="auth-tabs">
          <button
            className={isLogin ? 'active' : ''}
            onClick={() => {
              setIsLogin(true);
              setError('');
              setSuccess('');
            }}
            disabled={loading}
          >
            <FiLogIn /> Login
          </button>
          <button
            className={!isLogin ? 'active' : ''}
            onClick={() => {
              setIsLogin(false);
              setError('');
              setSuccess('');
            }}
            disabled={loading}
          >
            <FiUser /> Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label><FiUser /> Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                placeholder="Enter your full name"
              />
            </div>
          )}

          <div className="form-group">
            <label><FiMail /> Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label><FiLock /> Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              placeholder={isLogin ? "Enter your password" : "Create a password"}
              minLength="6"
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label><FiLock /> Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                placeholder="Confirm your password"
              />
            </div>
          )}

          {error && (
            <div className="message error-message">
              <span className="message-icon">⚠️</span>
              {error}
            </div>
          )}

          {success && (
            <div className="message success-message">
              <span className="message-icon">✅</span>
              {success}
            </div>
          )}

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? (
              <span className="loading-spinner"></span>
            ) : (
              isLogin ? (
                <><FiLogIn /> Login to Admin Portal</>
              ) : (
                <><FiUser /> Create Admin Account</>
              )
            )}
          </button>

          <div className="auth-footer">
            <p>
              {isLogin ? "Don't have an admin account? " : "Already have an account? "}
              <button
                type="button"
                className="link-button"
                onClick={() => setIsLogin(!isLogin)}
                disabled={loading}
              >
                {isLogin ? 'Sign up here' : 'Login here'}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;