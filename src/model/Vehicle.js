import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    subcategory: { type: String, required: true },
    fuelType: { type: String, required: true, enum: ["Petrol", "Diesel", "Electric"] },
    seatingCapacity: { type: Number, required: true },
    makeYear: { type: Number, required: true },
    insideValleyPrice: { 
      type: Number, 
      required: true,
      min: 0,
      set: v => Math.round(v), // Ensure whole numbers
      description: "Price per day for rentals inside Kathmandu Valley"
    },
    outsideValleyPrice: { 
      type: Number, 
      required: true,
      min: 0,
      set: v => Math.round(v), // Ensure whole numbers
      description: "Price per day for rentals outside Kathmandu Valley"
    },
    totalPrice: { 
      type: Number,
      required: false,
      min: 0,
      description: "Final calculated price based on location and other factors"
    },
    status: { type: String, default: "Available" }, // Available, Rented, Maintenance
    rating: { type: Number, default: 0 },
    image: { type: String, required: true }, // Change this from Array to String
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Pre-save middleware to ensure prices are whole numbers
vehicleSchema.pre('save', function(next) {
  if (this.insideValleyPrice) {
    this.insideValleyPrice = Math.round(this.insideValleyPrice);
  }
  if (this.outsideValleyPrice) {
    this.outsideValleyPrice = Math.round(this.outsideValleyPrice);
  }
  next();
});

// Remove fields that shouldn't be sent to client
vehicleSchema.set('toJSON', {
  transform: function(doc, ret, options) {
    delete ret.__v;
    return ret;
  }
});

const Vehicle = mongoose.model("Vehicle", vehicleSchema);
export default Vehicle;
