import express from 'express';
import Rating from '../model/Rating.js';
import Vehicle from '../model/Vehicle.js';

const router = express.Router();

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

export default router; 