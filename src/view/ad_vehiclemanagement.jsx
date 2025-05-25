import React, { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Car, Star, MapPin, Calendar, TrendingUp, DollarSign, Users } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";
import "./ad_vehiclemanagement.css";
import VehicleForm from "../component/VehicleForm";
import Sidebar from "../component/ad_sidebar";
import AdminLayout from './AdminLayout';

const VehicleCards = ({ vehicles, onDelete, onEdit }) => {
  const handleImageError = (e) => {
    e.target.src = '/placeholder-vehicle.png'; // Fallback image
    e.target.onerror = null; // Prevent infinite loop
  };

  const getDefaultImage = (category) => {
    const defaultImages = {
      'Car': '🚗',
      'Bike': '🏍️',
      'Van': '🚐',
      'Bus': '🚌'
    };
    return defaultImages[category] || '🚗';
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'available': return '#10b981';
      case 'booked': return '#f59e0b';
      case 'maintenance': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price).replace('NPR', 'NPR ');
  };

  return (
    <div className="vehicle-cards-container">
      <div className="vehicle-cards-grid">
        {vehicles.map((vehicle) => (
          <div key={vehicle._id} className="vehicle-card">
            {/* Card Header with Image */}
            <div className="vehicle-card-header">
              <div className="vehicle-card-image">
                {vehicle.image ? (
                  <img 
                    src={vehicle.image} 
                    alt={vehicle.name} 
                    className="vehicle-card-thumbnail"
                    onError={handleImageError}
                  />
                ) : (
                  <div className="vehicle-card-placeholder">
                    <span className="vehicle-card-emoji">{getDefaultImage(vehicle.category)}</span>
                  </div>
                )}
              </div>
              
              {/* Status Badge */}
              <div className="vehicle-status-badge">
                <span 
                  className="status-dot"
                  style={{ backgroundColor: getStatusColor(vehicle.status) }}
                ></span>
                <span className="status-label">{vehicle.status}</span>
              </div>
            </div>

            {/* Card Body */}
            <div className="vehicle-card-body">
              {/* Vehicle Name and Category */}
              <div className="vehicle-card-title">
                <h3 className="vehicle-card-name" title={vehicle.name}>{vehicle.name}</h3>
                <div className="vehicle-card-meta">
                  <span className={`category-tag category-${vehicle.category.toLowerCase()}`}>
                    <span className="category-emoji">{getDefaultImage(vehicle.category)}</span>
                    {vehicle.category}
                  </span>
                  <span className="vehicle-card-id">#{vehicle._id.slice(-6)}</span>
                </div>
              </div>

              {/* Subcategory */}
              <div className="vehicle-subcategory-tag">
                {vehicle.subcategory}
              </div>

              {/* Pricing Section */}
              <div className="vehicle-pricing-section">
                <div className="pricing-header">
                  <span>Pricing</span>
                </div>
                <div className="pricing-details">
                  <div className="price-item">
                    <span className="price-type">Inside Valley</span>
                    <span className="price-value">{formatPrice(vehicle.insideValleyPrice || 0)}</span>
                  </div>
                  <div className="price-item">
                    <span className="price-type">Outside Valley</span>
                    <span className="price-value">{formatPrice(vehicle.outsideValleyPrice || 0)}</span>
                  </div>
                </div>
              </div>

              {/* Rating Section */}
              <div className="vehicle-rating-section">
                <div className="rating-container">
                  <Star size={16} className="rating-icon" fill="currentColor" />
                  <span className="rating-score">{vehicle.rating || 'N/A'}</span>
                  <span className="rating-text">
                    {vehicle.rating ? `(${vehicle.rating}/5.0)` : 'No ratings yet'}
                  </span>
                </div>
              </div>
            </div>

            {/* Card Footer with Actions */}
            <div className="vehicle-card-footer">
              <button 
                className="card-action-btn edit-card-btn" 
                onClick={() => onEdit(vehicle)}
                title="Edit Vehicle"
              >
                <Edit size={16} />
                Edit
              </button>
              <button 
                className="card-action-btn delete-card-btn" 
                onClick={() => onDelete(vehicle)}
                title="Delete Vehicle"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const VehicleManagement = () => {
  const [showAddVehicleForm, setShowAddVehicleForm] = useState(false);
  const [showEditVehicleForm, setShowEditVehicleForm] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [heading, setHeading] = useState("Displaying Vehicles:");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("http://localhost:5000/api/vehicles/all");
      setVehicles(response.data);
      setHeading(`Displaying ${response.data.length} Vehicles:`);
    } catch (error) {
      console.error("Failed to fetch vehicles:", error);
      setVehicles([]);
      setHeading("No vehicles available.");
      toast.error("Failed to fetch vehicles");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddVehicle = () => {
    setShowAddVehicleForm(true);
  };

  const handleEditVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowEditVehicleForm(true);
  };

  const handleDeleteVehicle = (vehicle) => {
    const isConfirmed = window.confirm(`Are you sure you want to delete ${vehicle.name}?`);
  
    if (isConfirmed) {
      axios
        .delete(`http://localhost:5000/api/vehicles/${vehicle._id}`)
        .then(() => {
          fetchVehicles();
          toast.success("Vehicle deleted successfully");
        })
        .catch((error) => {
          toast.error("Failed to delete vehicle");
          console.error("Error deleting vehicle:", error);
        });
    } else {
      toast("Vehicle deletion canceled");
    }
  };

  const handleAddNewVehicle = async (newVehicle) => {
    try {
      await fetchVehicles();
      toast.success("Vehicle added successfully");
    } catch (error) {
      toast.error("Failed to add vehicle");
    }
  };

  const handleUpdateVehicle = async (updatedVehicle) => {
    try {
      await fetchVehicles();
      setShowEditVehicleForm(false);
      toast.success("Vehicle updated successfully");
    } catch (error) {
      toast.error("Failed to update vehicle");
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch = vehicle.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || vehicle.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getVehicleStats = () => {
    const total = vehicles.length;
    const available = vehicles.filter(v => v.status === 'Available').length;
    const booked = vehicles.filter(v => v.status === 'Booked').length;
    
    return { total, available, booked };
  };

  const stats = getVehicleStats();

  return (
    <AdminLayout>
      <div className="vehicle-management-content">
        <div className="ad-vm-admin-dashboard">
          <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
          <div className={`ad-vm-main-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            
            {/* Enhanced Header */}
            <div className="ad-vm-header">
              <div className="header-content">
                <div className="header-text">
                  <h1>
                    <Car className="header-icon" />
                    Vehicle Management
                  </h1>
                  <p>Manage your fleet of vehicles efficiently</p>
                  <div className="quick-stats">
                    <span className="stat-item">
                      <strong>{stats.total}</strong> Total
                    </span>
                    <span className="stat-item">
                      <strong>{stats.available}</strong> Available
                    </span>
                    <span className="stat-item">
                      <strong>{stats.booked}</strong> Booked
                    </span>
                  </div>
                </div>
                <button onClick={handleAddVehicle} className="ad-vm-add-vehicle-btn">
                  <Plus size={20} />
                  Add New Vehicle
                </button>
              </div>
            </div>

            {/* Search and Filter Section */}
            <div className="ad-vm-content">
              <div className="ad-vm-search-filter">
                <div className="search-section">
                  <div className="ad-vm-search-bar">
                    <Search className="search-icon" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      placeholder="Search vehicles by name..."
                    />
                  </div>
                  <div className="filter-section">
                    <select 
                      value={selectedCategory} 
                      onChange={handleCategoryChange}
                      className="ad-vm-category-select"
                    >
                      <option value="all">All Categories</option>
                      <option value="Car">Cars</option>
                      <option value="Bike">Bikes</option>
                      <option value="Van">Vans</option>
                      <option value="Bus">Buses</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Results Header */}
              <div className="results-header">
                <h2>
                  <Calendar size={20} />
                  {filteredVehicles.length} {filteredVehicles.length === 1 ? 'Vehicle' : 'Vehicles'} Found
                </h2>
                {searchQuery && (
                  <p className="search-info">
                    Showing results for "<strong>{searchQuery}</strong>"
                    {selectedCategory !== "all" && ` in ${selectedCategory} category`}
                  </p>
                )}
              </div>

              {/* Vehicle Cards */}
              {isLoading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Loading vehicles...</p>
                </div>
              ) : filteredVehicles.length === 0 ? (
                <div className="no-results">
                  <Car className="no-results-icon" />
                  <h3>No vehicles found</h3>
                  <p>Try adjusting your search criteria or add a new vehicle.</p>
                </div>
              ) : (
                <VehicleCards
                  vehicles={filteredVehicles}
                  onDelete={handleDeleteVehicle}
                  onEdit={handleEditVehicle}
                />
              )}
            </div>
          </div>

          {/* Vehicle Forms */}
          {showAddVehicleForm && (
            <VehicleForm
              onClose={() => setShowAddVehicleForm(false)}
              onAddVehicle={handleAddNewVehicle}
            />
          )}
          {showEditVehicleForm && selectedVehicle && (
            <VehicleForm
              onClose={() => setShowEditVehicleForm(false)}
              onAddVehicle={handleUpdateVehicle}
              vehicle={selectedVehicle}
            />
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default VehicleManagement;
