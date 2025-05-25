import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Search, Eye, Trash2, Calendar, MapPin, Phone, Mail, User, BarChart3, Activity } from 'lucide-react';
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
          <div className="popup-title">
            <User className="popup-icon" />
            <h2>User Details</h2>
          </div>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="popup-body">
          {/* User Information Section */}
          <div className="user-info-section">
            <div className="section-header">
              <h3>
                <User className="section-icon" />
                Personal Information
              </h3>
            </div>
            <div className="user-info-grid">
              <div className="detail-item">
                <div className="detail-icon">
                  <User />
                </div>
                <div className="detail-content">
                  <label>Full Name</label>
                  <span>{`${user.firstName} ${user.lastName}`}</span>
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-icon">
                  <Mail />
                </div>
                <div className="detail-content">
                  <label>Email Address</label>
                  <span>{user.email}</span>
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-icon">
                  <Calendar />
                </div>
                <div className="detail-content">
                  <label>Member Since</label>
                  <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking History Section */}
          <div className="booking-history-section">
            <div className="section-header">
              <h3>
                <BarChart3 className="section-icon" />
                Booking History ({bookings.length} bookings)
              </h3>
            </div>
            
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
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

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
          setFilteredUsers(response.data.users);
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

  useEffect(() => {
    const filtered = users.filter(user => 
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const handleDelete = async (userId) => {
    // Enhanced confirmation dialog
    const confirmMessage = `⚠️ IMPORTANT: This will permanently delete the user and ALL related data including:

• All booking requests and history
• All ratings and reviews given by this user
• All payment records and purchased items
• Vehicle ratings will be recalculated

This action cannot be undone. Are you absolutely sure you want to proceed?`;

    if (window.confirm(confirmMessage)) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.delete(`http://localhost:5000/api/signup/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.message) {
          // Show detailed success message
          const deletedData = response.data.deletedData;
          let successMessage = `✅ User deleted successfully!\n\nDeleted data summary:`;
          
          if (deletedData) {
            successMessage += `\n• Booking requests: ${deletedData.bookingRequests}`;
            successMessage += `\n• Ratings: ${deletedData.ratings}`;
            successMessage += `\n• Purchased items: ${deletedData.purchasedItems}`;
            successMessage += `\n• Vehicles updated: ${deletedData.vehiclesUpdated}`;
            successMessage += `\n• ${deletedData.payments}`;
          }
          
          alert(successMessage);
          
          // Update the UI
          const updatedUsers = users.filter(user => user._id !== userId);
          setUsers(updatedUsers);
          setFilteredUsers(updatedUsers);
          setError('');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        
        if (error.response?.status === 404) {
          setError('User not found. The user may have already been deleted.');
        } else if (error.response?.status === 403) {
          setError('Cannot delete admin user. Admin users are protected from deletion.');
        } else if (error.response?.data?.message) {
          setError(`Error: ${error.response.data.message}`);
        } else {
          setError('Failed to delete user and related data. Please try again later.');
        }
      }
    }
  };

  const handleShowDetails = (user) => {
    setSelectedUser(user);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const getUserStats = () => {
    const total = users.length;
    const recentUsers = users.filter(user => {
      const userDate = new Date(user.createdAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return userDate >= thirtyDaysAgo;
    }).length;
    
    return { total, recent: recentUsers };
  };

  const stats = getUserStats();

  return (
    <div className="admin-dashboard">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className={`main-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="users-container">
          
          {/* Enhanced Header */}
          <div className="users-header">
            <div className="header-content">
              <div className="header-text">
                <h1>
                  <Users className="header-icon" />
                  User Management
                </h1>
                <p>Manage and monitor your platform users</p>
              </div>
            </div>
          </div>
          {/* Search Section */}
          <div className="search-section">
            <div className="search-bar">
              <Search className="search-icon" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search users by name"
              />
            </div>
          </div>

          {/* Results Header */}
          <div className="results-header">
            <h2>
              {filteredUsers.length} {filteredUsers.length === 1 ? 'User' : 'Users'} Found
            </h2>
            {searchQuery && (
              <p className="search-info">
                Showing results for "<strong>{searchQuery}</strong>"
              </p>
            )}
          </div>

          {error && <div className="error-message">{error}</div>}
          
          <div className="users-table-container">
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="no-users">
                <Users className="no-users-icon" />
                <h3>No users found</h3>
                <p>Try adjusting your search criteria.</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Join Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user._id}>
                        <td>
                          <div className="user-cell">
                            <div className="user-avatar">
                              <User />
                            </div>
                            <div className="user-info">
                              <div className="user-name">{`${user.firstName} ${user.lastName}`}</div>
                              <div className="user-id">ID: {user._id.slice(-8)}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="email-cell">
                            <Mail className="email-icon" />
                            <span>{user.email}</span>
                          </div>
                        </td>
                        <td>
                          <div className="date-cell">
                            <Calendar className="date-icon" />
                            <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td>
                          <div className="actions-cell">
                            <button 
                              className="action-btn details-btn"
                              onClick={() => handleShowDetails(user)}
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            <button 
                              className="action-btn delete-btn"
                              onClick={() => handleDelete(user._id)}
                              title="Delete User"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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