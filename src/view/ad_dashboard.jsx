"use client"

import { useState, useEffect } from "react"
import { Calendar, Car, CheckCircle2, TrendingUp, Users, Activity, BarChart3 } from "lucide-react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import Sidebar from "../component/ad_sidebar"
import "./ad_dashboard.css"

// Import your vehicle images
import carIcon from "../image/car.png"
import bikeIcon from "../image/bike.png"
import vanIcon from "../image/van.png"
import busIcon from "../image/bus.png"

const Dashboard = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [dashboardData, setDashboardData] = useState({
    totalVehicles: 0,
    activeRentals: 0,
    bookedVehicles: 0,
    availableVehicles: 0,
    averageInsidePrice: 0,
    averageOutsidePrice: 0,
    categoryCount: {
      Car: 0,
      Bike: 0,
      Van: 0,
      Bus: 0,
    },
  })
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchDashboardData()
    // Set up real-time updates every 10 seconds
    const interval = setInterval(fetchDashboardData, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get("http://localhost:5000/api/vehicles/all")
      const vehicles = response.data

      // Calculate statistics
      const totalVehicles = vehicles.length
      const activeRentals = vehicles.filter((v) => v.status === "Booked").length
      const bookedVehicles = vehicles.filter((v) => v.status === "Booked").length
      const availableVehicles = vehicles.filter((v) => v.status === "Available").length

      // Calculate average prices
      const totalInsidePrice = vehicles.reduce((sum, v) => sum + (v.insideValleyPrice || 0), 0)
      const totalOutsidePrice = vehicles.reduce((sum, v) => sum + (v.outsideValleyPrice || 0), 0)
      const averageInsidePrice = totalVehicles ? Math.round(totalInsidePrice / totalVehicles) : 0
      const averageOutsidePrice = totalVehicles ? Math.round(totalOutsidePrice / totalVehicles) : 0

      // Calculate category counts
      const categoryCount = {
        Car: vehicles.filter((v) => v.category === "Car").length,
        Bike: vehicles.filter((v) => v.category === "Bike").length,
        Van: vehicles.filter((v) => v.category === "Van").length,
        Bus: vehicles.filter((v) => v.category === "Bus").length,
      }

      setDashboardData({
        totalVehicles,
        activeRentals,
        bookedVehicles,
        availableVehicles,
        averageInsidePrice,
        averageOutsidePrice,
        categoryCount,
      })
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const stats = [
    {
      icon: <Car className="stat-icon" />,
      title: "Total Vehicles",
      value: dashboardData.totalVehicles,
      className: "stat-card-blue",

      description: "Total fleet size"
    },
    {
      icon: <Activity className="stat-icon" />,
      title: "Active Rentals",
      value: dashboardData.activeRentals,
      className: "stat-card-green",

      description: "Currently booked"
    },
    {
      icon: <CheckCircle2 className="stat-icon" />,
      title: "Available",
      value: dashboardData.availableVehicles,
      className: "stat-card-purple",

      description: "Ready to rent"
    },
    ]

  const vehicleTypes = [
    {
      image: carIcon,
      type: "Cars",
      count: dashboardData.categoryCount.Car,
      className: "vehicle-card-blue"
    },
    {
      image: bikeIcon,
      type: "Bikes",
      count: dashboardData.categoryCount.Bike,
      className: "vehicle-card-green"
    },
    {
      image: vanIcon,
      type: "Vans",
      count: dashboardData.categoryCount.Van,
      className: "vehicle-card-amber"
    },
    {
      image: busIcon,
      type: "Buses",
      count: dashboardData.categoryCount.Bus,
      className: "vehicle-card-purple"
    },
  ]

  const { totalVehicles } = dashboardData

  const handleAddVehicle = () => {
    navigate('/admin')
  }

  const handleManageUsers = () => {
    navigate('/users')
  }

  return (
    <div className="dashboard-container">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <main className={`dashboard-content ${isOpen ? "sidebar-open" : ""}`}>
        <div className="dashboard-inner">
          {/* Enhanced Header */}
          <div className="dashboard-header">
            <div className="header-content">
              <div className="header-text">
                <h1>Admin Dashboard</h1>
                <p>Monitor and manage your vehicle rental business</p>
              </div>
            </div>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="stats-section">
            <h2 className="section-title">
              <BarChart3 className="section-icon" />
              Key Metrics
            </h2>
            <div className="stats-grid">
              {stats.map((stat, index) => (
                <div key={index} className={`stat-card ${stat.className} ${isLoading ? 'loading' : ''}`}>
                  <div className="stat-card-content">
                    <div className="stat-card-header">
                      <div className="stat-icon-wrapper">{stat.icon}</div>
                      {/* <div className="stat-trend">
                        <span className="trend-value">{stat.trend}</span>
                      </div> */}
                    </div>
                    <div className="stat-main">
                      <span className="stat-value">{stat.value}</span>
                      <h3 className="stat-title">{stat.title}</h3>
                      <p className="stat-description">{stat.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Vehicle Categories */}
          <div className="vehicle-section">
            <h2 className="section-title">
              <Car className="section-icon" />
              Fleet Overview
            </h2>
            <div className="vehicle-types-grid">
              {vehicleTypes.map((vehicle, index) => (
                <div key={index} className={`vehicle-type-card ${vehicle.className} ${isLoading ? 'loading' : ''}`}>
                  <div className="vehicle-card-content">
                    <div className="vehicle-header">
                      <div className="vehicle-icon-wrapper">
                        <img src={vehicle.image || "/placeholder.svg"} alt={vehicle.type} className="vehicle-icon" />
                      </div>
                    </div>
                    <div className="vehicle-info">
                      <span className="vehicle-type-name">{vehicle.type}</span>
                      <span className="vehicle-type-count">{vehicle.count} vehicles</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions-section">
            <h2 className="section-title">
              <Activity className="section-icon" />
              Quick Actions
            </h2>
            <div className="quick-actions-grid">
              <div className="action-card" onClick={handleAddVehicle}>
                <div className="action-icon">
                  <Car />
                </div>
                <h3>Add Vehicle</h3>
                <p>Add new vehicles to your fleet</p>
              </div>
              <div className="action-card" onClick={handleManageUsers}>
                <div className="action-icon">
                  <Users />
                </div>
                <h3>Manage Users</h3>
                <p>View and manage customer accounts</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard

