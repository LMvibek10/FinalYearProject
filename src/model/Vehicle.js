import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    subcategory: { type: String, required: true },
    fuelType: { type: String, required: true, enum: ["Petrol", "Diesel", "Electric"] },
    seatingCapacity: { type: Number, required: true },
    makeYear: { type: Number, required: true },
    pricePerDay: { type: Number, required: true },
    status: { type: String, default: "Available" }, // Available, Rented, Maintenance
    rating: { type: Number, default: 0 },
    image: { type: String, required: true }, // Change this from Array to String
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Vehicle = mongoose.model("Vehicle", vehicleSchema);
export default Vehicle;
