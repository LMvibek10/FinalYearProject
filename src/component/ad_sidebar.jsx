import React from "react";
import { Menu, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import "./ad_sidebar.css";

const SidebarItem = ({ icon, text, active = false, onClick }) => {
  return (
    <div className={`sidebar-item ${active ? "active" : ""}`} onClick={onClick}>
      <span className="sidebar-icon">{icon}</span>
      <span className="sidebar-text">{text}</span>
    </div>
  );
};

const Sidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleNavigation = (path) => {
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
          <SidebarItem icon="⚙️" text="Settings" />
          <div className="sidebar-footer">
            <SidebarItem 
              icon="🚪" 
              text="Logout" 
              onClick={handleLogout}
            />
          </div>
        </nav>
      </div>
      {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
    </>
  );
};

export default Sidebar; 