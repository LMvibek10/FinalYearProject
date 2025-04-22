import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import mongoose from 'mongoose';
import User from '../model/User.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Initialize Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Debug MongoDB connection
const checkMongoDBConnection = () => {
  const state = mongoose.connection.readyState;
  console.log('MongoDB Connection State:', state);
  return state === 1; // 1 = connected
};

// Handle CORS preflight requests
router.options('/google', (req, res) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(204).end();
});

router.post('/google', async (req, res) => {
  try {
    console.log('Starting Google authentication process...');
    
    // Check MongoDB connection
    if (!checkMongoDBConnection()) {
      console.error('MongoDB is not connected');
      throw new Error('MongoDB is not connected');
    }

    // Validate request body
    if (!req.body || !req.body.credential) {
      console.error('Invalid request: No credential provided');
      return res.status(400).json({ 
        message: 'No credential provided',
        error: 'Missing credential in request body'
      });
    }

    const { credential } = req.body;
    console.log('Received credential from client');

    // Verify Google token
    console.log('Verifying Google token...');
    console.log('Using client ID:', process.env.GOOGLE_CLIENT_ID);
    
    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      
      const payload = ticket.getPayload();
      console.log('Google token verified successfully');
      console.log('Token payload:', {
        email: payload.email,
        name: payload.name,
        picture: payload.picture
      });
      
      const { email, given_name, family_name, picture } = payload;

      // Check if user already exists
      console.log('Checking for existing user with email:', email);
      let user = await User.findOne({ email });
      
      if (!user) {
        console.log('Creating new user...');
        user = new User({
          firstName: given_name,
          lastName: family_name,
          email,
          profilePicture: picture,
          isGoogleAuth: true,
        });
        
        try {
          await user.save();
          console.log('New user created successfully');
        } catch (saveError) {
          console.error('Error saving new user:', saveError);
          throw new Error('Failed to create new user: ' + saveError.message);
        }
      } else {
        console.log('Existing user found');
      }

      // Generate JWT token
      console.log('Generating JWT token...');
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not configured');
      }

      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Set CORS headers
      res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
      res.header('Access-Control-Allow-Credentials', 'true');

      console.log('Sending successful response...');
      return res.status(200).json({
        token,
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          profilePicture: user.profilePicture,
        }
      });

    } catch (googleError) {
      console.error('Google token verification failed:', googleError);
      return res.status(401).json({
        message: 'Google authentication failed',
        error: googleError.message
      });
    }

  } catch (error) {
    console.error('General error in Google auth route:', error);
    return res.status(500).json({ 
      message: 'Authentication failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

export default router; 