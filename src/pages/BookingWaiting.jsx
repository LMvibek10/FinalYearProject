import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import './BookingWaiting.css';

const BookingWaiting = () => {
  const [status, setStatus] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingData, setBookingData] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  const { bookingRequestId, bookingDetails } = location.state || {};

  useEffect(() => {
    if (!bookingRequestId) {
      navigate('/user');
      return;
    }

    // Poll for status updates every 3 seconds
    const pollInterval = setInterval(() => {
      checkBookingStatus();
    }, 3000);

    // Initial check
    checkBookingStatus();

    return () => clearInterval(pollInterval);
  }, [bookingRequestId]);

  const checkBookingStatus = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/booking-requests/status/${bookingRequestId}`);
      
      if (response.data.success) {
        const newStatus = response.data.status;
        setStatus(newStatus);
        setBookingData(response.data.data);
        setLoading(false);

        // Handle status changes
        if (newStatus === 'approved') {
          setTimeout(() => {
            // Redirect to payment with booking data
            navigate('/booking', { 
              state: { 
                vehicle: bookingDetails?.vehicle,
                approvedBooking: response.data.data,
                proceedToPayment: true
              } 
            });
          }, 2000);
        } else if (newStatus === 'declined') {
          setTimeout(() => {
            // Redirect back to booking page with error message
            navigate('/booking', { 
              state: { 
                vehicle: bookingDetails?.vehicle,
                declineMessage: response.data.data.adminResponse?.reason || 'Your booking request was declined.'
              } 
            });
          }, 3000);
        }
      }
    } catch (error) {
      console.error('Error checking booking status:', error);
      setError('Error checking booking status');
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return <Clock size={64} className="status-icon pending" />;
      case 'approved':
        return <CheckCircle size={64} className="status-icon approved" />;
      case 'declined':
        return <XCircle size={64} className="status-icon declined" />;
      default:
        return <RefreshCw size={64} className="status-icon loading" />;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'pending':
        return {
          title: 'Waiting for Admin Approval',
          message: 'Your booking request has been submitted and is being reviewed by our admin team. Please wait while we process your request.',
          subMessage: 'This usually takes a few minutes. You will be automatically redirected once approved.'
        };
      case 'approved':
        return {
          title: 'Booking Approved!',
          message: 'Great news! Your booking request has been approved by our admin team.',
          subMessage: 'Redirecting you to payment process...'
        };
      case 'declined':
        return {
          title: 'Booking Declined',
          message: 'Sorry, your booking request has been declined.',
          subMessage: bookingData?.adminResponse?.reason || 'Please try booking a different vehicle or contact support.'
        };
      default:
        return {
          title: 'Processing...',
          message: 'Please wait while we check your booking status.',
          subMessage: ''
        };
    }
  };

  const statusInfo = getStatusMessage();

  if (loading && status === 'pending') {
    return (
      <div className="booking-waiting-container">
        <div className="waiting-card">
          <div className="loading-spinner">
            <RefreshCw size={48} className="spin" />
          </div>
          <h2>Loading...</h2>
          <p>Please wait while we submit your booking request.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-waiting-container">
      <div className="waiting-card">
        <div className="status-section">
          {getStatusIcon()}
          <h1 className={`status-title ${status}`}>{statusInfo.title}</h1>
          <p className="status-message">{statusInfo.message}</p>
          <p className="status-sub-message">{statusInfo.subMessage}</p>
        </div>

        {bookingDetails && (
          <div className="booking-summary">
            <h3>Booking Details</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="label">Vehicle:</span>
                <span className="value">{bookingDetails.vehicle?.name}</span>
              </div>
              <div className="summary-item">
                <span className="label">Duration:</span>
                <span className="value">{bookingDetails.totalDays} days</span>
              </div>
              <div className="summary-item">
                <span className="label">Total Amount:</span>
                <span className="value">NPR {bookingDetails.totalPrice?.toLocaleString()}</span>
              </div>
              <div className="summary-item">
                <span className="label">Location:</span>
                <span className="value">{bookingDetails.isInsideValley ? 'Inside Valley' : 'Outside Valley'}</span>
              </div>
            </div>
          </div>
        )}

        {status === 'pending' && (
          <div className="waiting-animation">
            <div className="dots">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
            <p className="waiting-text">Checking for updates...</p>
          </div>
        )}

        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="retry-btn">
              Retry
            </button>
          </div>
        )}

        <div className="action-buttons">
          {status === 'declined' && (
            <button 
              onClick={() => navigate('/user')} 
              className="back-btn"
            >
              Browse Other Vehicles
            </button>
          )}
          {status === 'pending' && (
            <button 
              onClick={() => navigate('/user')} 
              className="cancel-btn"
            >
              Cancel Request
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingWaiting; 