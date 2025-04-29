import React, { useState, useEffect } from 'react';
import { X, Upload, Car } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import './VehicleForm.css';

const VehicleForm = ({ onClose, onAddVehicle, vehicle }) => {
  const [formData, setFormData] = useState({
    name: vehicle?.name || '',
    category: vehicle?.category || '',
    subcategory: vehicle?.subcategory || '',
    insideValleyPrice: vehicle?.insideValleyPrice || '',
    outsideValleyPrice: vehicle?.outsideValleyPrice || '',
    status: vehicle?.status || 'Available',
    image: null,
    fuelType: vehicle?.fuelType || '',
    seatingCapacity: vehicle?.seatingCapacity || '',
    makeYear: vehicle?.makeYear || ''
  });
  
  const [imagePreview, setImagePreview] = useState(vehicle?.image || null);
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
    if (name === 'insideValleyPrice' || name === 'outsideValleyPrice') {
      // Only allow positive numbers
      const numValue = parseFloat(value);
      if (numValue < 0) return;
      
      setFormData(prev => ({
        ...prev,
        [name]: value // Keep as string for input field
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        ...(name === 'category' && { subcategory: '' })
      }));
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5242880) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }

      try {
        setFormData(prev => ({
          ...prev,
          image: file
        }));

        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
      } catch (error) {
        toast.error('Error processing image');
        console.error('Error processing image:', error);
      }
    }
  };

  const validateForm = () => {
    if (!formData.name || !formData.category || !formData.subcategory || 
        !formData.insideValleyPrice || !formData.outsideValleyPrice || !formData.status) {
      toast.error('Please fill in all required fields');
      return false;
    }
    if (!formData.image && !vehicle?.image) {
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
      
      // Convert price strings to numbers and round them
      const dataToSend = {
        ...formData,
        insideValleyPrice: Math.round(parseFloat(formData.insideValleyPrice)),
        outsideValleyPrice: Math.round(parseFloat(formData.outsideValleyPrice))
      };
      
      // Append all form data except image
      Object.keys(dataToSend).forEach(key => {
        if (key !== 'image' && dataToSend[key] !== null && dataToSend[key] !== '') {
          vehicleData.append(key, dataToSend[key]);
        }
      });

      // Append image only if a new one is selected
      if (formData.image instanceof File) {
        vehicleData.append('image', formData.image);
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

  // Cleanup function for image preview URL
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

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
              <label className="vehicle-form-label">Inside Valley Price (NPR/day)*</label>
              <input
                type="number"
                name="insideValleyPrice"
                value={formData.insideValleyPrice}
                onChange={handleChange}
                className="vehicle-form-input"
                required
                min="0"
                placeholder="Enter price per day inside valley"
              />
            </div>

            <div className="vehicle-form-field">
              <label className="vehicle-form-label">Outside Valley Price (NPR/day)*</label>
              <input
                type="number"
                name="outsideValleyPrice"
                value={formData.outsideValleyPrice}
                onChange={handleChange}
                className="vehicle-form-input"
                required
                min="0"
                placeholder="Enter price per day outside valley"
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
              <label className="image-upload-label">
                <div className="upload-placeholder">
                  <Upload size={24} />
                  <p>Upload vehicle image* (Max 5MB)</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                </div>
              </label>
              {imagePreview && (
                <div className="vehicle-form-image-preview">
                  <img
                    src={imagePreview}
                    alt="Vehicle preview"
                    className="preview-image"
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
