import express from 'express';
import bcrypt from 'bcrypt';
import signup from '../model/signup.js';
import jwt from 'jsonwebtoken';
import { sendOTPEmail } from '../utils/emailConfig.js';
import otpGenerator from 'otp-generator';
import mongoose from 'mongoose';

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

// DELETE route to delete user by ID
router.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    // Check if user exists
    const user = await signup.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deletion of admin user
    if (user.email === 'rentease.admin@gmail.com') {
      return res.status(403).json({ message: 'Cannot delete admin user' });
    }

    // Delete the user
    await signup.findByIdAndDelete(userId);

    res.status(200).json({ 
      message: 'User deleted successfully',
      deletedUser: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ 
      message: 'Failed to delete user', 
      error: error.message 
    });
  }
});

export default router;
