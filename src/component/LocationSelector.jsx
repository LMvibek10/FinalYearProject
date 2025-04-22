import React, { useState } from "react";
import "./LocationSelector.css";

const LocationSelector = ({ label, value, onChange, placeholder }) => {
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(value);

  const handleMapClick = () => {
    setIsMapOpen(true);
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    onChange(location);
    setIsMapOpen(false);
  };

  return (
    <div className="location-selector">
      <div className="form-group">
        <label className="form-label">{label}</label>
        <div className="input-container">
          <input
            type="text"
            value={selectedLocation}
            onClick={handleMapClick}
            className="form-input"
            placeholder={placeholder}
            readOnly
          />
          <div className="dropdown-arrow" onClick={handleMapClick}>
            📍
          </div>
        </div>
      </div>

      {isMapOpen && (
        <div className="map-modal">
          <div className="map-modal-content">
            <div className="map-modal-header">
              <h3>Select Location</h3>
              <button className="close-button" onClick={() => setIsMapOpen(false)}>
                ×
              </button>
            </div>
            <div className="map-container">
              {/* Map will be rendered here */}
              <iframe
                src={`https://maps.google.com/maps?q=27.7089603,85.3271608&z=15&output=embed&key=AlzaSyh5o4uFv3NwgXWVD7l4UdsTjszmaMolkue`}
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
              ></iframe>
            </div>
            <div className="map-actions">
              <div className="selected-location">
                {selectedLocation && (
                  <p>Selected: {selectedLocation}</p>
                )}
              </div>
              <button 
                className="confirm-button"
                onClick={() => handleLocationSelect("Kathmandu, Nepal")}
              >
                Confirm Location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;