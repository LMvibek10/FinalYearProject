import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ad_users.css';
import Sidebar from '../component/ad_sidebar';
import AdminLayout from './AdminLayout';

const UserDetailsPopup = ({ user, onClose }) => {
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    if (user) {
      fetchUserBookings();
    }
  }, [user]);

  const fetchUserBookings = async () => {
    try {
      setLoadingBookings(true);
      const response = await axios.get(`http://localhost:5000/api/booking-requests/user/${user._id}`);
      
      if (response.data.success) {
        setBookings(response.data.data);
      } else {
        setBookingError('Failed to fetch user bookings');
      }
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      setBookingError('Error loading booking details');
    } finally {
      setLoadingBookings(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'status-pending', text: 'Pending', icon: '⏳' },
      approved: { class: 'status-approved', text: 'Approved', icon: '' },
      declined: { class: 'status-declined', text: 'Declined', icon: '❌' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`booking-status-badge ${config.class}`}>
        {config.icon && <span className="status-icon">{config.icon}</span>}
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

  if (!user) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-content user-details-popup">
        <div className="popup-header">
          <h2>User Details</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="popup-body">
          {/* User Information Section */}
          <div className="user-info-section">
            <h3>Personal Information</h3>
            <div className="detail-item">
              <label>Name:</label>
              <span>{`${user.firstName} ${user.lastName}`}</span>
            </div>
            <div className="detail-item">
              <label>Email:</label>
              <span>{user.email}</span>
            </div>
            <div className="detail-item">
              <label>Join Date:</label>
              <span>{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Booking History Section */}
          <div className="booking-history-section">
            <h3>Booking History ({bookings.length} bookings)</h3>
            
            {loadingBookings ? (
              <div className="booking-loading">
                <div className="loading-spinner"></div>
                <span>Loading booking details...</span>
              </div>
            ) : bookingError ? (
              <div className="booking-error">
                <span className="error-icon">⚠️</span>
                {bookingError}
              </div>
            ) : bookings.length === 0 ? (
              <div className="no-bookings">
                <span className="no-bookings-icon">📋</span>
                <p>No booking requests found for this user.</p>
              </div>
            ) : (
              <div className="bookings-list">
                {bookings.map((booking) => (
                  <div key={booking._id} className="booking-item">
                    <div className="booking-item-header">
                      <div className="vehicle-info">
                        <img 
                          src={booking.vehicleDetails.image || '/placeholder.svg?height=40&width=60'} 
                          alt={booking.vehicleDetails.name}
                          className="vehicle-thumbnail-small"
                        />
                        <div className="vehicle-details-small">
                          <h4>{booking.vehicleDetails.name}</h4>
                          <span className="vehicle-category">{booking.vehicleDetails.category}</span>
                        </div>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>
                    
                    <div className="booking-item-details">
                      <div className="booking-dates">
                        <span className="date-label">Pickup:</span>
                        <span className="date-value">{formatDate(booking.bookingDetails.pickupDate)}</span>
                        <span className="date-label">Return:</span>
                        <span className="date-value">{formatDate(booking.bookingDetails.returnDate)}</span>
                      </div>
                      
                      <div className="booking-info">
                        <span className="info-item">
                          <strong>Duration:</strong> {booking.bookingDetails.totalDays} days
                        </span>
                        <span className="info-item">
                          <strong>Total:</strong> NPR {booking.totalPrice.toLocaleString()}
                        </span>
                        <span className="info-item">
                          <strong>Driver:</strong> {booking.bookingDetails.driverOption === 'with-driver' ? 'With Driver' : 'Self Drive'}
                        </span>
                      </div>
                      
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
                          <span className="reason-label">Decline Reason:</span>
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
      </div>
    </div>
  );
};

const AdUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/signup', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data.users) {
          setUsers(response.data.users);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Failed to fetch users. Please try again later.');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.delete(`http://localhost:5000/api/signup/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.message) {
          // Show success message
          alert(response.data.message);
          // Remove user from the list
          setUsers(users.filter(user => user._id !== userId));
          // Clear any previous errors
          setError('');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        
        // Handle different types of errors
        if (error.response?.status === 404) {
          setError('User not found. The user may have already been deleted.');
        } else if (error.response?.status === 403) {
          setError('Cannot delete admin user. Admin users are protected from deletion.');
        } else if (error.response?.data?.message) {
          setError(`Error: ${error.response.data.message}`);
        } else {
          setError('Failed to delete user. Please try again later.');
        }
      }
    }
  };

  const handleShowDetails = (user) => {
    setSelectedUser(user);
  };

  return (
    <div className="admin-dashboard">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className={`main-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="users-container">
          <h1>User Management</h1>
          {error && <div className="error-message">{error}</div>}
          <div className="users-table-container">
            {loading ? (
              <div className="loading">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="no-users">No users found</div>
            ) : (
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td>{`${user.firstName} ${user.lastName}`}</td>
                      <td>{user.email}</td>
                      <td>
                        <button 
                          className="action-btn details"
                          onClick={() => handleShowDetails(user)}
                        >
                          Details
                        </button>
                        <button 
                          className="action-btn delete"
                          onClick={() => handleDelete(user._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      {selectedUser && (
        <UserDetailsPopup 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)} 
        />
      )}
    </div>
  );
};

export default AdUsers; 