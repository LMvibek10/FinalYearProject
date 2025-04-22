import express from 'express';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/config.js'; // Import Cloudinary config
import Vehicle from '../model/Vehicle.js'; // Assuming you have a Vehicle model

const router = express.Router();

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'VehicleImages',
    allowed_formats: ['jpg', 'png', 'jpeg'],
    resource_type: 'image',
  },
});

const upload = multer({ storage: storage });

// Route to add a new vehicle
router.post('/', upload.single('image'), async (req, res) => {
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
      pricePerDay: req.body.pricePerDay,
      status: req.body.status || 'Available',
      rating: req.body.rating || 0,
      image: req.file.path, // Store the Cloudinary URL
    });

    await newVehicle.save();
    res.status(201).json({ message: 'Vehicle added successfully', vehicle: newVehicle });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
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

// Updated PUT request to handle image upload asynchronously
router.put('/:id', upload.single('image'), async (req, res) => {
  const { id } = req.params;

  try {
    const vehicleData = await Vehicle.findById(id);
    if (!vehicleData) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    let imageUrl = vehicleData.image; // Keep the old image if no new one

    // If there's an image, upload it to Cloudinary
    if (req.file) {
      // Return the upload promise and await its resolution
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: 'VehicleImages',
        resource_type: 'image',
      });
      
      imageUrl = uploadResult.secure_url; // Use the new image URL
       // Set the new image URL from Cloudinary
    }

    // Update vehicle details
    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      id,
      { ...req.body, image: imageUrl }, // Include the new image URL in the update
      { new: true }
    );

    res.json({ message: 'Vehicle updated successfully', vehicle: updatedVehicle });
  } catch (error) {
    res.status(500).json({ message: 'Error updating vehicle', error });
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
