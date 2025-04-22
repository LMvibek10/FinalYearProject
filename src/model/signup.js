import mongoose from 'mongoose';

const signupSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/  // Basic email validation regex
  },
  password: {
    type: String,
    required: true,
    minlength: 6  // Minimum password length constraint
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true  // Adds createdAt and updatedAt fields
});

const signup = mongoose.model('Signup', signupSchema);
export default signup;
