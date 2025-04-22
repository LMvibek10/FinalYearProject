import React, { useState } from 'react';
import { X, Upload, Car } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './VehicleForm.css';

const VehicleForm = ({ onClose, onAddVehicle, vehicle }) => {
  const [formData, setFormData] = useState({
    name: vehicle?.name || '',
    category: vehicle?.category || '',
    subcategory: vehicle?.subcategory || '',
    pricePerDay: vehicle?.pricePerDay || '',
    status: vehicle?.status || 'Available',
    image: vehicle?.image || null,
    fuelType: vehicle?.fuelType || '',
    seatingCapacity: vehicle?.seatingCapacity || '',
    makeYear: vehicle?.makeYear || ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add subcategory options mapping
  const subcategoryOptions = {
    Bike: ['Sports', 'Touring', 'Cruise', 'Naked'],
    Van: ['Hiace', 'Mini Van', 'Carrier'],
    Car: ['Sedan', 'Hatchback', 'Pickup'],
    Bus: ['Mini Bus', 'Tourist']
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Reset subcategory when category changes
      ...(name === 'category' && { subcategory: '' })
    }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5242880) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      try {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({
            ...prev,
            image: file  // Store the file object instead of base64
          }));
        };
        reader.readAsDataURL(file);
      } catch (error) {
        toast.error('Error processing image');
        console.error('Error processing image:', error);
      }
    }
  };

  const validateForm = () => {
    if (!formData.name || !formData.category || !formData.subcategory || 
        !formData.pricePerDay || !formData.status) {
      toast.error('Please fill in all required fields');
      return false;
    }
    if (!formData.image) {
      toast.error('Please upload a vehicle image');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const vehicleData = new FormData();
      
      // Append all form data except image
      Object.keys(formData).forEach(key => {
        if (key !== 'image' && formData[key] !== null && formData[key] !== '') {
          vehicleData.append(key, formData[key]);
        }
      });

      // Append image last
      if (formData.image) {
        vehicleData.append('image', formData.image);
      }

      // Log the FormData contents for debugging
      for (let pair of vehicleData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      let response;
      if (vehicle?._id) {
        response = await axios.put(
          `http://localhost:5000/api/vehicles/${vehicle._id}`,
          vehicleData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        toast.success('Vehicle updated successfully');
      } else {
        response = await axios.post(
          'http://localhost:5000/api/vehicles',
          vehicleData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        toast.success('Vehicle added successfully');
      }

      if (response.data) {
        onAddVehicle(response.data);
        onClose();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(error.response?.data?.message || 'Error saving vehicle');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="vehicle-form-overlay">
      <div className="vehicle-form">
        <div className="vehicle-form-header">
          <h2>
            <Car />
            {vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
          </h2>
          <button className="vehicle-form-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="vehicle-form-grid">
            <div className="vehicle-form-field">
              <label className="vehicle-form-label">Vehicle Name*</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="vehicle-form-input"
                required
                placeholder="Enter vehicle name"
              />
            </div>

            <div className="vehicle-form-field">
              <label className="vehicle-form-label">Category*</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="vehicle-form-select"
                required
              >
                <option value="">Select Category</option>
                <option value="Car">Car</option>
                <option value="Bike">Bike</option>
                <option value="Van">Van</option>
                <option value="Bus">Bus</option>
              </select>
            </div>

            <div className="vehicle-form-field">
              <label className="vehicle-form-label">Subcategory*</label>
              <select
                name="subcategory"
                value={formData.subcategory}
                onChange={handleChange}
                className="vehicle-form-select"
                required
                disabled={!formData.category} // Disable if no category selected
              >
                <option value="">Select Subcategory</option>
                {formData.category && subcategoryOptions[formData.category].map((option) => (
                  <option key={option} value={option.toLowerCase()}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="vehicle-form-field">
              <label className="vehicle-form-label">Price per Day*</label>
              <input
                type="number"
                name="pricePerDay"
                value={formData.pricePerDay}
                onChange={handleChange}
                className="vehicle-form-input"
                required
                min="0"
                placeholder="Enter price per day"
              />
            </div>

            <div className="vehicle-form-field">
              <label className="vehicle-form-label">Fuel Type</label>
              <select
                name="fuelType"
                value={formData.fuelType}
                onChange={handleChange}
                className="vehicle-form-select"
              >
                <option value="">Select Fuel Type</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div className="vehicle-form-field">
              <label className="vehicle-form-label">Status*</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="vehicle-form-select"
                required
              >
                <option value="Available">Available</option>
                <option value="In Use">In Use</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>

            <div className="vehicle-form-field">
              <label className="vehicle-form-label">Seating Capacity</label>
              <input
                type="number"
                name="seatingCapacity"
                value={formData.seatingCapacity}
                onChange={handleChange}
                className="vehicle-form-input"
                min="1"
                placeholder="Enter seating capacity"
              />
            </div>

            <div className="vehicle-form-field">
              <label className="vehicle-form-label">Make Year</label>
              <input
                type="number"
                name="makeYear"
                value={formData.makeYear}
                onChange={handleChange}
                className="vehicle-form-input"
                min="1900"
                max={new Date().getFullYear()}
                placeholder="Enter make year"
              />
            </div>

            <div className="vehicle-form-image-upload">
              <label>
                <Upload />
                <p>Upload vehicle image* (Max 5MB)</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
              {formData.image && (
                <div className="vehicle-form-image-preview">
                  <img
                    src={formData.image}
                    alt="Vehicle preview"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="vehicle-form-actions">
            <button
              type="button"
              onClick={onClose}
              className="vehicle-form-button vehicle-form-cancel"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="vehicle-form-button vehicle-form-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : vehicle ? 'Update Vehicle' : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleForm;
