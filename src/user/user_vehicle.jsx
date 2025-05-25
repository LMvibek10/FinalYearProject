"use client"

import { useState, useEffect } from "react"
import "./user_vehicle.css"
import axios from "axios"
import UserNavbar from "../component/UserNavbar"
import { useNavigate } from "react-router-dom"

const UserVehicle = () => {
  const [vehicles, setVehicles] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("Car")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSubcategory, setSelectedSubcategory] = useState("all")
  const navigate = useNavigate()

  // Subcategory options mapping
  const subcategoryOptions = {
    Car: ['Sedan', 'Hatchback', 'Pickup'],
    Bike: ['Sports', 'Touring', 'Cruise', 'Naked'],
    Van: ['Hiace', 'Mini Van', 'Carrier'],
    Bus: ['Mini Bus', 'Tourist']
  }

  useEffect(() => {
    fetchVehicles()
  }, [])

  // Reset subcategory when category changes
  useEffect(() => {
    setSelectedSubcategory("all")
  }, [selectedCategory])

  const fetchVehicles = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/vehicles/all")
      setVehicles(response.data)
    } catch (error) {
      console.error("Error fetching vehicles:", error)
    }
  }

  const filteredVehicles = vehicles
    .filter(
      (vehicle) => {
        const matchesCategory = vehicle.category.toLowerCase() === selectedCategory.toLowerCase()
        const matchesSearch = vehicle.name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesSubcategory = selectedSubcategory === "all" || 
          vehicle.subcategory.toLowerCase() === selectedSubcategory.toLowerCase()
        
        return matchesCategory && matchesSearch && matchesSubcategory
      }
    )

  const handleRentNow = (vehicle) => {
    // Check if vehicle is available
    if (vehicle.status !== 'Available') {
      alert('This vehicle is not available for booking at the moment.');
      return;
    }
    navigate("/booking", { state: { vehicle } })
  }

  // Handler for Rate Us button
  const handleRateUs = (vehicle) => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (!userData) {
      alert('Please login to rate vehicles');
      navigate('/login');
      return;
    }
    
    const user = JSON.parse(userData);
    const userId = user.id || user._id; // Handle both possible ID fields
    
    navigate("/user_rating", { state: { vehicleId: vehicle._id, userId } })
  }

  return (
    <div className="main-container">
      <UserNavbar />
      <div className="vehicle-container">
        <div className="search-section">
          <div className="category-buttons">
            {["Car", "Bike", "Van", "Bus"].map((category) => (
              <button
                key={category}
                className={`category-btn ${selectedCategory === category ? "active" : ""}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="search-filters">
            <input
              type="text"
              placeholder="Search vehicles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />

            <select 
              value={selectedSubcategory} 
              onChange={(e) => setSelectedSubcategory(e.target.value)} 
              className="subcategory-select"
            >
              <option value="all">All {selectedCategory} Types</option>
              {subcategoryOptions[selectedCategory]?.map((subcategory) => (
                <option key={subcategory} value={subcategory.toLowerCase()}>
                  {subcategory}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="vehicles-grid">
          {filteredVehicles.map((vehicle) => (
            <div key={vehicle._id} className="vehicle-card">
              <div className="card-image-container">
                <img
                  src={vehicle.image || "/placeholder.svg?height=300&width=500"}
                  alt={vehicle.name}
                  className="vehicle-image"
                />
                <div className="image-overlay">
                  <span className={`status-badge ${vehicle.status.toLowerCase()}`}>{vehicle.status}</span>
                  <div className="rating-badge">
                    <span className="star">⭐</span>
                    <span className="rating-value">{vehicle.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              <div className="vehicle-content">
                <div className="vehicle-header">
                  <div className="name-category-row">
                    <h3 className="vehicle-name">{vehicle.name}</h3>
                    <span className="vehicle-type">{vehicle.subcategory}</span>
                  </div>

                  <div className="specs-row">
                    <div className="spec-item">
                      <i className="fas fa-users"></i>
                      <span>{vehicle.seatingCapacity} Seats</span>
                    </div>
                    <div className="spec-item">
                      <i className="fas fa-gas-pump"></i>
                      <span>{vehicle.fuelType}</span>
                    </div>
                    <div className="spec-item">
                      <i className="fas fa-calendar"></i>
                      <span>{vehicle.makeYear}</span>
                    </div>
                  </div>
                </div>

                <div className="divider"></div>

                <div className="price-action">
                  <div className="price-details">
                    <div className="price-option">
                      <div className="price-header">Inside Valley</div>
                      <div className="price-amount">
                        <span className="currency">NPR</span>
                        <span className="amount">{vehicle.insideValleyPrice?.toLocaleString()}</span>
                        <span className="duration">/day</span>
                      </div>
                    </div>
                    <div className="price-option">
                      <div className="price-header">Outside Valley</div>
                      <div className="price-amount">
                        <span className="currency">NPR</span>
                        <span className="amount">{vehicle.outsideValleyPrice?.toLocaleString()}</span>
                        <span className="duration">/day</span>
                      </div>
                    </div>
                  </div>
                  <div className="button-group">
                    <button 
                      className="rate-btn"
                      onClick={() => handleRateUs(vehicle)}
                    >
                      Rate Us
                    </button>
                    <button 
                      className={`rent-btn ${vehicle.status !== 'Available' ? 'unavailable' : ''}`}
                      onClick={() => handleRentNow(vehicle)}
                      disabled={vehicle.status !== 'Available'}
                    >
                      {vehicle.status === 'Available' ? 'Rent Now' : 'Not Available'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default UserVehicle

