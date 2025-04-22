import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UserNavbar from '../component/UserNavbar';
import './Profile.css';

const Profile = () => {
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // Get the user data from localStorage
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.email) {
        throw new Error('No user data found');
      }

      const token = localStorage.getItem('token');
      // Use the email to fetch the specific user's data
      const response = await axios.get(`http://localhost:5000/api/signup/user/${user.email}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data) {
        setUserData({
          firstName: response.data.firstName || '',
          lastName: response.data.lastName || '',
          email: response.data.email || '',
          password: '' // Don't show the password
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setMessage({ type: 'error', text: 'Failed to fetch user data' });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      // Only send necessary data for update
      const updateData = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        ...(userData.password && { password: userData.password }) // Only include password if it's been changed
      };

      await axios.put(`http://localhost:5000/api/signup/update/${user.email}`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      // Update the user data in localStorage
      localStorage.setItem('user', JSON.stringify({
        ...user,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email
      }));

      setMessage({ type: 'success', text: 'Profile updated successfully' });
      setIsEditing(false);
      
      // Refresh the user data
      fetchUserData();
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile' });
    }
  };

  return (
    <div className="profile-container">
      <UserNavbar />
      <div className="profile-content">
        <div className="profile-card">
          <h2>Profile Information</h2>
          
          {message.text && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={userData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={userData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={userData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  name="password"
                  value={userData.password}
                  onChange={handleInputChange}
                  placeholder="Enter new password (leave blank to keep current)"
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setIsEditing(false)} className="cancel-button">
                  Cancel
                </button>
                <button type="submit" className="save-button">
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-info">
              <div className="info-item">
                <span className="label">First Name:</span>
                <span className="value">{userData.firstName}</span>
              </div>
              <div className="info-item">
                <span className="label">Last Name:</span>
                <span className="value">{userData.lastName}</span>
              </div>
              <div className="info-item">
                <span className="label">Email:</span>
                <span className="value">{userData.email}</span>
              </div>
              <button 
                onClick={() => setIsEditing(true)} 
                className="edit-button"
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile; 