import express from 'express';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/config.js'; // Import Cloudinary config
import Vehicle from '../model/Vehicle.js'; // Assuming you have a Vehicle model

const router = express.Router();

// Verify Cloudinary configuration
const verifyCloudinaryConfig = () => {
  const { cloud_name, api_key, api_secret } = cloudinary.config();
  if (!cloud_name || !api_key || !api_secret) {
    throw new Error('Cloudinary configuration is incomplete. Please check your environment variables.');
  }
};

try {
  verifyCloudinaryConfig();
} catch (error) {
  console.error('Cloudinary Configuration Error:', error.message);
}

// Configure Cloudinary storage with error handling
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'VehicleImages',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
    resource_type: 'image'
  }
});

// Configure multer with error handling
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
}).single('image');

// Middleware to handle upload errors
const handleUpload = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Multer error (e.g., file too large)
      return res.status(400).json({
        message: 'File upload error',
        error: err.message
      });
    } else if (err) {
      // Other errors (including Cloudinary)
      return res.status(500).json({
        message: 'Image upload failed',
        error: err.message
      });
    }
    next();
  });
};

// Route to add a new vehicle
router.post('/', handleUpload, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    const newVehicle = new Vehicle({
      name: req.body.name,
      category: req.body.category,
      subcategory: req.body.subcategory,
      fuelType: req.body.fuelType,
      seatingCapacity: req.body.seatingCapacity,
      makeYear: req.body.makeYear,
      insideValleyPrice: req.body.insideValleyPrice,
      outsideValleyPrice: req.body.outsideValleyPrice,
      status: req.body.status || 'Available',
      rating: req.body.rating || 0,
      image: req.file.path,
    });

    await newVehicle.save();
    res.status(201).json({ message: 'Vehicle added successfully', vehicle: newVehicle });
  } catch (error) {
    console.error('Error adding vehicle:', error);
    res.status(500).json({ 
      message: 'Server Error', 
      error: error.message 
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

// Fetch a vehicle by its name
router.get("/vehicles", async (req, res) => { 
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({ message: "Vehicle name is required." });
    }

    const vehicleData  = await Vehicle.findOne({ name: { $regex: new RegExp(name, 'i') } });

    if (!vehicleData) {
      return res.status(404).json({ message: `No vehicle found with the name "${name}".` });
    }

    res.json(vehicleData);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
});

// Update vehicle price based on location
router.put('/:id/update-price', async (req, res) => {
  try {
    const { id } = req.params;
    const { isInsideValley } = req.body;

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Update total price based on location
    const newTotalPrice = isInsideValley ? vehicle.insideValleyPrice : vehicle.outsideValleyPrice;
    
    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      id,
      { totalPrice: newTotalPrice },
      { new: true }
    );

    res.json({
      message: 'Price updated successfully',
      vehicle: updatedVehicle
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating price', error: error.message });
  }
});

// Updated PUT request to handle image upload and new price fields
router.put('/:id', handleUpload, async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findById(id);
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    let imageUrl = vehicle.image;

    if (req.file) {
      // If there's an existing image, delete it from Cloudinary
      if (vehicle.image) {
        try {
          const publicId = vehicle.image.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(publicId);
        } catch (error) {
          console.error('Error deleting old image:', error);
        }
      }
      imageUrl = req.file.path;
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      id,
      {
        ...req.body,
        image: imageUrl
      },
      { new: true }
    );

    res.json({ message: 'Vehicle updated successfully', vehicle: updatedVehicle });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).json({ 
      message: 'Error updating vehicle', 
      error: error.message 
    });
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
    res.status(500).json({ message: 'Server Error', error });
  }
});

export default router;
