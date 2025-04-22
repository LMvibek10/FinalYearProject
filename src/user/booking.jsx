import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import UserNavbar from "../component/UserNavbar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./booking.css";
import LocationSelector from "../component/LocationSelector";

const Booking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const vehicle = location.state?.vehicle;

  const [pickupDate, setPickupDate] = useState(new Date());
  const [returnDate, setReturnDate] = useState(new Date());
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [driverOption, setDriverOption] = useState("");

  const driverOptions = [
    { value: "with-driver", label: "With Driver" },
    { value: "without-driver", label: "Without Driver" }
  ];

  const calculateTotalDays = () => {
    const diffTime = Math.abs(returnDate - pickupDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays || 1;
  };

  const calculateTotalPrice = () => {
    const basePrice = vehicle.pricePerDay * calculateTotalDays();
    const driverCost =
      driverOption === "with-driver" ? 50 * calculateTotalDays() : 0;
    return basePrice + driverCost;
  };

  const handleBooking = () => {
    console.log("Booking submitted:", {
      vehicle,
      pickupDate,
      returnDate,
      pickupLocation,
      dropoffLocation,
      driverOption,
      totalPrice: calculateTotalPrice()
    });
  };

  return (
    <div className="booking-container">
      <UserNavbar />
      <div className="booking-content">
        <div className="booking-grid">
          {/* Vehicle Summary Section */}
          <div className="vehicle-summary">
            <h2>Vehicle Summary</h2>
            <div className="vehicle-image-container">
              <img
                src={vehicle?.image || "/placeholder.svg"}
                alt={vehicle?.name}
                className="vehicle-image"
              />
              <div className="availability-badge">Available</div>
              <div className="rating-badge">
                <span>⭐</span>
                <span>{vehicle?.rating?.toFixed(1) || "4.5"}</span>
              </div>
            </div>

            <div className="vehicle-details">
              <div className="vehicle-header">
                <h3 className="vehicle-name">{vehicle?.name}</h3>
                <span className="vehicle-type">{vehicle?.subcategory}</span>
              </div>

              <div className="vehicle-specs">
                <div className="spec-item">
                  <i className="fas fa-users"></i>
                  <span>{vehicle?.seatingCapacity} Seats</span>
                </div>
                <div className="spec-item">
                  <i className="fas fa-gas-pump"></i>
                  <span>{vehicle?.fuelType}</span>
                </div>
                <div className="spec-item">
                  <i className="fas fa-calendar"></i>
                  <span>{vehicle?.makeYear}</span>
                </div>
              </div>

              <div className="price-section">
                <div className="price-container">
                  <span className="price">NPR {vehicle?.pricePerDay}</span>
                  <span className="price-period">/day</span>
                </div>
                <div className="total-price">
                  <div className="total-days">
                    Total for {calculateTotalDays()} days
                  </div>
                  <div className="total-amount">
                    NPR {calculateTotalPrice()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form Section */}
          <div className="booking-form">
            <h2>Booking Details</h2>
            <form>
              <div className="form-group">
                <label className="form-label">Pickup Date & Time</label>
                <DatePicker
                  selected={pickupDate}
                  onChange={(date) => setPickupDate(date)}
                  showTimeSelect
                  dateFormat="MMMM d, yyyy h:mm aa"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Return Date & Time</label>
                <DatePicker
                  selected={returnDate}
                  onChange={(date) => setReturnDate(date)}
                  showTimeSelect
                  dateFormat="MMMM d, yyyy h:mm aa"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <LocationSelector
                  label="Pickup Location"
                  value={pickupLocation}
                  onChange={setPickupLocation}
                  placeholder="Enter pickup location"
                />
              </div>

              <div className="form-group">
                <LocationSelector
                  label="Drop-off Location"
                  value={dropoffLocation}
                  onChange={setDropoffLocation}
                  placeholder="Enter drop-off location"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Driver Option</label>
                <select
                  value={driverOption}
                  onChange={(e) => setDriverOption(e.target.value)}
                  className="form-select"
                >
                  <option value="">Select driver option</option>
                  {driverOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleBooking}
                className="submit-button"
              >
                Confirm Booking
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
