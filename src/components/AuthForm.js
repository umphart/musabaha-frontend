import React, { useState } from 'react'; 
import { useNavigate, Link } from 'react-router-dom';

const AuthForm = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const API_BASE_URL = 'https://musabaha-home-ltd.onrender.com/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    if (isSignUp) {
      if (password !== confirmPassword) {
        setMessage("Passwords don't match!");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            email,
            password,
            confirmPassword
          }),
        });

        const data = await response.json();

        if (data.success) {
          setMessage('Registration successful! You can now sign in.');
          setName('');
          setEmail('');
          setPassword('');
          setConfirmPassword('');
          setIsSignUp(false);
        } else {
          setMessage(data.message || 'Registration failed');
        }
      } catch (error) {
        console.error('Registration error:', error);
        setMessage('Network error. Please try again.');
      }
    } else {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password
          }),
        });

        const data = await response.json();

        if (data.success) {
          localStorage.setItem('userToken', data.data.token);
          localStorage.setItem('userData', JSON.stringify(data.data));
          onLogin(data.data);
          navigate('/dashboard');
        } else {
          setMessage(data.message || 'Login failed');
        }
      } catch (error) {
        console.error('Login error:', error);
        setMessage('Network error. Please try again.');
      }
    }

    setIsLoading(false);
  };

  return (
    <div 
      className="auth-container" 
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2100&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div className="auth-form" style={{
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: '2rem',
        borderRadius: '8px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)'
      }}>
        <h2 style={{ textAlign: 'center' }}>MUSABAHA HOMES LTD.</h2>

        <div className="tabs" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <button 
            className={!isSignUp ? 'active' : ''} 
            onClick={() => setIsSignUp(false)}
            disabled={isLoading}
            style={{
              marginRight: '10px',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              backgroundColor: !isSignUp ? '#007BFF' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            Sign In
          </button>
          <button 
            className={isSignUp ? 'active' : ''} 
            onClick={() => setIsSignUp(true)}
            disabled={isLoading}
            style={{
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              backgroundColor: isSignUp ? '#007BFF' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '4px'
            }}
          >
            Sign Up
          </button>
        </div>
        
        {message && (
          <div 
            className={`message ${message.includes('successful') ? 'success' : 'error'}`}
            style={{
              color: message.includes('successful') ? 'green' : 'red',
              marginBottom: '1rem',
              textAlign: 'center'
            }}
          >
            {message}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={isSignUp}
                disabled={isLoading}
                style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
              />
            </div>
          )}
          
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Email address</label>
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Password</label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
            />
          </div>

          {isSignUp && (
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required={isSignUp}
                disabled={isLoading}
                style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
              />
            </div>
          )}

          <button 
            type="submit" 
            className="btn-primary"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#007BFF',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            {isLoading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
        </form>
        
        <div className="text-center mt-3" style={{ marginTop: '1rem', textAlign: 'center' }}>
          <p>
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <a 
              href="#toggle" 
              onClick={(e) => { 
                e.preventDefault(); 
                if (!isLoading) setIsSignUp(!isSignUp); 
                setMessage('');
              }}
              style={{ color: '#007BFF', textDecoration: 'underline', cursor: 'pointer' }}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </a>
             <Link to="/" className="navbar-link" >Home</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
