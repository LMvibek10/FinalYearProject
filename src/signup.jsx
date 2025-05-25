import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import OtpInput from './component/OtpInput';
import './signup.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    acceptTerms: false
  });

  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.acceptTerms) {
      setError('Please accept the terms and conditions');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      if (showOtpInput) {
        // Verify OTP
        const response = await axios.post('http://localhost:5000/api/signup', {
          ...formData,
          otp
        });

        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
          localStorage.setItem('token', response.data.user.token);
          setSuccess('Account created successfully!');
          
          setTimeout(() => {
            navigate('/user');
          }, 1500);
        }
      } else {
        // Initial signup request
        const response = await axios.post('http://localhost:5000/api/signup', formData);
        
        if (response.data.requiresOTP) {
          setShowOtpInput(true);
          setSuccess('OTP has been sent to your email. Please check and enter it below.');
        } else {
          setError('Failed to initiate OTP process');
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error creating account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/api/signup', formData);
      if (response.data.requiresOTP) {
        setSuccess('New OTP has been sent to your email.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-left">
          <div className="welcome-content">
            <img src="/images/logo.png" alt="RentEase" className="logo" />
            <h1>Welcome to RentEase</h1>
            <p>Your journey to seamless vehicle rentals begins here</p>
          </div>
        </div>
        <div className="signup-right">
          <div className="signup-form-container">
            <h2>Create Account</h2>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
            {!showOtpInput ? (
              <form onSubmit={handleSubmit} className="signup-form">
                <div className="form-group">
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="First Name"
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Last Name"
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email"
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    required
                  />
                </div>
                <div className="form-group checkbox">
                  <input
                    type="checkbox"
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleChange}
                    required
                  />
                  <label>I accept the terms and conditions</label>
                </div>
                <button type="submit" disabled={isLoading} className="signup-button">
                  {isLoading ? 'Processing...' : 'Create Account'}
                </button>
              </form>
            ) : (
              <div className="otp-verification">
                <h3>Enter OTP</h3>
                <p>Please enter the 6-digit OTP sent to your email</p>
                <OtpInput value={otp} onChange={setOtp} />
                <button 
                  onClick={handleSubmit} 
                  disabled={isLoading || otp.length !== 6}
                  className="signup-button"
                >
                  {isLoading ? 'Verifying...' : 'Verify OTP'}
                </button>
                <button 
                  className="resend-otp" 
                  onClick={handleResendOTP}
                  disabled={isLoading}
                >
                  Resend OTP
                </button>
              </div>
            )}
            <p className="login-link">
              Already have an account? <Link to="/signin">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;