import express from 'express';
import Rating from '../model/Rating.js';
import Vehicle from '../model/Vehicle.js';

const router = express.Router();

// Test route to verify rating routes are working
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Rating routes are working',
    timestamp: new Date().toISOString()
  });
});

// Submit a rating
router.post('/submit', async (req, res) => {
  try {
    const { userId, vehicleId, rating, comment } = req.body;

    // Create new rating
    const newRating = new Rating({
      userId,
      vehicleId,
      rating,
      comment
    });

    // Save rating
    await newRating.save();

    // Update vehicle's average rating
    const ratings = await Rating.find({ vehicleId });
    const averageRating = ratings.reduce((acc, curr) => acc + curr.rating, 0) / ratings.length;
    
    await Vehicle.findByIdAndUpdate(vehicleId, {
      rating: averageRating
    });

    res.status(201).json({
      success: true,
      message: 'Rating submitted successfully',
      data: newRating
    });
  } catch (error) {
    console.error('Error submitting rating:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting rating',
      error: error.message
    });
  }
});

// Get all ratings for admin (with anonymous users but vehicle details)
router.get('/all', async (req, res) => {
  try {
    console.log('=== FETCHING ALL RATINGS ===');
    console.log('Request received at /api/ratings/all');
    
    const ratings = await Rating.find()
      .populate('vehicleId', 'name category subcategory image rating')
      .sort({ createdAt: -1 });

    console.log('Ratings found:', ratings.length);
    console.log('Sample rating:', ratings[0] || 'No ratings found');

    // Transform data to make users anonymous
    const anonymousRatings = ratings.map((rating, index) => ({
      _id: rating._id,
      rating: rating.rating,
      comment: rating.comment,
      createdAt: rating.createdAt,
      vehicle: rating.vehicleId,
      user: {
        anonymous: `User ${index + 1}`, // Anonymous user identifier
        id: rating.userId // Keep ID for internal use but don't expose user details
      }
    }));

    console.log('Transformed ratings:', anonymousRatings.length);

    res.status(200).json({
      success: true,
      data: anonymousRatings,
      total: anonymousRatings.length
    });
  } catch (error) {
    console.error('=== ERROR FETCHING RATINGS ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Error fetching ratings',
      error: error.message
    });
  }
});

export default router; 