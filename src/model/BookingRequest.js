import mongoose from 'mongoose';

const bookingRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Signup',
    required: true
  },
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  userDetails: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true }
  },
  vehicleDetails: {
    name: { type: String, required: true },
    category: { type: String, required: true },
    subcategory: { type: String, required: true },
    fuelType: { type: String, required: true },
    seatingCapacity: { type: Number, required: true },
    makeYear: { type: Number, required: true },
    insideValleyPrice: { type: Number, required: true },
    outsideValleyPrice: { type: Number, required: true },
    image: { type: String, required: true }
  },
  bookingDetails: {
    pickupDate: { type: Date, required: true },
    returnDate: { type: Date, required: true },
    pickupLocation: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String, required: true }
    },
    isInsideValley: { type: Boolean, required: true },
    duration: { type: Number, required: true },
    driverOption: { type: String, enum: ["with-driver", "without-driver"], required: true },
    totalDays: { type: Number, required: true }
  },
  totalPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'declined'],
    default: 'pending'
  },
  adminResponse: {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Signup' },
    responseDate: { type: Date },
    reason: { type: String }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

const BookingRequest = mongoose.model('BookingRequest', bookingRequestSchema);
export default BookingRequest; 