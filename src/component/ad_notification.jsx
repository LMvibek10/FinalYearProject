import React, { useState, useEffect } from 'react';
import { Bell, Search, Filter, MoreVertical, Check, Trash2, Eye, CheckCircle, XCircle } from 'lucide-react';
import Sidebar from './ad_sidebar';
import axios from 'axios';
import './ad_notification.css';

const AdminNotifications = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [bookingRequests, setBookingRequests] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRead, setFilterRead] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookingRequests();
    // Poll for new booking requests every 10 seconds
    const interval = setInterval(fetchBookingRequests, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchBookingRequests = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/booking-requests/all');
      if (response.data.success) {
        setBookingRequests(response.data.data);
        
        // Convert booking requests to notifications format (all notifications)
        const bookingNotifications = response.data.data.map(request => ({
          id: `booking-${request._id}`,
          bookingRequestId: request._id,
          title: request.status === 'pending' 
            ? `New Booking Request - ${request.vehicleDetails.name}`
            : request.status === 'approved'
            ? `✅ Approved - ${request.vehicleDetails.name}`
            : `❌ Declined - ${request.vehicleDetails.name}`,
          message: request.status === 'pending'
            ? `${request.userDetails.firstName} ${request.userDetails.lastName} wants to book ${request.vehicleDetails.name} for ${request.bookingDetails.totalDays} days (NPR ${request.totalPrice.toLocaleString()})`
            : request.status === 'approved'
            ? `Booking request for ${request.vehicleDetails.name} has been approved and user redirected to payment.`
            : `Booking request for ${request.vehicleDetails.name} has been declined. Reason: ${request.adminResponse?.reason || 'No reason provided'}`,
          type: "booking",
          time: getTimeAgo(request.createdAt),
          timestamp: new Date(request.createdAt),
          isRead: request.status !== 'pending', // Mark non-pending as read by default
          priority: request.status === 'pending' ? "high" : request.status === 'approved' ? "medium" : "low",
          status: request.status,
          bookingData: request
        }));

        // Keep existing notifications and add new ones (avoid duplicates)
        setNotifications(prevNotifications => {
          const existingIds = prevNotifications.map(notif => notif.bookingRequestId);
          const newNotifications = bookingNotifications.filter(
            notif => !existingIds.includes(notif.bookingRequestId)
          );
          
          // Update existing notifications with latest data but preserve read status for pending requests
          const updatedNotifications = prevNotifications.map(prevNotif => {
            const updatedNotif = bookingNotifications.find(
              notif => notif.bookingRequestId === prevNotif.bookingRequestId
            );
            if (updatedNotif) {
              return {
                ...updatedNotif,
                isRead: updatedNotif.status === 'pending' ? prevNotif.isRead : true // Preserve read status only for pending
              };
            }
            return prevNotif;
          });

          return [...updatedNotifications, ...newNotifications];
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching booking requests:', error);
      setLoading(false);
    }
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  useEffect(() => {
    let filtered = notifications;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by read status
    if (filterRead !== 'all') {
      filtered = filtered.filter(notification => 
        filterRead === 'read' ? notification.isRead : !notification.isRead
      );
    }

    setFilteredNotifications(filtered);
  }, [notifications, searchTerm, filterRead]);

  const handleApproveBooking = async (bookingRequestId) => {
    try {
      const userDetails = JSON.parse(localStorage.getItem('user'));
      const response = await axios.put(
        `http://localhost:5000/api/booking-requests/approve/${bookingRequestId}`,
        {
          adminId: userDetails.id || userDetails._id,
          reason: 'Booking approved by admin'
        }
      );

      if (response.data.success) {
        // Mark the notification as read and update status instead of deleting
        setNotifications(prev => 
          prev.map(notif => 
            notif.bookingRequestId === bookingRequestId 
              ? { 
                  ...notif, 
                  isRead: true, 
                  status: 'approved',
                  title: `✅ Approved - ${notif.bookingData.vehicleDetails.name}`,
                  message: `Booking request for ${notif.bookingData.vehicleDetails.name} has been approved and user redirected to payment.`,
                  priority: 'medium'
                } 
              : notif
          )
        );
        alert('Booking request approved successfully!');
      }
    } catch (error) {
      console.error('Error approving booking:', error);
      alert('Error approving booking request');
    }
  };

  const handleDeclineBooking = async (bookingRequestId) => {
    const reason = prompt('Please provide a reason for declining this booking:');
    if (!reason) return;

    try {
      const userDetails = JSON.parse(localStorage.getItem('user'));
      const response = await axios.put(
        `http://localhost:5000/api/booking-requests/decline/${bookingRequestId}`,
        {
          adminId: userDetails.id || userDetails._id,
          reason: reason
        }
      );

      if (response.data.success) {
        // Mark the notification as read and update status instead of deleting
        setNotifications(prev => 
          prev.map(notif => 
            notif.bookingRequestId === bookingRequestId 
              ? { 
                  ...notif, 
                  isRead: true, 
                  status: 'declined',
                  title: `❌ Declined - ${notif.bookingData.vehicleDetails.name}`,
                  message: `Booking request for ${notif.bookingData.vehicleDetails.name} has been declined. Reason: ${reason}`,
                  priority: 'low'
                } 
              : notif
          )
        );
        alert('Booking request declined successfully!');
      }
    } catch (error) {
      console.error('Error declining booking:', error);
      alert('Error declining booking request');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking': return '📅';
      case 'payment': return '💰';
      case 'user': return '👤';
      case 'maintenance': return '🔧';
      case 'system': return '⚙️';
      default: return '📢';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-low';
    }
  };

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="admin-notifications">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <div className={`notifications-main ${isSidebarOpen ? 'sidebar-open' : ''}`}>
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading notifications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-notifications">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className={`notifications-main ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="notifications-header">
          <div className="header-top">
            <div className="header-title">
              <Bell size={28} />
              <h1>Notifications</h1>
              {unreadCount > 0 && (
                <span className="unread-badge">{unreadCount} unread</span>
              )}
            </div>
            <button className="mark-all-read-btn" onClick={markAllAsRead}>
              <Check size={16} />
              Mark All as Read
            </button>
          </div>

          <div className="notifications-controls">
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filter-controls">
              <select
                value={filterRead}
                onChange={(e) => setFilterRead(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
            </div>
          </div>
        </div>

        <div className="notifications-content">
          {filteredNotifications.length === 0 ? (
            <div className="no-notifications">
              <Bell size={48} />
              <h3>No notifications found</h3>
              <p>{notifications.length === 0 ? 'No booking requests at the moment' : 'Try adjusting your search or filter criteria'}</p>
            </div>
          ) : (
            <div className="notifications-list">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-card ${!notification.isRead ? 'unread' : ''} ${getPriorityColor(notification.priority)}`}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="notification-content">
                    <div className="notification-header">
                      <h3 className="notification-title">{notification.title}</h3>
                      <span className="notification-time">{notification.time}</span>
                    </div>
                    <p className="notification-message">{notification.message}</p>
                    
                    {/* Booking Details for booking requests */}
                    {notification.type === 'booking' && notification.bookingData && (
                      <div className="booking-details">
                        <div className="booking-info">
                          <span><strong>Customer:</strong> {notification.bookingData.userDetails.firstName} {notification.bookingData.userDetails.lastName}</span>
                          <span><strong>Email:</strong> {notification.bookingData.userDetails.email}</span>
                          <span><strong>Phone:</strong> {notification.bookingData.userDetails.phone}</span>
                          <span><strong>Pickup:</strong> {new Date(notification.bookingData.bookingDetails.pickupDate).toLocaleDateString()}</span>
                          <span><strong>Return:</strong> {new Date(notification.bookingData.bookingDetails.returnDate).toLocaleDateString()}</span>
                          <span><strong>Location:</strong> {notification.bookingData.bookingDetails.isInsideValley ? 'Inside Valley' : 'Outside Valley'}</span>
                          <span><strong>Driver:</strong> {notification.bookingData.bookingDetails.driverOption === 'with-driver' ? 'With Driver' : 'Without Driver'}</span>
                        </div>
                      </div>
                    )}

                    <div className="notification-meta">
                      <span className={`notification-type type-${notification.type}`}>
                        {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                      </span>
                      <span className={`notification-priority ${getPriorityColor(notification.priority)}`}>
                        {notification.priority.charAt(0).toUpperCase() + notification.priority.slice(1)} Priority
                      </span>
                    </div>
                  </div>

                  <div className="notification-actions">
                    {/* Booking approval/decline buttons - only show for pending requests */}
                    {notification.type === 'booking' && notification.bookingRequestId && notification.status === 'pending' && (
                      <div className="booking-actions">
                        <button
                          className="action-btn approve"
                          onClick={() => handleApproveBooking(notification.bookingRequestId)}
                          title="Approve booking"
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button
                          className="action-btn decline"
                          onClick={() => handleDeclineBooking(notification.bookingRequestId)}
                          title="Decline booking"
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    )}

                    {/* Show status badge for processed requests */}
                    {notification.type === 'booking' && notification.status && notification.status !== 'pending' && (
                      <div className="status-badge">
                        <span className={`status-indicator status-${notification.status}`}>
                          {notification.status === 'approved' ? '✅ Approved' : '❌ Declined'}
                        </span>
                      </div>
                    )}
                    
                    {!notification.isRead && (
                      <button
                        className="action-btn mark-read"
                        onClick={() => markAsRead(notification.id)}
                        title="Mark as read"
                      >
                        <Eye size={16} />
                      </button>
                    )}
                    <button
                      className="action-btn delete"
                      onClick={() => deleteNotification(notification.id)}
                      title="Delete notification"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;
