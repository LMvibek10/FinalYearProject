import express from 'express';
import bcrypt from 'bcrypt';
import signup from '../model/signup.js';
import jwt from 'jsonwebtoken';
import { sendOTPEmail } from '../utils/emailConfig.js';
import otpGenerator from 'otp-generator';
import mongoose from 'mongoose';

// Import related models for cascading delete
import BookingRequest from '../model/BookingRequest.js';
import Rating from '../model/Rating.js';
import PurchasedItem from '../model/vehiclepaymentmodal.js';
import Payment from '../model/paymentModel.js';
import Vehicle from '../model/Vehicle.js';

const router = express.Router();

// Store OTPs temporarily (in production, use Redis or similar)
const otpStore = new Map();

// Register new user
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, email, password, otp } = req.body;

    console.log('Registration attempt:', { email, firstName });

    // Validate all required fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if email is already registered
    const existingUser = await signup.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // If OTP is provided, verify it
    if (otp) {
      const storedOTP = otpStore.get(email);
      if (!storedOTP || storedOTP !== otp) {
        return res.status(400).json({ message: 'Invalid OTP' });
      }
      // Clear the OTP after successful verification
      otpStore.delete(email);
    } else {
      try {
        // Generate and send OTP
        const generatedOTP = otpGenerator.generate(6, { 
          upperCaseAlphabets: false, 
          specialChars: false,
          lowerCaseAlphabets: false 
        });
        
        console.log('Generated OTP:', generatedOTP);
        
        // Store OTP temporarily
        otpStore.set(email, generatedOTP);
        
        // Send OTP via email
        const emailSent = await sendOTPEmail(email, generatedOTP);
        if (!emailSent) {
          console.error('Failed to send OTP email');
          return res.status(500).json({ message: 'Failed to send OTP' });
        }
        
        console.log('OTP sent successfully to:', email);
        return res.status(200).json({ 
          message: 'OTP sent successfully',
          requiresOTP: true 
        });
      } catch (error) {
        console.error('Error in OTP generation/sending:', error);
        return res.status(500).json({ 
          message: 'Error generating/sending OTP',
          error: error.message 
        });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new signup({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: email === 'rentease.admin@gmail.com' ? 'admin' : 'user'
    });

    // Save user
    await newUser.save();
    console.log('User registered successfully:', email);

    // Create JWT token
    const token = jwt.sign(
      { id: newUser._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    // Return user data without password
    const userData = {
      id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      token
    };

    res.status(201).json({ 
      message: 'Registration successful',
      user: userData
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Registration failed',
      error: error.message 
    });
  }
});

// GET route to fetch all users
router.get('/', async (req, res) => {
  try {
    const users = await signup.find();

    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }

    const usersWithoutPassword = users.map(user => {
      const { password, ...userWithoutPassword } = user.toObject();
      return userWithoutPassword;
    });

    res.status(200).json({ users: usersWithoutPassword });
  } catch (error) {
    console.error('Error during GET request:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET route to fetch user by email
router.get('/user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const user = await signup.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user data without password
    const { password, ...userWithoutPassword } = user.toObject();
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT route to update user profile
router.put('/update/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { firstName, lastName, password } = req.body;

    const user = await signup.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    
    // Update password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    // Return updated user data without password
    const { password: _, ...updatedUser } = user.toObject();
    res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Update failed', error: error.message });
  }
});

// DELETE route to delete user by ID with cascading deletes
router.delete('/:userId', async (req, res) => {
  // let session = null; // Transaction removed for debugging
  
  try {
    const { userId } = req.params;
    console.log(`[DELETE /:userId] Request for user ID: ${userId}`);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error(`[DELETE /:userId] Invalid user ID format: ${userId}`);
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const objectId = new mongoose.Types.ObjectId(userId);
    console.log(`[DELETE /:userId] Converted to ObjectId: ${objectId}`);

    const user = await signup.findById(objectId);
    if (!user) {
      console.warn(`[DELETE /:userId] User not found: ${userId}`);
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.email === 'rentease.admin@gmail.com') {
      console.warn(`[DELETE /:userId] Attempt to delete admin user: ${user.email}`);
      return res.status(403).json({ message: 'Cannot delete admin user' });
    }

    console.log(`[DELETE /:userId] Starting cascading delete for user: ${user.email} (ID: ${userId})`);

    // Transaction removed for debugging
    // session = await mongoose.startSession();
    // await session.startTransaction();
    // console.log('[DELETE /:userId] Transaction started successfully');

    let deletedBookingRequestsCount = 0;
    let deletedRatingsCount = 0;
    let recalcAffectedVehicleIds = [];
    let deletedPurchasedItemsCount = 0;
    let deletedPaymentsCount = 0;
    let updatedVehiclesStatusCount = 0;

    try {
      console.log('[DELETE /:userId] Step 1: Deleting BookingRequests...');
      const bookingRequests = await BookingRequest.find({ userId: objectId }); // .session(session) removed
      deletedBookingRequestsCount = (await BookingRequest.deleteMany({ userId: objectId })).deletedCount; // .session(session) removed
      console.log(`[DELETE /:userId] Deleted ${deletedBookingRequestsCount} booking requests`);

      console.log('[DELETE /:userId] Step 2: Deleting Ratings and preparing for vehicle rating recalc...');
      const userRatings = await Rating.find({ userId: objectId }); // .session(session) removed
      recalcAffectedVehicleIds = [...new Set(userRatings.map(rating => rating.vehicleId.toString()))];
      deletedRatingsCount = (await Rating.deleteMany({ userId: objectId })).deletedCount; // .session(session) removed
      console.log(`[DELETE /:userId] Deleted ${deletedRatingsCount} ratings. Vehicles for recalc: ${recalcAffectedVehicleIds.length}`);

      console.log('[DELETE /:userId] Step 3: Recalculating ratings for affected vehicles...');
      for (const vehicleIdStr of recalcAffectedVehicleIds) {
        try {
          const vehicleObjectId = new mongoose.Types.ObjectId(vehicleIdStr);
          const remainingRatings = await Rating.find({ vehicleId: vehicleObjectId }); // .session(session) removed
          let newAverageRating = 0;
          if (remainingRatings.length > 0) {
            const totalRating = remainingRatings.reduce((sum, r) => sum + r.rating, 0);
            newAverageRating = totalRating / remainingRatings.length;
          }
          await Vehicle.findByIdAndUpdate(vehicleObjectId, { rating: newAverageRating }); // { session } removed
          console.log(`[DELETE /:userId] Updated vehicle ${vehicleIdStr} rating to ${newAverageRating.toFixed(2)}`);
        } catch (vehicleError) {
          console.error(`[DELETE /:userId] Error updating vehicle ${vehicleIdStr} rating:`, vehicleError);
        }
      }

      console.log('[DELETE /:userId] Step 4: Finding and Deleting PurchasedItems and Payments...');
      const purchasedItems = await PurchasedItem.find({ userId: objectId }); // .session(session) removed
      const purchasedItemIds = purchasedItems.map(item => item._id);
      
      if (purchasedItemIds.length > 0) {
        deletedPaymentsCount = (await Payment.deleteMany({ productId: { $in: purchasedItemIds } })).deletedCount; // .session(session) removed
        console.log(`[DELETE /:userId] Deleted ${deletedPaymentsCount} payment records`);
      }
      deletedPurchasedItemsCount = (await PurchasedItem.deleteMany({ userId: objectId })).deletedCount; // .session(session) removed
      console.log(`[DELETE /:userId] Deleted ${deletedPurchasedItemsCount} purchased items`);

      console.log('[DELETE /:userId] Step 5: Updating vehicle statuses...');
      const bookedVehicleIdsFromBookings = bookingRequests
        .filter(req => req.status === 'approved')
        .map(req => req.vehicleId);
      const bookedVehicleIdsFromPurchases = purchasedItems.map(item => item.vehicleId);
      const allBookedVehicleIds = [...new Set([...bookedVehicleIdsFromBookings, ...bookedVehicleIdsFromPurchases].map(id => id.toString()))];

      if (allBookedVehicleIds.length > 0) {
        const vehicleObjectIdsToUpdate = allBookedVehicleIds.map(id => new mongoose.Types.ObjectId(id));
        const updateResult = await Vehicle.updateMany(
          { _id: { $in: vehicleObjectIdsToUpdate }, status: { $in: ['Booked', 'Rented'] } },
          { status: 'Available' }
          // { session } removed
        );
        updatedVehiclesStatusCount = updateResult.modifiedCount;
        console.log(`[DELETE /:userId] Updated ${updatedVehiclesStatusCount} vehicles to Available status`);
      }

      console.log('[DELETE /:userId] Step 6: Deleting user account...');
      await signup.findByIdAndDelete(objectId); // .session(session) removed
      console.log(`[DELETE /:userId] User ${user.email} deleted successfully.`);

      // console.log('[DELETE /:userId] Committing transaction...'); // Transaction removed
      // await session.commitTransaction(); // Transaction removed
      // console.log(`[DELETE /:userId] Successfully deleted user ${user.email} and all related data`); // Transaction removed

      res.status(200).json({ 
        message: 'User and all related data deleted successfully (transactions disabled for debugging)',
        deletedUser: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        },
        deletedData: {
          bookingRequests: deletedBookingRequestsCount,
          ratings: deletedRatingsCount,
          purchasedItems: deletedPurchasedItemsCount,
          payments: deletedPaymentsCount,
          vehiclesUpdated: updatedVehiclesStatusCount
        }
      });

    } catch (operationError) {
      console.error('[DELETE /:userId] Error during cascading delete operations:', operationError);
      // console.error('[DELETE /:userId] Transaction error, rolling back:', operationError); // Transaction removed
      // if (session) await session.abortTransaction(); // Transaction removed
      throw operationError; // Re-throw to be caught by outer catch block
    }

  } catch (error) {
    console.error('[DELETE /:userId] Top-level error:', error);
    console.error('[DELETE /:userId] Error stack:', error.stack);
    
    let errorMessage = 'Failed to delete user';
    if (error.name === 'ValidationError') errorMessage = 'Data validation error';
    else if (error.name === 'CastError') errorMessage = 'Invalid data format for ID';
    else if (error.code === 11000) errorMessage = 'Database conflict (duplicate key)';
    
    res.status(500).json({ 
      message: errorMessage, 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    // if (session) { // Transaction removed
    //   try {
    //     await session.endSession();
    //     console.log('[DELETE /:userId] Session ended');
    //   } catch (sessionError) {
    //     console.error('[DELETE /:userId] Error ending session:', sessionError);
    //   }
    // }
    console.log(`[DELETE /:userId] Processing complete for user ID: ${req.params.userId}`);
  }
});

// DELETE route to delete user by ID with cascading deletes (simple version for debugging)
router.delete('/simple/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(`Simple delete request received for user ID: ${userId}`);

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.log(`Invalid user ID format: ${userId}`);
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    // Convert to ObjectId for consistency
    const objectId = new mongoose.Types.ObjectId(userId);
    console.log(`Converted userId to ObjectId: ${objectId}`);

    // Check if user exists
    const user = await signup.findById(objectId);
    if (!user) {
      console.log(`User not found with ID: ${userId}`);
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deletion of admin user
    if (user.email === 'rentease.admin@gmail.com') {
      console.log(`Attempted to delete admin user: ${user.email}`);
      return res.status(403).json({ message: 'Cannot delete admin user' });
    }

    console.log(`Starting simple cascading delete for user: ${user.email} (ID: ${userId})`);

    // Initialize counters
    let deletedBookingRequestsCount = 0;
    let deletedRatingsCount = 0;
    let deletedPurchasedItemsCount = 0;
    let deletedPaymentsCount = 0;
    let updatedVehiclesCount = 0;

    try {
      // 1. Delete all booking requests by this user
      console.log('Step 1: Deleting booking requests...');
      const bookingRequests = await BookingRequest.find({ userId: objectId });
      console.log(`Found ${bookingRequests.length} booking requests`);
      
      if (bookingRequests.length > 0) {
        const deletedBookingRequests = await BookingRequest.deleteMany({ userId: objectId });
        deletedBookingRequestsCount = deletedBookingRequests.deletedCount;
        console.log(`Deleted ${deletedBookingRequestsCount} booking requests`);
      }

      // 2. Delete all ratings by this user and recalculate vehicle ratings
      console.log('Step 2: Handling user ratings...');
      const userRatings = await Rating.find({ userId: objectId });
      console.log(`Found ${userRatings.length} ratings`);
      
      if (userRatings.length > 0) {
        // Get affected vehicle IDs before deleting ratings
        const affectedVehicleIds = [...new Set(userRatings.map(rating => rating.vehicleId))];
        
        // Delete the ratings
        const deletedRatings = await Rating.deleteMany({ userId: objectId });
        deletedRatingsCount = deletedRatings.deletedCount;
        console.log(`Deleted ${deletedRatingsCount} ratings`);

        // Recalculate ratings for affected vehicles
        console.log(`Recalculating ratings for ${affectedVehicleIds.length} vehicles...`);
        for (const vehicleId of affectedVehicleIds) {
          try {
            const remainingRatings = await Rating.find({ vehicleId });
            let newAverageRating = 0;
            
            if (remainingRatings.length > 0) {
              const totalRating = remainingRatings.reduce((sum, rating) => sum + rating.rating, 0);
              newAverageRating = totalRating / remainingRatings.length;
            }
            
            await Vehicle.findByIdAndUpdate(vehicleId, { rating: newAverageRating });
            console.log(`Updated vehicle ${vehicleId} rating to ${newAverageRating}`);
          } catch (vehicleError) {
            console.error(`Error updating vehicle ${vehicleId}:`, vehicleError);
            // Continue with other vehicles
          }
        }
      }

      // 3. Handle purchased items and payments
      console.log('Step 3: Handling purchased items and payments...');
      const purchasedItems = await PurchasedItem.find({ userId: objectId });
      console.log(`Found ${purchasedItems.length} purchased items`);
      
      if (purchasedItems.length > 0) {
        const purchasedItemIds = purchasedItems.map(item => item._id);
        
        // Delete payments first
        const deletedPayments = await Payment.deleteMany({ 
          productId: { $in: purchasedItemIds } 
        });
        deletedPaymentsCount = deletedPayments.deletedCount;
        console.log(`Deleted ${deletedPaymentsCount} payment records`);

        // Delete purchased items
        const deletedPurchasedItems = await PurchasedItem.deleteMany({ userId: objectId });
        deletedPurchasedItemsCount = deletedPurchasedItems.deletedCount;
        console.log(`Deleted ${deletedPurchasedItemsCount} purchased items`);
      }

      // 4. Update vehicle statuses
      console.log('Step 4: Updating vehicle statuses...');
      const bookedVehicleIds = [...new Set([
        ...bookingRequests.filter(req => req.status === 'approved').map(req => req.vehicleId),
        ...purchasedItems.map(item => item.vehicleId)
      ])];

      if (bookedVehicleIds.length > 0) {
        const updatedVehicles = await Vehicle.updateMany(
          { 
            _id: { $in: bookedVehicleIds },
            status: { $in: ['Booked', 'Rented'] }
          },
          { status: 'Available' }
        );
        updatedVehiclesCount = updatedVehicles.modifiedCount;
        console.log(`Updated ${updatedVehiclesCount} vehicles back to Available status`);
      }

      // 5. Finally, delete the user
      console.log('Step 5: Deleting user...');
      await signup.findByIdAndDelete(objectId);
      console.log(`Successfully deleted user ${user.email} and all related data`);

      res.status(200).json({ 
        message: 'User and all related data deleted successfully (simple version)',
        deletedUser: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        },
        deletedData: {
          bookingRequests: deletedBookingRequestsCount,
          ratings: deletedRatingsCount,
          purchasedItems: deletedPurchasedItemsCount,
          payments: deletedPaymentsCount,
          vehiclesUpdated: updatedVehiclesCount
        }
      });

    } catch (operationError) {
      console.error('Error during cascading delete operations:', operationError);
      throw operationError;
    }

  } catch (error) {
    console.error('Error deleting user (simple version):', error);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({ 
      message: 'Failed to delete user (simple version)', 
      error: error.message,
      stack: error.stack
    });
  }
});

// Test endpoint to verify models are working
router.get('/test-models', async (req, res) => {
  try {
    console.log('Testing model accessibility...');
    
    const tests = [];
    
    // Test signup model
    try {
      const userCount = await signup.countDocuments();
      tests.push({ model: 'signup', status: 'success', count: userCount });
    } catch (error) {
      tests.push({ model: 'signup', status: 'error', error: error.message });
    }
    
    // Test BookingRequest model
    try {
      const bookingCount = await BookingRequest.countDocuments();
      tests.push({ model: 'BookingRequest', status: 'success', count: bookingCount });
    } catch (error) {
      tests.push({ model: 'BookingRequest', status: 'error', error: error.message });
    }
    
    // Test Rating model
    try {
      const ratingCount = await Rating.countDocuments();
      tests.push({ model: 'Rating', status: 'success', count: ratingCount });
    } catch (error) {
      tests.push({ model: 'Rating', status: 'error', error: error.message });
    }
    
    // Test PurchasedItem model
    try {
      const purchasedCount = await PurchasedItem.countDocuments();
      tests.push({ model: 'PurchasedItem', status: 'success', count: purchasedCount });
    } catch (error) {
      tests.push({ model: 'PurchasedItem', status: 'error', error: error.message });
    }
    
    // Test Payment model
    try {
      const paymentCount = await Payment.countDocuments();
      tests.push({ model: 'Payment', status: 'success', count: paymentCount });
    } catch (error) {
      tests.push({ model: 'Payment', status: 'error', error: error.message });
    }
    
    // Test Vehicle model
    try {
      const vehicleCount = await Vehicle.countDocuments();
      tests.push({ model: 'Vehicle', status: 'success', count: vehicleCount });
    } catch (error) {
      tests.push({ model: 'Vehicle', status: 'error', error: error.message });
    }
    
    res.status(200).json({
      message: 'Model test completed',
      tests,
      mongooseConnection: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
    
  } catch (error) {
    console.error('Error testing models:', error);
    res.status(500).json({
      message: 'Error testing models',
      error: error.message
    });
  }
});

export default router;
