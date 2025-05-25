import express from 'express';
import bcrypt from 'bcrypt';
import signup from '../model/signup.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get user profile
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await signup.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by ID (for rating system)
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await signup.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const user = await signup.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;

    // Update password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    // Return updated user without password
    const updatedUser = await signup.findById(user._id).select('-password');
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 