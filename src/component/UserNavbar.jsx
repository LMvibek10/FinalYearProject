import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import './UserNavbar.css';

const UserNavbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <nav className="user-navbar">
      <div className="nav-brand">
        <Link to="/">
          <img src="/images/logo.png" alt="RentEase Logo" className="nav-logo" />
        </Link>
      </div>
      <div className="nav-links">
        <Link 
          to="/user" 
          className={`nav-link ${location.pathname === '/user' ? 'active' : ''}`}
        >
          Vehicles
        </Link>
        <Link 
          to="/user/bookings" 
          className={`nav-link ${location.pathname === '/user/bookings' ? 'active' : ''}`}
        >
          My Bookings
        </Link>
        <Link 
          to="/profile" 
          className={`nav-link ${location.pathname === '/profile' ? 'active' : ''}`}
        >
          Profile
        </Link>
        <Link 
          to="/user/wallet" 
          className={`nav-link ${location.pathname === '/user/wallet' ? 'active' : ''}`}
        >
          Wallet
        </Link>
      </div>
      <div className="nav-actions">
        <div className="user-profile">
          <span className="username">{user ? user.firstName : 'Guest'}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>
    </nav>
  );
};

export default UserNavbar; 