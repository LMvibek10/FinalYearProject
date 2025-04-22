import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import OtpInput from './OtpInput';
import './signup.css';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (showOtpInput) {
        // Verify OTP
        const response = await axios.post('http://localhost:5000/api/signup', {
          ...formData,
          otp,
        });

        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
          navigate('/');
        }
      } else {
        // Initial signup request
        const response = await axios.post('http://localhost:5000/api/signup', formData);
        
        if (response.data.requiresOTP) {
          setShowOtpInput(true);
          setMessage('OTP has been sent to your email. Please check and enter it below.');
        } else {
          setError('Failed to initiate OTP process');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/api/signup', formData);
      if (response.data.requiresOTP) {
        setMessage('New OTP has been sent to your email.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-form">
        <h2>Sign Up</h2>
        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}
        
        {!showOtpInput ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Processing...' : 'Sign Up'}
            </button>
          </form>
        ) : (
          <div className="otp-verification">
            <h3>Enter OTP</h3>
            <p>Please enter the 6-digit OTP sent to your email</p>
            <OtpInput value={otp} onChange={setOtp} />
            <button onClick={handleSubmit} disabled={loading || otp.length !== 6}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button 
              className="resend-otp" 
              onClick={handleResendOTP}
              disabled={loading}
            >
              Resend OTP
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Signup; 