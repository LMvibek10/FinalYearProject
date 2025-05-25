import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Log the configuration status
console.log('Loading environment variables from:', path.resolve(__dirname, '../../.env'));
console.log('Environment variables loaded:', {
  CLOUD_NAME: process.env.CLOUD_NAME,
  CLOUD_API_KEY: process.env.CLOUD_API_KEY ? 'Set' : 'Not Set',
  CLOUD_API_SECRET: process.env.CLOUD_API_SECRET ? 'Set' : 'Not Set'
});

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
  secure: true
});

// Test the configuration
cloudinary.api.ping()
  .then(() => {
    console.log('✓ Cloudinary configuration successful');
  })
  .catch(error => {
    console.error('✗ Cloudinary configuration error:', error.message);
    if (error.message.includes('api_key')) {
      console.error('Please check your Cloudinary API key in the .env file');
    }
    throw error;
  });

export default cloudinary;