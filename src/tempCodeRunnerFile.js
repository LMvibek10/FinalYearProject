import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

import bodyParser from "body-parser";
import signupRouter from "./routes/signup.js";
import signinRouter from "./routes/signin.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";


const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());
dotenv.config();

console.log('MongoDB URI:', process.env.MONGO_URI); 
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.log('Error connecting to MongoDB:', error));


// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/RentEase", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};


// Routes setup
app.use("/signin", signinRouter);
app.use("/signup", signupRouter);
app.use("/vehicles", vehicleRoutes);


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});



