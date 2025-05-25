import express from 'express';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../Config/config.js';
import Vehicle from '../model/Vehicle.js';

const router = express.Router();

// Configure Cloudinary storage with better error handling
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'VehicleImages',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
    resource_type: 'image'
  }
});

// Configure multer with better error handling
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
}).single('image');

// Middleware to handle upload errors
const handleUpload = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          message: 'File size too large. Maximum size is 5MB',
          error: err.message
        });
      }
      return res.status(400).json({
        message: 'File upload error',
        error: err.message
      });
    } else if (err) {
      console.error('Upload error:', err);
      return res.status(500).json({
        message: 'Image upload failed',
        error: err.message
      });
    }
    next();
  });
};

// Helper function to validate vehicle data
const validateVehicleData = (data) => {
  const errors = [];
  
  // Check required fields
  const requiredFields = ['name', 'category', 'subcategory', 'fuelType', 'seatingCapacity', 'makeYear', 'insideValleyPrice', 'outsideValleyPrice'];
  requiredFields.forEach(field => {
    if (!data[field]) {
      errors.push(`${field} is required`);
    }
  });

  // Validate fuelType
  const validFuelTypes = ['Petrol', 'Diesel', 'Electric'];
  if (data.fuelType && !validFuelTypes.includes(data.fuelType)) {
    errors.push(`fuelType must be one of: ${validFuelTypes.join(', ')}`);
  }

  // Validate numeric fields
  const numericFields = ['seatingCapacity', 'makeYear', 'insideValleyPrice', 'outsideValleyPrice'];
  numericFields.forEach(field => {
    if (data[field] && isNaN(Number(data[field]))) {
      errors.push(`${field} must be a number`);
    }
  });

  return errors;
};

// Route to add a new vehicle
router.post('/', handleUpload, async (req, res) => {
  try {
    console.log('Creating new vehicle with data:', req.body);
    console.log('Uploaded file:', req.file);

    if (!req.file) {
      return res.status(400).json({ message: 'Vehicle image is required' });
    }

    const vehicleData = {
      name: req.body.name,
      category: req.body.category,
      subcategory: req.body.subcategory,
      fuelType: req.body.fuelType,
      seatingCapacity: Number(req.body.seatingCapacity),
      makeYear: Number(req.body.makeYear),
      insideValleyPrice: Number(req.body.insideValleyPrice),
      outsideValleyPrice: Number(req.body.outsideValleyPrice),
      status: req.body.status || 'Available',
      image: req.file.path
    };

    // Validate the data
    const validationErrors = validateVehicleData(vehicleData);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationErrors 
      });
    }

    const newVehicle = new Vehicle(vehicleData);
    await newVehicle.save();

    console.log('Vehicle created successfully:', newVehicle);
    res.status(201).json({ 
      message: 'Vehicle added successfully', 
      vehicle: newVehicle 
    });
  } catch (error) {
    console.error('Error creating vehicle:', error);
    res.status(500).json({ 
      message: 'Error creating vehicle', 
      error: error.message 
    });
  }
});

// Update vehicle
router.put('/:id', handleUpload, async (req, res) => {
  try {
    console.log('=== Vehicle Update Request ===');
    console.log('Vehicle ID:', req.params.id);
    console.log('Request Body:', req.body);
    console.log('Uploaded File:', req.file);

    const { id } = req.params;
    const existingVehicle = await Vehicle.findById(id);

    if (!existingVehicle) {
      console.log('Vehicle not found:', id);
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Create base update data
    const updateData = {
      name: req.body.name,
      category: req.body.category,
      subcategory: req.body.subcategory,
      fuelType: req.body.fuelType,
      seatingCapacity: Number(req.body.seatingCapacity),
      makeYear: Number(req.body.makeYear),
      insideValleyPrice: Number(req.body.insideValleyPrice),
      outsideValleyPrice: Number(req.body.outsideValleyPrice),
      status: req.body.status || 'Available'
    };

    // Handle image update
    if (req.file) {
      try {
        console.log('Processing new image upload...');
        updateData.image = req.file.path;
        console.log('New image path:', req.file.path);
      } catch (imageError) {
        console.error('Image processing error:', imageError);
        return res.status(500).json({
          message: 'Error processing image',
          error: imageError.message,
          details: imageError.stack
        });
      }
    } else {
      console.log('No new image uploaded, keeping existing image');
      updateData.image = existingVehicle.image;
    }

    // Validate the data
    const validationErrors = validateVehicleData(updateData);
    if (validationErrors.length > 0) {
      console.log('Validation errors:', validationErrors);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationErrors 
      });
    }

    console.log('Attempting to update vehicle with data:', updateData);

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      id,
      { $set: updateData },
      { 
        new: true, 
        runValidators: true,
        context: 'query'
      }
    );

    if (!updatedVehicle) {
      console.log('Vehicle not found after update attempt');
      return res.status(404).json({ message: 'Vehicle not found after update' });
    }

    console.log('Vehicle updated successfully:', updatedVehicle);
    res.json({ 
      message: 'Vehicle updated successfully', 
      vehicle: updatedVehicle 
    });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      message: 'Error updating vehicle',
      error: error.message,
      details: error.stack
    });
  }
});

// Fetch all vehicles
router.get('/all', async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single vehicle by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.status(200).json(vehicle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search vehicles by name or category
router.get('/', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'Please provide a search query' });
    }

    const vehicles = await Vehicle.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
      ],
    });

    if (vehicles.length === 0) {
      return res.status(404).json({ message: 'No vehicles found' });
    }

    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete vehicle by id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedVehicle = await Vehicle.findByIdAndDelete(id);

    if (!deletedVehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.status(200).json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

export default router;
