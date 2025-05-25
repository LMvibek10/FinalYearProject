import express from 'express';
import BookingRequest from '../model/BookingRequest.js';
import Vehicle from '../model/Vehicle.js';
import signup from '../model/signup.js';
import mongoose from 'mongoose';

const router = express.Router();

// Test route to verify the booking request routes are working
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Booking request routes are working',
    timestamp: new Date().toISOString()
  });
});

// Submit a booking request
router.post('/submit', async (req, res) => {
  try {
    console.log('=== BOOKING REQUEST SUBMISSION ===');
    console.log('Request headers:', req.headers);
    console.log('Request body type:', typeof req.body);
    console.log('Request body keys:', Object.keys(req.body || {}));
    
    const bookingRequestData = req.body;
    
    // Log the incoming data for debugging
    console.log('Received booking request data:', JSON.stringify(bookingRequestData, null, 2));
    
    // Validate required fields
    if (!bookingRequestData.userId) {
      console.log('ERROR: Missing userId');
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    if (!bookingRequestData.vehicleId) {
      console.log('ERROR: Missing vehicleId');
      return res.status(400).json({
        success: false,
        message: 'Vehicle ID is required'
      });
    }
    
    if (!bookingRequestData.userDetails || !bookingRequestData.userDetails.firstName || !bookingRequestData.userDetails.lastName || !bookingRequestData.userDetails.email) {
      console.log('ERROR: Missing user details');
      return res.status(400).json({
        success: false,
        message: 'User details (firstName, lastName, email) are required'
      });
    }
    
    if (!bookingRequestData.vehicleDetails || !bookingRequestData.vehicleDetails.name) {
      console.log('ERROR: Missing vehicle details');
      return res.status(400).json({
        success: false,
        message: 'Vehicle details are required'
      });
    }
    
    if (!bookingRequestData.bookingDetails || !bookingRequestData.bookingDetails.pickupDate || !bookingRequestData.bookingDetails.returnDate) {
      console.log('ERROR: Missing booking details');
      return res.status(400).json({
        success: false,
        message: 'Booking details (pickup and return dates) are required'
      });
    }
    
    if (!bookingRequestData.bookingDetails.pickupLocation || 
        typeof bookingRequestData.bookingDetails.pickupLocation.lat !== 'number' || 
        typeof bookingRequestData.bookingDetails.pickupLocation.lng !== 'number') {
      console.log('ERROR: Invalid pickup location');
      console.log('Pickup location:', bookingRequestData.bookingDetails.pickupLocation);
      return res.status(400).json({
        success: false,
        message: 'Valid pickup location with lat/lng coordinates is required'
      });
    }
    
    if (!bookingRequestData.totalPrice || bookingRequestData.totalPrice <= 0) {
      console.log('ERROR: Invalid total price');
      return res.status(400).json({
        success: false,
        message: 'Valid total price is required'
      });
    }
    
    // Ensure phone and address have default values if empty
    if (!bookingRequestData.userDetails.phone) {
      bookingRequestData.userDetails.phone = 'Not provided';
    }
    
    if (!bookingRequestData.userDetails.address) {
      bookingRequestData.userDetails.address = 'Not provided';
    }
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(bookingRequestData.userId)) {
      console.log('ERROR: Invalid userId format:', bookingRequestData.userId);
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format'
      });
    }
    
    if (!mongoose.Types.ObjectId.isValid(bookingRequestData.vehicleId)) {
      console.log('ERROR: Invalid vehicleId format:', bookingRequestData.vehicleId);
      return res.status(400).json({
        success: false,
        message: 'Invalid vehicle ID format'
      });
    }
    
    console.log('All validations passed, creating booking request...');
    
    const newBookingRequest = new BookingRequest(bookingRequestData);
    console.log('BookingRequest instance created, saving to database...');
    
    await newBookingRequest.save();

    console.log('Booking request saved successfully:', newBookingRequest._id);

    res.status(201).json({
      success: true,
      message: 'Booking request submitted successfully',
      bookingRequestId: newBookingRequest._id,
      data: newBookingRequest
    });
  } catch (error) {
    console.error('=== ERROR SUBMITTING BOOKING REQUEST ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Check if it's a validation error
    if (error.name === 'ValidationError') {
      console.error('Validation errors:', error.errors);
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors,
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error submitting booking request',
      error: error.message
    });
  }
});

// Get all pending booking requests (for admin)
router.get('/pending', async (req, res) => {
  try {
    const pendingRequests = await BookingRequest.find({ status: 'pending' })
      .populate('userId', 'firstName lastName email')
      .populate('vehicleId', 'name category')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: pendingRequests
    });
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending requests',
      error: error.message
    });
  }
});

// Get all booking requests for admin notifications (pending, approved, declined)
router.get('/all', async (req, res) => {
  try {
    const allRequests = await BookingRequest.find({})
      .populate('userId', 'firstName lastName email')
      .populate('vehicleId', 'name category')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: allRequests
    });
  } catch (error) {
    console.error('Error fetching all requests:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching all requests',
      error: error.message
    });
  }
});

// Get booking request status (for user polling)
router.get('/status/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    const bookingRequest = await BookingRequest.findById(requestId);

    if (!bookingRequest) {
      return res.status(404).json({
        success: false,
        message: 'Booking request not found'
      });
    }

    res.json({
      success: true,
      status: bookingRequest.status,
      data: bookingRequest
    });
  } catch (error) {
    console.error('Error fetching booking status:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching booking status',
      error: error.message
    });
  }
});

// Approve booking request
router.put('/approve/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { adminId, reason } = req.body;

    const bookingRequest = await BookingRequest.findByIdAndUpdate(
      requestId,
      {
        status: 'approved',
        'adminResponse.adminId': adminId,
        'adminResponse.responseDate': new Date(),
        'adminResponse.reason': reason || 'Booking approved',
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!bookingRequest) {
      return res.status(404).json({
        success: false,
        message: 'Booking request not found'
      });
    }

    // Update vehicle status to "Booked" when booking is approved
    await Vehicle.findByIdAndUpdate(
      bookingRequest.vehicleId,
      { status: 'Booked' },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Booking request approved successfully',
      data: bookingRequest
    });
  } catch (error) {
    console.error('Error approving booking request:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving booking request',
      error: error.message
    });
  }
});

// Decline booking request
router.put('/decline/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { adminId, reason } = req.body;

    const bookingRequest = await BookingRequest.findByIdAndUpdate(
      requestId,
      {
        status: 'declined',
        'adminResponse.adminId': adminId,
        'adminResponse.responseDate': new Date(),
        'adminResponse.reason': reason || 'Booking declined',
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!bookingRequest) {
      return res.status(404).json({
        success: false,
        message: 'Booking request not found'
      });
    }

    // Update vehicle status back to "Available" when booking is declined
    await Vehicle.findByIdAndUpdate(
      bookingRequest.vehicleId,
      { status: 'Available' },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Booking request declined successfully',
      data: bookingRequest
    });
  } catch (error) {
    console.error('Error declining booking request:', error);
    res.status(500).json({
      success: false,
      message: 'Error declining booking request',
      error: error.message
    });
  }
});

// Get user's booking requests
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userRequests = await BookingRequest.find({ userId })
      .populate('vehicleId', 'name category image')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: userRequests
    });
  } catch (error) {
    console.error('Error fetching user requests:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user requests',
      error: error.message
    });
  }
});

export default router; 