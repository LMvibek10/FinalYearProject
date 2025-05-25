import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import UserNavbar from "../component/UserNavbar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./booking.css";
import MapPicker from "../component/MapPicker";
import axios from 'axios';

const Booking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const vehicle = location.state?.vehicle;
  const [showModal, setShowModal] = useState(false);
  const [declineMessage, setDeclineMessage] = useState('');
  const [proceedToPayment, setProceedToPayment] = useState(false);
  const [approvedBooking, setApprovedBooking] = useState(null);

  const [pickupDate, setPickupDate] = useState(new Date());
  const [returnDate, setReturnDate] = useState(new Date(new Date().setDate(new Date().getDate() + 1)));
  const [showPickupTime, setShowPickupTime] = useState(false);
  const [showReturnTime, setShowReturnTime] = useState(false);
  const [pickupLocation, setPickupLocation] = useState(null);
  const [driverOption, setDriverOption] = useState("");
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalDays, setTotalDays] = useState(1);
  const [isInsideValley, setIsInsideValley] = useState(true);

  // Handle state from navigation (decline message or approved booking)
  useEffect(() => {
    if (location.state?.declineMessage) {
      setDeclineMessage(location.state.declineMessage);
    }
    if (location.state?.proceedToPayment && location.state?.approvedBooking) {
      setProceedToPayment(true);
      setApprovedBooking(location.state.approvedBooking);
      // Auto-proceed to payment after a short delay
      setTimeout(() => {
        handlePaymentProcess(location.state.approvedBooking);
      }, 1000);
    }
  }, [location.state]);

  const driverOptions = [
    { value: "with-driver", label: "With Driver" },
    { value: "without-driver", label: "Without Driver" }
  ];

  // Calculate total days and price whenever dates or location changes
  useEffect(() => {
    const calculateDaysAndPrice = () => {
      // Create new Date objects and set them to midnight to ignore time
      const startDate = new Date(pickupDate.getFullYear(), pickupDate.getMonth(), pickupDate.getDate());
      const endDate = new Date(returnDate.getFullYear(), returnDate.getMonth(), returnDate.getDate());
      
      // Calculate the difference in days
      const timeDiff = endDate.getTime() - startDate.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      
      // Add 1 to include both pickup and return days
      const numberOfDays = Math.max(1, daysDiff + 1);
      
      // Calculate total price based on location and pricePerDay
      const basePrice = isInsideValley ? vehicle?.insideValleyPrice : vehicle?.outsideValleyPrice;
      const calculatedPrice = (basePrice || 0) * numberOfDays;
      
      setTotalDays(numberOfDays);
      setTotalPrice(calculatedPrice);
    };

    calculateDaysAndPrice();
  }, [pickupDate, returnDate, vehicle?.insideValleyPrice, vehicle?.outsideValleyPrice, isInsideValley]);

  const calculateTotalPrice = () => {
    const basePrice = isInsideValley ? vehicle.insideValleyPrice : vehicle.outsideValleyPrice;
    const totalBasePrice = basePrice * totalDays;
    const driverCost = driverOption === "with-driver" ? 50 * totalDays : 0;
    return totalBasePrice + driverCost;
  };

  const handleContinue = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  const handleConfirmBooking = async () => {
    try {
      // Get user details from localStorage
      const userDetails = JSON.parse(localStorage.getItem('user'));
      if (!userDetails) {
        alert('Please login to continue with booking');
        navigate('/login');
        return;
      }

      if (!pickupLocation) {
        alert('Please select a pickup location');
        return;
      }

      if (!driverOption) {
        alert('Please select a driver option');
        return;
      }

      // Validate pickup location has required coordinates
      if (!pickupLocation.lat || !pickupLocation.lng) {
        alert('Please select a valid pickup location with coordinates');
        return;
      }

      // Validate vehicle data
      if (!vehicle || !vehicle._id) {
        alert('Vehicle information is missing. Please try again.');
        return;
      }

      // Calculate total price including driver cost
      const totalPrice = calculateTotalPrice();

      // Ensure we have valid coordinates
      const validLat = Number(pickupLocation.lat);
      const validLng = Number(pickupLocation.lng);
      
      if (isNaN(validLat) || isNaN(validLng)) {
        alert('Invalid pickup location coordinates. Please select a location again.');
        return;
      }

      // Prepare booking request data
      const bookingRequestData = {
        userId: userDetails.id || userDetails._id,
        vehicleId: vehicle._id,
        userDetails: {
          firstName: userDetails.firstName || 'Unknown',
          lastName: userDetails.lastName || 'User',
          email: userDetails.email || 'no-email@example.com',
          phone: userDetails.phone || 'Not provided',
          address: userDetails.address || 'Not provided'
        },
        vehicleDetails: {
          name: vehicle.name || 'Unknown Vehicle',
          category: vehicle.category || 'Unknown',
          subcategory: vehicle.subcategory || 'Unknown',
          fuelType: vehicle.fuelType || 'Unknown',
          seatingCapacity: vehicle.seatingCapacity || 4,
          makeYear: vehicle.makeYear || new Date().getFullYear(),
          insideValleyPrice: vehicle.insideValleyPrice || 0,
          outsideValleyPrice: vehicle.outsideValleyPrice || 0,
          image: vehicle.image || ''
        },
        bookingDetails: {
          pickupDate: pickupDate,
          returnDate: returnDate,
          pickupLocation: {
            lat: validLat,
            lng: validLng,
            address: pickupLocation.address || 'Selected location'
          },
          isInsideValley: isInsideValley,
          duration: totalDays,
          driverOption: driverOption,
          totalDays: totalDays
        },
        totalPrice: totalPrice
      };

      // Log the data being sent for debugging
      console.log('Sending booking request data:', bookingRequestData);

      // Close the modal first
      setShowModal(false);

      // Submit booking request
      const response = await axios.post(`http://localhost:5000/api/booking-requests/submit`, bookingRequestData);

      if (response.data.success) {
        // Navigate to waiting page with booking request ID
        navigate('/booking-waiting', {
          state: {
            bookingRequestId: response.data.bookingRequestId,
            bookingDetails: {
              vehicle: vehicle,
              totalDays: totalDays,
              totalPrice: totalPrice,
              isInsideValley: isInsideValley
            }
          }
        });
      } else {
        alert('Failed to submit booking request. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting booking request:', error);
      console.error('Error response:', error.response?.data);
      
      // Show more specific error message
      if (error.response?.data?.message) {
        alert(`Error: ${error.response.data.message}`);
      } else if (error.response?.data?.errors) {
        alert(`Validation Error: ${error.response.data.errors.join(', ')}`);
      } else {
        alert('An error occurred while processing your booking request. Please try again.');
      }
    }
  };

  const handlePaymentProcess = async (bookingData) => {
    try {
      const userDetails = JSON.parse(localStorage.getItem('user'));
      
      // Prepare payment data from approved booking
      const paymentData = {
        vehicleId: bookingData.vehicleId,
        totalPrice: bookingData.totalPrice,
        website_url: window.location.origin,
        vehicleDetails: bookingData.vehicleDetails,
        firstName: bookingData.userDetails.firstName,
        lastName: bookingData.userDetails.lastName,
        email: bookingData.userDetails.email,
        phone: bookingData.userDetails.phone,
        address: bookingData.userDetails.address,
        userId: bookingData.userId,
        bookingDetails: bookingData.bookingDetails
      };

      // Initialize Khalti payment
      const response = await axios.post(`http://localhost:5000/khalti/initialize-khalti`, paymentData, {
        headers: {
          'Authorization': `Bearer ${userDetails.token}`
        }
      });

      if (response.data.success) {
        // Store booking details in localStorage for payment redirect
        localStorage.setItem('bookingDetails', JSON.stringify(paymentData));
        
        // Redirect to Khalti payment URL
        window.location.href = response.data.payment.payment_url;
      } else {
        alert('Failed to initialize payment. Please try again.');
      }
    } catch (error) {
      console.error('Error initializing payment:', error);
      alert('An error occurred while processing payment. Please try again.');
    }
  };

  // Generate time slots from 6 AM to 10 PM with 30-minute intervals
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour <= 22; hour++) {
      for (let minute of [0, 30]) {
        const time = new Date();
        time.setHours(hour, minute, 0);
        slots.push(time);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Handle date changes
  const handleDateChange = (date, isPickup) => {
    const newDate = new Date(date);
    
    if (isPickup) {
      // Keep the existing time when changing the date
      newDate.setHours(pickupDate.getHours(), pickupDate.getMinutes());
      setPickupDate(newDate);
      
      // If return date is before pickup date, update return date to next day
      const returnDateMidnight = new Date(returnDate.getFullYear(), returnDate.getMonth(), returnDate.getDate());
      const newDateMidnight = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
      
      if (returnDateMidnight <= newDateMidnight) {
        const nextDay = new Date(newDate);
        nextDay.setDate(nextDay.getDate() + 1);
        nextDay.setHours(returnDate.getHours(), returnDate.getMinutes());
        setReturnDate(nextDay);
      }
    } else {
      // Keep the existing time when changing the date
      newDate.setHours(returnDate.getHours(), returnDate.getMinutes());
      
      // Only update if the new return date is after pickup date
      const pickupDateMidnight = new Date(pickupDate.getFullYear(), pickupDate.getMonth(), pickupDate.getDate());
      const newDateMidnight = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
      
      if (newDateMidnight >= pickupDateMidnight) {
        setReturnDate(newDate);
      }
    }
  };

  const handleTimeSelect = (time, isPickup) => {
    const newDate = new Date(isPickup ? pickupDate : returnDate);
    newDate.setHours(time.getHours(), time.getMinutes());
    
    if (isPickup) {
      setPickupDate(newDate);
      setShowPickupTime(false);
    } else {
      setReturnDate(newDate);
      setShowReturnTime(false);
    }
  };

  return (
    <div className="booking-container">
      <UserNavbar />
      
      {/* Decline Message Display */}
      {declineMessage && (
        <div className="decline-message-banner">
          <div className="decline-message-content">
            <div className="decline-icon">❌</div>
            <div className="decline-text">
              <h3>Booking Request Declined</h3>
              <p>{declineMessage}</p>
            </div>
            <button 
              className="dismiss-btn"
              onClick={() => setDeclineMessage('')}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Processing Payment Message */}
      {proceedToPayment && (
        <div className="processing-payment-banner">
          <div className="processing-content">
            <div className="processing-icon">✅</div>
            <div className="processing-text">
              <h3>Booking Approved!</h3>
              <p>Redirecting you to payment process...</p>
            </div>
          </div>
        </div>
      )}

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

              <div className="summary-price-details">
                <div className="price-option">
                  <div className="price-header">Inside Valley</div>
                  <div className="price-amount">
                    <span className="currency">NPR</span>
                    <span className="amount">{vehicle?.insideValleyPrice?.toLocaleString()}</span>
                    <span className="duration">/day</span>
                  </div>
                </div>
                <div className="price-option">
                  <div className="price-header">Outside Valley</div>
                  <div className="price-amount">
                    <span className="currency">NPR</span>
                    <span className="amount">{vehicle?.outsideValleyPrice?.toLocaleString()}</span>
                    <span className="duration">/day</span>
                  </div>
                </div>
              </div>

              
{/* 
              <div className="price-breakdown">
                <h3>Price Breakdown</h3>
                <div className="breakdown-item">
                  <span>Base Price (Inside Valley):</span>
                  <span>NPR {vehicle?.insideValleyPrice?.toLocaleString()}/day</span>
                </div>
                <div className="breakdown-item">
                  <span>Base Price (Outside Valley):</span>
                  <span>NPR {vehicle?.outsideValleyPrice?.toLocaleString()}/day</span>
                </div>
                <div className="breakdown-item">
                  <span>Selected Location:</span>
                  <span>{isInsideValley ? 'Inside Valley' : 'Outside Valley'}</span>
                </div>
                <div className="breakdown-item">
                  <span>Number of Days:</span>
                  <span>{totalDays}</span>
                </div>
                <div className="breakdown-item">
                  <span>Driver Option:</span>
                  <span>{driverOption === "with-driver" ? "With Driver (+NPR 50/day)" : "Without Driver"}</span>
                </div>
                <div className="breakdown-item total">
                  <span>Total Amount:</span>
                  <span>NPR {totalPrice.toLocaleString()}</span>
                </div>
              </div> */}
            </div>
          </div>

          {/* Booking Form Section */}
          <div className="booking-form">
            <h2>Booking Details</h2>
            <form onSubmit={handleContinue}>
              <div className="form-group">
                <label className="form-label">Rental Location</label>
                <select
                  value={isInsideValley ? "inside" : "outside"}
                  onChange={(e) => setIsInsideValley(e.target.value === "inside")}
                  className="form-select"
                >
                  <option value="inside">Inside Kathmandu Valley</option>
                  <option value="outside">Outside Kathmandu Valley</option>
                </select>
              </div>

              <div className="date-time-picker-container">
                <label className="date-time-label">Pickup Date & Time</label>
                <div className="date-time-picker-wrapper">
                  <div className="date-picker-container">
                    <DatePicker
                      selected={pickupDate}
                      onChange={(date) => handleDateChange(date, true)}
                      dateFormat="MMMM d, yyyy"
                      minDate={new Date()}
                      className="date-time-input"
                    />
                  </div>
                  <div className="time-picker-container">
                    <div className="custom-time-picker" onClick={() => setShowPickupTime(!showPickupTime)}>
                      {pickupDate.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </div>
                    {showPickupTime && (
                      <div className="time-list">
                        {generateTimeSlots().map((time, index) => (
                          <div
                            key={index}
                            className="time-list-item"
                            onClick={() => {
                              const newDate = new Date(pickupDate);
                              newDate.setHours(time.getHours(), time.getMinutes());
                              setPickupDate(newDate);
                              setShowPickupTime(false);
                            }}
                          >
                            {time.toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="date-time-picker-container">
                <label className="date-time-label">Return Date & Time</label>
                <div className="date-time-picker-wrapper">
                  <div className="date-picker-container">
                    <DatePicker
                      selected={returnDate}
                      onChange={(date) => handleDateChange(date, false)}
                      dateFormat="MMMM d, yyyy"
                      minDate={pickupDate}
                      className="date-time-input"
                    />
                  </div>
                  <div className="time-picker-container">
                    <div className="custom-time-picker" onClick={() => setShowReturnTime(!showReturnTime)}>
                      {returnDate.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </div>
                    {showReturnTime && (
                      <div className="time-list">
                        {generateTimeSlots().map((time, index) => (
                          <div
                            key={index}
                            className="time-list-item"
                            onClick={() => {
                              const newDate = new Date(returnDate);
                              newDate.setHours(time.getHours(), time.getMinutes());
                              setReturnDate(newDate);
                              setShowReturnTime(false);
                            }}
                          >
                            {time.toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Select Location</label>
                <MapPicker
                  onLocationSelect={(location) => setPickupLocation(location)}
                  initialLocation={pickupLocation}
                  showUserLocation={true}
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

              <button type="submit" className="submit-button">
                Continue
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Price Breakdown Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Booking Summary</h2>
              <button className="close-button" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="price-breakdown">
              <h3>Price Breakdown</h3>
              <div className="breakdown-item">
                <span>Base Price ({isInsideValley ? 'Inside' : 'Outside'} Valley):</span>
                <span>NPR {(isInsideValley ? vehicle?.insideValleyPrice : vehicle?.outsideValleyPrice)?.toLocaleString()}/day</span>
              </div>
              <div className="breakdown-item">
                <span>Selected Location:</span>
                <span>{isInsideValley ? 'Inside Valley' : 'Outside Valley'}</span>
              </div>
              <div className="breakdown-item">
                <span>Number of Days:</span>
                <span>{totalDays}</span>
              </div>
              <div className="breakdown-item">
                <span>Driver Option:</span>
                <span>{driverOption === "with-driver" ? "With Driver (+NPR 50/day)" : "Without Driver"}</span>
              </div>
              <div className="breakdown-item total">
                <span>Total Amount:</span>
                <span>NPR {totalPrice.toLocaleString()}</span>
              </div>
            </div>
            <div className="modal-footer">
           
              <button className="confirm-button" onClick={handleConfirmBooking}>Confirm Booking</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking;
