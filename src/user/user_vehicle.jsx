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
  const [sortOrder, setSortOrder] = useState("low-to-high")
  const navigate = useNavigate()

  useEffect(() => {
    fetchVehicles()
  }, [])

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
      (vehicle) =>
        vehicle.category.toLowerCase() === selectedCategory.toLowerCase() &&
        vehicle.name.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortOrder === "low-to-high") {
        return a.pricePerDay - b.pricePerDay
      }
      return b.pricePerDay - a.pricePerDay
    })

  const handleRentNow = (vehicle) => {
    navigate("/booking", { state: { vehicle } })
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

            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="sort-select">
              <option value="low-to-high">Price: Low to High</option>
              <option value="high-to-low">Price: High to Low</option>
            </select>

            <button className="filters-btn">
              <span>Filters</span>
            </button>
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
                  <button 
                    className="rent-btn"
                    onClick={() => handleRentNow(vehicle)}
                  >
                    Rent Now
                  </button>
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

