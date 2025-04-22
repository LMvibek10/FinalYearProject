import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ad_users.css';
import Sidebar from '../component/ad_sidebar';
import AdminLayout from './AdminLayout';

const UserDetailsPopup = ({ user, onClose }) => {
  if (!user) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <div className="popup-header">
          <h2>User Details</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="popup-body">
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
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/signup/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUsers(users.filter(user => user._id !== userId));
      } catch (error) {
        console.error('Error deleting user:', error);
        setError('Failed to delete user. Please try again later.');
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