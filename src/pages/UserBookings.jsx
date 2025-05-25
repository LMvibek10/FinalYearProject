import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import UserNavbar from '../component/UserNavbar';
import './UserBookings.css';

const UserBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, approved, declined
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserBookings();
  }, []);

  const fetchUserBookings = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        navigate('/login');
        return;
      }

      const user = JSON.parse(userData);
      const userId = user.id || user._id;

      const response = await axios.get(`http://localhost:5000/api/booking-requests/user/${userId}`);
      
      if (response.data.success) {
        setBookings(response.data.data);
      } else {
        setError('Failed to fetch bookings');
      }
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      setError('Error loading bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'status-pending', text: 'Pending' },
      approved: { class: 'status-approved', text: 'Approved' },
      declined: { class: 'status-declined', text: 'Declined' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`status-badge ${config.class}`}>
        <span className="status-icon">{config.icon}</span>
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="main-container">
        <UserNavbar />
        <div className="bookings-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading your bookings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-container">
      <UserNavbar />
      <div className="bookings-container">
        <div className="bookings-header">
          <h1>My Bookings</h1>
          <p>Track and manage your vehicle booking requests</p>
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        <div className="filter-section">
          <div className="filter-buttons">
            {['all', 'pending', 'approved', 'declined'].map((filterOption) => (
              <button
                key={filterOption}
                className={`filter-btn ${filter === filterOption ? 'active' : ''}`}
                onClick={() => setFilter(filterOption)}
              >
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                {filterOption !== 'all' && (
                  <span className="filter-count">
                    {bookings.filter(b => b.status === filterOption).length}
                  </span>
                )}
                {filterOption === 'all' && (
                  <span className="filter-count">{bookings.length}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="no-bookings">
            <div className="no-bookings-icon">📋</div>
            <h3>No bookings found</h3>
            <p>
              {filter === 'all' 
                ? "You haven't made any booking requests yet." 
                : `No ${filter} bookings found.`}
            </p>
            <button 
              className="browse-vehicles-btn"
              onClick={() => navigate('/user')}
            >
              Browse Vehicles
            </button>
          </div>
        ) : (
          <div className="bookings-grid">
            {filteredBookings.map((booking) => (
              <div key={booking._id} className="booking-card">
                <div className="booking-header">
                  <div className="vehicle-info">
                    <img 
                      src={booking.vehicleDetails.image || '/placeholder.svg?height=80&width=120'} 
                      alt={booking.vehicleDetails.name}
                      className="vehicle-thumbnail"
                    />
                    <div className="vehicle-details">
                      <h3>{booking.vehicleDetails.name}</h3>
                      <p className="vehicle-category">{booking.vehicleDetails.category} • {booking.vehicleDetails.subcategory}</p>
                    </div>
                  </div>
                  {getStatusBadge(booking.status)}
                </div>

                <div className="booking-details">
                  <div className="detail-row">
                    <span className="detail-label">📅 Pickup Date:</span>
                    <span className="detail-value">{formatDate(booking.bookingDetails.pickupDate)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">📅 Return Date:</span>
                    <span className="detail-value">{formatDate(booking.bookingDetails.returnDate)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">📍 Location:</span>
                    <span className="detail-value">
                      {booking.bookingDetails.isInsideValley ? 'Inside Valley' : 'Outside Valley'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">🚗 Driver:</span>
                    <span className="detail-value">
                      {booking.bookingDetails.driverOption === 'with-driver' ? 'With Driver' : 'Self Drive'}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">⏱️ Duration:</span>
                    <span className="detail-value">{booking.bookingDetails.totalDays} days</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">💰 Total Price:</span>
                    <span className="detail-value price">NPR {booking.totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                <div className="booking-footer">
                  <div className="booking-meta">
                    <span className="booking-date">
                      Requested: {formatDateTime(booking.createdAt)}
                    </span>
                    {booking.adminResponse && booking.adminResponse.responseDate && (
                      <span className="response-date">
                        Responded: {formatDateTime(booking.adminResponse.responseDate)}
                      </span>
                    )}
                  </div>
                  
                  {booking.status === 'declined' && booking.adminResponse && booking.adminResponse.reason && (
                    <div className="decline-reason">
                      <span className="reason-label">Reason:</span>
                      <span className="reason-text">{booking.adminResponse.reason}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserBookings; 