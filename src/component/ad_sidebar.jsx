import React, { useState, useEffect } from "react";
import { Menu, X, Bell } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./ad_sidebar.css";

const SidebarItem = ({ icon, text, active = false, onClick, badge = null, hasUnread = false }) => {
  return (
    <div className={`sidebar-item ${active ? "active" : ""}`} onClick={onClick}>
      <div className="sidebar-icon-container">
        <span className="sidebar-icon">{icon}</span>
        {hasUnread && <span className="unread-indicator"></span>}
      </div>
      <span className="sidebar-text">{text}</span>
      {badge && <span className="sidebar-badge">{badge}</span>}
    </div>
  );
};

const Sidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [notificationCount, setNotificationCount] = useState(0);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  useEffect(() => {
    fetchNotificationCount();
    // Poll for notification count every 30 seconds
    const interval = setInterval(fetchNotificationCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotificationCount = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/booking-requests/all');
      if (response.data.success) {
        const allRequests = response.data.data;
        
        // Count pending requests (new notifications)
        const pendingCount = allRequests.filter(request => request.status === 'pending').length;
        
        // Check if there are any unread notifications (pending requests)
        const hasUnread = pendingCount > 0;
        
        setNotificationCount(pendingCount);
        setHasUnreadNotifications(hasUnread);
      }
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleNavigation = (path) => {
    // If navigating to notifications, mark as read
    if (path === '/notifications') {
      setHasUnreadNotifications(false);
    }
    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <>
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h1>RentEase Admin</h1>
        </div>
        
        <div className="sidebar-content">
          <nav className="sidebar-nav">
            <SidebarItem 
              icon="🏠" 
              text="Dashboard" 
              active={location.pathname === '/dashboard'}
              onClick={() => handleNavigation('/dashboard')}
            />
            <SidebarItem 
              icon="🚗" 
              text="Vehicles" 
              active={location.pathname === '/admin'}
              onClick={() => handleNavigation('/admin')}
            />
            <SidebarItem 
              icon="👥" 
              text="Users" 
              active={location.pathname === '/users'}
              onClick={() => handleNavigation('/users')}
            />
            <SidebarItem 
              icon="⭐" 
              text="Ratings" 
              active={location.pathname === '/ratings'}
              onClick={() => handleNavigation('/ratings')}
            />
            <SidebarItem 
              icon={<Bell size={18} />}
              text="Notifications" 
              active={location.pathname === '/notifications'}
              onClick={() => handleNavigation('/notifications')}
              badge={notificationCount > 0 ? notificationCount : null}
              hasUnread={hasUnreadNotifications}
            />
            </nav>
        </div>
        
        <div className="sidebar-footer">
          <SidebarItem 
            icon="🚪" 
            text="Logout" 
            onClick={handleLogout}
          />
        </div>
      </div>
      {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
    </>
  );
};

export default Sidebar; 