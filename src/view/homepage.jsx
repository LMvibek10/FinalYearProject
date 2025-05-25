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
    <header className="rentease-main-header">
      <div className="rentease-header-wrapper">
        <div className="rentease-header-inner">
          <div className="rentease-brand-logo">
            <img src="/images/logo.png" alt="RentEase Logo" className="rentease-logo-img" />
            <span className="rentease-brand-text">RentEase</span>
          </div>
          <nav className="rentease-navigation-menu">
            <a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('vehicle-fleet'); }} className="rentease-nav-item">
              Vehicles
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('how-we-work'); }} className="rentease-nav-item">
              How we Work
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('about-contact'); }} className="rentease-nav-item">
              About Us
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('about-contact'); }} className="rentease-nav-item">
              Contact Us
            </a>
          </nav>
          <div className="rentease-auth-section">
            {user ? (
              <>
                <span className="rentease-user-greeting">Welcome, {user.firstName}</span>
                <button className="rentease-logout-btn" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <button className="rentease-login-btn">Login</button>
                </Link>
                <Link to="/signup">
                  <button className="rentease-signup-btn">Sign Up</button>
                </Link>
              </>
            )}
          </div>
          <button className="rentease-mobile-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="rentease-mobile-dropdown">
          <div className="rentease-mobile-nav-wrapper">
            <a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('vehicle-fleet'); }} className="rentease-mobile-nav-link">
              🚗 Vehicles
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('how-we-work'); }} className="rentease-mobile-nav-link">
              ⚙️ How it Works
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('about-contact'); }} className="rentease-mobile-nav-link">
              ℹ️ About
            </a>
            <a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('about-contact'); }} className="rentease-mobile-nav-link">
              📞 Contact
            </a>
            <div className="rentease-mobile-auth-wrapper">
              {user ? (
                <>
                  <span className="rentease-mobile-user-greeting">Welcome, {user.firstName}</span>
                  <button className="rentease-mobile-logout-btn" onClick={handleLogout}>Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <button className="rentease-mobile-login-btn">Login</button>
                  </Link>
                  <Link to="/signup">
                    <button className="rentease-mobile-signup-btn">Sign Up</button>
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
    <div className="rentease-vehicle-showcase-card">
      <img src={image} alt={type} className="rentease-vehicle-showcase-img" />
      <div className="rentease-vehicle-showcase-info">
        <h3 className="rentease-vehicle-category-title">{type}</h3>
        <p className="rentease-vehicle-category-desc">{description}</p>
        <div className="rentease-vehicle-actions-wrapper">
          <button className="rentease-view-options-btn" onClick={handleViewOptions}>
            View Options →
          </button>
          <div className="rentease-price-badge">
            Starting from {startingPrice}
          </div>
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

  const handleBrowseVehicles = () => {
    if (user) {
      navigate('/user');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="rentease-homepage">
      <Header />
      
      {/* Hero Section */}
      <section className="rentease-hero-banner">
        <div className="rentease-hero-content-wrapper">
          <div className="rentease-hero-content">
            <h1 className="rentease-hero-main-title">Rent Any Vehicle, Anytime</h1>
            <p className="rentease-hero-description">
              Choose from our wide selection of premium vehicles for any occasion. 
              Experience seamless booking and exceptional service with RentEase.
            </p>
            <button className="rentease-hero-cta-btn" onClick={handleGetStarted}>
              Get Started <span className="rentease-cta-arrow">→</span>
            </button>
          </div>
        </div>
      </section>
      
      {/* Vehicle Categories */}
      <section id="vehicle-fleet" className="rentease-fleet-showcase">
        <div className="rentease-fleet-container">
          <h2 className="rentease-fleet-heading">Our Premium Vehicle Fleet</h2>
          <p className="rentease-fleet-subheading">
            Discover our diverse collection of well-maintained vehicles, perfect for every journey
          </p>
          <div className="rentease-vehicle-showcase-grid">
            <VehicleCard
              type="Cars"
              image="/images/car.png"
              description="Comfortable sedans and luxury cars for business trips, family outings, and special occasions"
              startingPrice="NPR 1,200"
            />
            <VehicleCard
              type="Bikes"
              image="/images/bike.png"
              description="Modern motorcycles perfect for urban commuting, weekend adventures, and quick city rides"
              startingPrice="NPR 800"
            />
            <VehicleCard
              type="Vans"
              image="/images/van.png"
              description="Spacious vans ideal for moving, group trips, cargo transport, and family vacations"
              startingPrice="NPR 2,500"
            />
            <VehicleCard
              type="Buses"
              image="/images/bus.png"
              description="Large capacity buses perfect for events, group travel, corporate outings, and tours"
              startingPrice="NPR 5,000"
            />
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="how-we-work" className="rentease-features-showcase">
        <div className="rentease-features-container">
          <h2 className="rentease-features-main-title">Why Choose RentEase</h2>
          <p className="rentease-features-subtitle">
            Experience the difference with our premium service and commitment to excellence
          </p>
          <div className="rentease-features-display-grid">
            <div className="rentease-feature-highlight-card">
              <div className="rentease-feature-icon-wrapper">24/7</div>
              <h3 className="rentease-feature-highlight-title">24/7 Availability</h3>
              <p className="rentease-feature-highlight-desc">
                Book your vehicle any time, day or night. Our round-the-clock service ensures you're never stranded.
              </p>
            </div>
            <div className="rentease-feature-highlight-card">
              <div className="rentease-feature-icon-wrapper">📍</div>
              <h3 className="rentease-feature-highlight-title">Convenient Locations</h3>
              <p className="rentease-feature-highlight-desc">
                Multiple pickup points across Kathmandu Valley for your convenience. Find us wherever you are.
              </p>
            </div>
            <div className="rentease-feature-highlight-card">
              <div className="rentease-feature-icon-wrapper">✔️</div>
              <h3 className="rentease-feature-highlight-title">Quality Guaranteed</h3>
              <p className="rentease-feature-highlight-desc">
                Well-maintained, regularly serviced vehicles you can trust. Your safety is our top priority.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="rentease-final-cta-section">
        <div className="rentease-final-cta-wrapper">
          <h2 className="rentease-final-cta-title">Ready to Get Moving?</h2>
          <p className="rentease-final-cta-description">
            Join thousands of satisfied customers who trust RentEase for their vehicle rental needs. 
            Experience the convenience of premium vehicle rentals today.
          </p>
          <button className="rentease-final-cta-btn" onClick={handleBrowseVehicles}>
            Browse Vehicles
          </button>
        </div>
      </section>
      
      {/* Footer */}
      <footer id="about-contact" className="rentease-main-footer">
        <div className="rentease-footer-content-wrapper">
          <div className="rentease-footer-brand-section">
            <h3 className="rentease-footer-brand-title">RentEase</h3>
            <p className="rentease-footer-brand-desc">
              Making vehicle rental easy and accessible for everyone. Your trusted partner for all transportation needs in Nepal.
            </p>
          </div>
          <div className="rentease-footer-section">
            <h4 className="rentease-footer-section-title">Quick Links</h4>
            <ul className="rentease-footer-links-list">
              <li><a href="#" className="rentease-footer-link-item">About Us</a></li>
              <li><a href="#" className="rentease-footer-link-item">Vehicles</a></li>
              <li><a href="#" className="rentease-footer-link-item">Locations</a></li>
              <li><a href="#" className="rentease-footer-link-item">Contact</a></li>
            </ul>
          </div>
          <div className="rentease-footer-section">
            <h4 className="rentease-footer-section-title">Support</h4>
            <ul className="rentease-footer-links-list">
              <li><a href="#" className="rentease-footer-link-item">FAQs</a></li>
              <li><a href="#" className="rentease-footer-link-item">Terms of Service</a></li>
              <li><a href="#" className="rentease-footer-link-item">Privacy Policy</a></li>
              <li><a href="#" className="rentease-footer-link-item">Help Center</a></li>
            </ul>
          </div>
          <div className="rentease-footer-section">
            <h4 className="rentease-footer-section-title">Contact Us</h4>
            <ul className="rentease-footer-contact-list">
              <li>📍 Old Baneshwor, Kathmandu</li>
              <li>✉️ rentease@gmail.com</li>
              <li>📞 +977-9742432498</li>
              <li>🕒 24/7 Customer Support</li>
            </ul>
          </div>
        </div>
        <div className="rentease-footer-bottom">
          <p>&copy; 2024 RentEase. All rights reserved. | Designed with ❤️ in Nepal</p>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;