import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Function to generate a test token
const generateTestToken = () => {
  const userId = 'test-user-id'; // Replace with actual user ID if needed
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';
  
  const token = jwt.sign(
    { id: userId },
    JWT_SECRET,
    { expiresIn: '1d' }
  );
  
  console.log('Generated Token:', token);
  console.log('\nTo use this token in API requests, add it to the Authorization header:');
  console.log('Authorization: Bearer ' + token);
};

// Generate and display the token
generateTestToken(); 