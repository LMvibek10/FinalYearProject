import React, { useState, useEffect, useRef } from "react";
import "./homepage.css"; // Import the CSS file
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false); // Close mobile menu after clicking
  };

  return (
    <header className="homepage-header">
      <div className="homepage-header-container">
        <div className="homepage-header-content">
          <div className="homepage-logo">
            <img src="/images/logo.png" alt="RentEase Logo" className="homepage-logo-image" />
          </div>
          <nav className="homepage-nav-links">
            <a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('vehicle-fleet'); }} className="homepage-nav-link">
              Vehicles
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('how-we-work'); }} className="homepage-nav-link">
              How we Work
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('about-contact'); }} className="homepage-nav-link">
              About Us
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('about-contact'); }} className="homepage-nav-link">
              Contact Us
            </a>
          </nav>
          <div className="homepage-auth-buttons">
            {user ? (
              <>
                <span className="homepage-user-name">Welcome, {user.firstName}</span>
                <button className="homepage-logout-button" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <button className="homepage-login-button">Login</button>
                </Link>
                <Link to="/signup">
                  <button className="homepage-signup-button">Sign Up</button>
                </Link>
              </>
            )}
          </div>
          <button className="homepage-menu-button" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="homepage-mobile-menu">
          <div className="homepage-mobile-menu-content">
            <a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('vehicle-fleet'); }} className="homepage-mobile-nav-link">
              Vehicles
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('how-we-work'); }} className="homepage-mobile-nav-link">
              How it Works
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('about-contact'); }} className="homepage-mobile-nav-link">
              About
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('about-contact'); }} className="homepage-mobile-nav-link">
              Contact
            </a>
            <div className="homepage-mobile-auth-buttons">
              {user ? (
                <>
                  <span className="homepage-mobile-user-name">Welcome, {user.firstName}</span>
                  <button className="homepage-mobile-logout-button" onClick={handleLogout}>Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <button className="homepage-mobile-login-button">Login</button>
                  </Link>
                  <Link to="/signup">
                    <button className="homepage-mobile-signup-button">Sign Up</button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

const VehicleCard = ({ type, image, description, startingPrice }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleViewOptions = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Convert type to lowercase for URL and remove 's' from plural
    const category = type.toLowerCase().slice(0, -1);
    navigate(`/user?category=${category}`);
  };

  return (
    <div className="homepage-vehicle-card">
      <img src={image} alt={type} className="homepage-vehicle-image" />
      <div className="homepage-vehicle-details">
        <h3 className="homepage-vehicle-type">{type}</h3>
        <p className="homepage-vehicle-description">{description}</p>
        <div className="homepage-vehicle-actions">
          <button className="homepage-view-options-button" onClick={handleViewOptions}>
            View Options
          </button>
        </div>
      </div>
    </div>
  );
};

const Homepage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleGetStarted = () => {
    if (user) {
      navigate('/user');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="homepage">
      <Header />
      {/* Hero Section */}
      <section className="homepage-hero-section">
        <div className="homepage-hero-container">
          <div className="homepage-hero-content">
            <h1 className="homepage-hero-title">Rent Any Vehicle, Anytime</h1>
            <p className="homepage-hero-subtitle">
              Choose from our wide selection of vehicles for any occasion
            </p>
            <button className="homepage-hero-button" onClick={handleGetStarted}>
              Get Started <span className="homepage-arrow">→</span>
            </button>
          </div>
        </div>
      </section>
      {/* Vehicle Categories */}
      <section id="vehicle-fleet" className="homepage-vehicle-categories">
        <div className="homepage-categories-container">
          <h2 className="homepage-categories-title">Our Vehicle Fleet</h2>
          <div className="homepage-vehicle-grid">
            <VehicleCard
              type="Cars"
              image="/images/car.png"
              description="Comfortable sedans and luxury cars for any occasion"
              startingPrice="NPR 49"
            />
            <VehicleCard
              type="Bikes"
              image="/images/bike.png"
              description="Modern motorcycles for urban commuting and adventures"
              startingPrice="NPR 29"
            />
            <VehicleCard
              type="Vans"
              image="/images/van.png"
              description="Spacious vans perfect for moving or group trips"
              startingPrice="NPR 89"
            />
            <VehicleCard
              type="Buses"
              image="/images/bus.png"
              description="Large capacity buses for events and group travel"
              startingPrice="NPR 199"
            />
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section id="how-we-work" className="homepage-features-section">
        <div className="homepage-features-container">
          <h2 className="homepage-features-title">Why Choose RentEase</h2>
          <div className="homepage-features-grid">
            <div className="homepage-feature">
              <span className="homepage-feature-icon">24/7</span>
              <h3 className="homepage-feature-title">24/7 Availability</h3>
              <p className="homepage-feature-description">Book your vehicle any time, day or night</p>
            </div>
            <div className="homepage-feature">
              <span className="homepage-feature-icon">📍</span>
              <h3 className="homepage-feature-title">Convenient Locations</h3>
              <p className="homepage-feature-description">Multiple pickup points across the city</p>
            </div>
            <div className="homepage-feature">
              <span className="homepage-feature-icon">✔️</span>
              <h3 className="homepage-feature-title">Quality Guaranteed</h3>
              <p className="homepage-feature-description">Well-maintained vehicles you can trust</p>
            </div>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="homepage-cta-section">
        <div className="homepage-cta-container">
          <h2 className="homepage-cta-title">Ready to Get Moving?</h2>
          <p className="homepage-cta-subtitle">
            Join thousands of satisfied customers who trust RentEase for their vehicle rental needs
          </p>
          <button className="homepage-cta-button">Browse Vehicles</button>
        </div>
      </section>
      {/* Footer */}
      <footer id="about-contact" className="homepage-footer">
        <div className="homepage-footer-container">
          <div className="homepage-footer-section">
            <h3 className="homepage-footer-heading">RentEase</h3>
            <p className="homepage-footer-text">Making vehicle rental easy and accessible for everyone.</p>
          </div>
          <div className="homepage-footer-section">
            <h4 className="homepage-footer-heading">Quick Links</h4>
            <ul className="homepage-footer-links">
              <li><a href="#" className="homepage-footer-link">About Us</a></li>
              <li><a href="#" className="homepage-footer-link">Vehicles</a></li>
              <li><a href="#" className="homepage-footer-link">Locations</a></li>
              <li><a href="#" className="homepage-footer-link">Contact</a></li>
            </ul>
          </div>
          <div className="homepage-footer-section">
            <h4 className="homepage-footer-heading">Support</h4>
            <ul className="homepage-footer-links">
              <li><a href="#" className="homepage-footer-link">FAQs</a></li>
              <li><a href="#" className="homepage-footer-link">Terms of Service</a></li>
              <li><a href="#" className="homepage-footer-link">Privacy Policy</a></li>
            </ul>
          </div>
          <div className="homepage-footer-section">
            <h4 className="homepage-footer-heading">Contact Us</h4>
            <ul className="homepage-footer-contact">
              <li>Old Baneshwor, Kathmandu</li>
              <li>rentease@gmail.com</li>
              <li>+977-9742432498</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;