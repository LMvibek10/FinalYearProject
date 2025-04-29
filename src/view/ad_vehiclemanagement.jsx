import React, { useState, useEffect } from "react";
import { Search, Plus, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import "./ad_vehiclemanagement.css"; // Import the CSS file
import VehicleForm from "../component/VehicleForm"; // Import the VehicleForm component
import Sidebar from "../component/ad_sidebar"; // Import the new Sidebar component
import AdminLayout from './AdminLayout';

const VehicleTable = ({ vehicles, onDelete, onEdit }) => {
  return (
    <div className="ad-vm-vehicle-table">
      <table>
        <thead>
          <tr>
            <th>Image</th>
            <th>Vehicle</th>
            <th>Category</th>
            <th>Status</th>
            <th>Inside Valley Price</th>
            <th>Outside Valley Price</th>
            <th>Rating</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((vehicle) => (
            <tr key={vehicle._id}>
              <td>
                {/* Displaying Image */}
                {vehicle.image && <img src={vehicle.image} alt={vehicle.name} width="50" />}
              </td>
              <td>
                {/* Displaying Vehicle Name */}
                <div className="ad-vm-vehicle-name">{vehicle.name}</div>
                <div className="ad-vm-vehicle-subcategory">{vehicle.subcategory}</div>
              </td>
              <td>{vehicle.category}</td>
              <td>
                {/* Displaying Status */}
                <span className="ad-vm-status">{vehicle.status}</span>
              </td>
              <td>NPR {vehicle.insideValleyPrice?.toLocaleString()}</td>
              <td>NPR {vehicle.outsideValleyPrice?.toLocaleString()}</td>
              <td>{vehicle.rating}</td>
              <td>
                {/* Action buttons */}
                <div className="ad-vm-actions">
                  <button className="ad-vm-edit" onClick={() => onEdit(vehicle)}>✏️</button>
                  <button className="ad-vm-delete" onClick={() => onDelete(vehicle)}>
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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

  // Fetch all vehicles data from the database
  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/vehicles/all");
      setVehicles(response.data); // Set the fetched vehicle data
      setHeading(`Displaying ${response.data.length} Vehicles:`);
    } catch (error) {
      console.error("Failed to fetch vehicles:", error);
      setVehicles([]);
      setHeading("No vehicles available.");
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
    // Show confirmation alert before deleting
    const isConfirmed = window.confirm(`Are you sure you want to delete ${vehicle.name}?`);
  
    if (isConfirmed) {
      // Proceed with the deletion if confirmed
      axios
        .delete(`http://localhost:5000/api/vehicles/${vehicle._id}`) // Pass vehicle ID to the URL
        .then(() => {
          // After deletion, refresh the vehicle list
          fetchVehicles();
          toast.success("Vehicle deleted successfully");
        })
        .catch((error) => {
          toast.error("Failed to delete vehicle");
          console.error("Error deleting vehicle:", error);
        });
    } else {
      // If not confirmed, do nothing (deletion is canceled)
      toast.info("Vehicle deletion canceled");
    }
  };
  
  
  

  const handleAddNewVehicle = async (newVehicle) => {
    try {
      // Re-fetch the vehicles list after adding a new vehicle
      await fetchVehicles(); // This will fetch and set the updated list of vehicles
      toast.success("Vehicle added successfully");
    } catch (error) {
      toast.error("Failed to add vehicle");
    }
  };

  const handleUpdateVehicle = async (updatedVehicle) => {
    try {
      // Re-fetch the vehicles list after updating a vehicle
      await fetchVehicles(); // This will fetch and set the updated list of vehicles
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

  return (
    <AdminLayout>
      <div className="vehicle-management-content">
        <div className="ad-vm-admin-dashboard">
          <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
          <div className={`ad-vm-main-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
            <div className="ad-vm-header">
              <h1>Vehicle Management</h1>
              <button onClick={handleAddVehicle} className="ad-vm-add-vehicle-btn">
                <Plus /> Add Vehicle
              </button>
            </div>
            <div className="ad-vm-content">
              <div className="ad-vm-search-filter">
                <div className="ad-vm-search-bar">
                  <Search />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search vehicles..."
                  />
                </div>
                <div className="ad-vm-filter-sort">
                  <select 
                    value={selectedCategory} 
                    onChange={handleCategoryChange}
                    className="ad-vm-category-select"
                  >
                    <option value="all">All Categories</option>
                    <option value="Bike">Bike</option>
                    <option value="Car">Car</option>
                    <option value="Van">Van</option>
                    <option value="Bus">Bus</option>
                  </select>
                </div>
              </div>
              <h2>Displaying {filteredVehicles.length} {filteredVehicles.length === 1 ? 'Vehicle' : 'Vehicles'}:</h2>
              <VehicleTable
                vehicles={filteredVehicles}
                onDelete={handleDeleteVehicle}
                onEdit={handleEditVehicle}
              />
            </div>
          </div>
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
              vehicle={selectedVehicle} // Pass selected vehicle to pre-populate the form
            />
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default VehicleManagement;
