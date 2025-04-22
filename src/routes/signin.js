import express from 'express';
import bcrypt from 'bcrypt';
import signup from '../model/signup.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Signin attempt:', { email });

    // Validate required fields
    if (!email || !password) {
      console.log('Missing fields:', { email: !!email, password: !!password });
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = await signup.findOne({ email });
    console.log('User found:', !!user);
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check password
    console.log('Comparing passwords...');
    console.log('Input password:', password);
    console.log('Stored hash:', user.password);
    
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    // Return user data without password
    const userData = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      token
    };

    console.log('Signin successful for user:', user.email);
    res.json(userData);
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

export default router;
