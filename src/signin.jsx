import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReCAPTCHA from "react-google-recaptcha";
import './signin.css';

const Login = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState(null);

  const handleRecaptchaChange = (token) => {
    setRecaptchaToken(token);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!recaptchaToken) {
      setErrorMessage('Please complete the reCAPTCHA verification');
      return;
    }

    const email = e.target.email.value;
    const password = e.target.password.value;

    console.log('Attempting login with:', { email });

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await axios.post('http://localhost:5000/api/signin', {
        email,
        password
      });

      console.log('Login response:', response.data);

      // Store user data and token
      localStorage.setItem('user', JSON.stringify(response.data));
      localStorage.setItem('token', response.data.token);

      setSuccessMessage('Login successful!');
      
      // Check if the email contains '.admin' and redirect accordingly
      if (email.includes('.admin')) {
        setTimeout(() => {
          navigate('/admin');
        }, 1000);
      } else {
        setTimeout(() => {
          navigate('/user');
        }, 1000);
      }
    } catch (error) {
      console.error('Login error:', error.response?.data || error);
      setErrorMessage(
        error.response?.data?.message || 
        'Login failed. Please check your credentials and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signin-page">
      <div className="container">
        <div className="signin-left">
          <img className="logo" src="images/logo.png" alt="RentEase" />
          <div className="background-image"></div>
        </div>

        <div className="signin-right">
          <form onSubmit={handleSubmit} className="signin-form">
            <div className="form-header">
              <h2>Sign In</h2>
              <p className="text">
                New to RentEase?{' '}
                <Link 
                  to="/signup" 
                  className="link"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    display: 'inline',
                    font: 'inherit'
                  }}
                >
                  Create an account
                </Link>
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                required
                className="input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                required
                className="input"
              />
            </div>

            <div className="recaptcha-container">
              <ReCAPTCHA 
                sitekey="6Lc5S9kqAAAAABvLEsVg9x_p-s1kTG8GGpeiKfPD"
                onChange={handleRecaptchaChange}
              />
            </div>

            <button type="submit" className="button" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>

            {errorMessage && <div className="error">{errorMessage}</div>}
            {successMessage && <div className="success">{successMessage}</div>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;