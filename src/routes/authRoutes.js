import express from 'express';
import mongoose from 'mongoose';
import User from '../model/User.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Debug MongoDB connection
const checkMongoDBConnection = () => {
  const state = mongoose.connection.readyState;
  console.log('MongoDB Connection State:', state);
  return state === 1; // 1 = connected
};

// Handle CORS preflight requests
router.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(204).end();
});

export default router; 