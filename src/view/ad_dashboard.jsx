"use client"

import { useState, useEffect } from "react"
import { Calendar, Car, CheckCircle2, DollarSign } from "lucide-react"
import axios from "axios"
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

  useEffect(() => {
    fetchDashboardData()
    // Set up real-time updates every 10 seconds
    const interval = setInterval(fetchDashboardData, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    try {
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
    }
  }

  const stats = [
    {
      icon: <Car className="stat-icon" />,
      title: "Total Vehicles",
      value: dashboardData.totalVehicles,
      className: "stat-card-blue",
    },
    {
      icon: <Calendar className="stat-icon" />,
      title: "Active Rentals (Booked)",
      value: dashboardData.activeRentals,
      className: "stat-card-green",
    },
    {
      icon: <CheckCircle2 className="stat-icon" />,
      title: "Available",
      value: dashboardData.availableVehicles,
      className: "stat-card-purple",
    },
    {
      title: "Avg. Inside Valley Price",
      value: `NPR ${dashboardData.averageInsidePrice.toLocaleString()}`,
      className: "stat-card-amber",
    },
    {
      title: "Avg. Outside Valley Price",
      value: `NPR ${dashboardData.averageOutsidePrice.toLocaleString()}`,
      className: "stat-card-red",
    },
  ]

  const vehicleTypes = [
    {
      image: carIcon,
      type: "Cars",
      count: dashboardData.categoryCount.Car,
      className: "vehicle-card-blue",
    },
    {
      image: bikeIcon,
      type: "Bikes",
      count: dashboardData.categoryCount.Bike,
      className: "vehicle-card-green",
    },
    {
      image: vanIcon,
      type: "Vans",
      count: dashboardData.categoryCount.Van,
      className: "vehicle-card-amber",
    },
    {
      image: busIcon,
      type: "Buses",
      count: dashboardData.categoryCount.Bus,
      className: "vehicle-card-purple",
    },
  ]

  return (
    <div className="dashboard-container">
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      <main className={`dashboard-content ${isOpen ? "sidebar-open" : ""}`}>
        <div className="dashboard-inner">
          <div className="dashboard-header">
            <h1>Admin Dashboard</h1>
            <p>Manage and monitor your vehicle fleet</p>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className={`stat-card ${stat.className}`}>
                <div className="stat-card-content">
                  <div className="stat-card-header">
                    <div className="stat-icon-wrapper">{stat.icon}</div>
                    <span className="stat-value">{stat.value}</span>
                  </div>
                  <h3 className="stat-title">{stat.title}</h3>
                </div>
              </div>
            ))}
          </div>

          {/* Vehicle Types */}
          <h2 className="section-title">Vehicle Categories</h2>
          <div className="vehicle-types-grid">
            {vehicleTypes.map((vehicle, index) => (
              <div key={index} className={`vehicle-type-card ${vehicle.className}`}>
                <div className="vehicle-card-content">
                  <div className="vehicle-info">
                    <div className="vehicle-icon-wrapper">
                      <img src={vehicle.image || "/placeholder.svg"} alt={vehicle.type} className="vehicle-icon" />
                    </div>
                    <span className="vehicle-type-name">{vehicle.type}</span>
                  </div>
                  <span className="vehicle-type-count">{vehicle.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard

