import React, { useState } from "react";
import "./LocationSelector.css";

const LocationSelector = ({ label, value, onChange, placeholder }) => {
  const [selectedLocation, setSelectedLocation] = useState(value);

  const handleLocationChange = (e) => {
    const location = e.target.value;
    setSelectedLocation(location);
    onChange(location);
  };

  return (
    <div className="location-selector">
      <div className="form-group">
        <label className="form-label">{label}</label>
        <div className="input-container">
          <input
            type="text"
            value={selectedLocation}
            onChange={handleLocationChange}
            className="form-input"
            placeholder={placeholder}
          />
        </div>
      </div>
    </div>
  );
};

export default LocationSelector;