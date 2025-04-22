# 🚗 RentEase - Vehicle Rental Management System

<div align="center">
  <img src="public/images/logo.png" alt="RentEase Logo" width="200"/>
  
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
  [![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
</div>

## 📝 Table of Contents
- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

## 🎯 About
RentEase is a modern vehicle rental management system that provides a seamless experience for both administrators and users. The platform allows users to browse, book, and manage vehicle rentals while providing administrators with powerful tools to manage the fleet and user accounts.

## ✨ Features
- **User Authentication**
  - Email/Password Signup & Login
  - Google OAuth Integration
  - Secure JWT Authentication
  - Profile Management

- **Vehicle Management**
  - Browse Available Vehicles
  - Filter by Vehicle Type
  - Search Functionality
  - Detailed Vehicle Information

- **Admin Dashboard**
  - User Management
  - Vehicle Inventory Control
  - Booking Management
  - Analytics and Reporting

- **Booking System**
  - Real-time Availability
  - Booking History
  - Payment Integration
  - Email Notifications

## 🛠️ Tech Stack
- **Frontend**
  - React.js
  - Vite
  - React Router
  - Axios
  - Google OAuth
  - CSS3

- **Backend**
  - Node.js
  - Express.js
  - MongoDB
  - Mongoose
  - JWT Authentication
  - Google OAuth

## 🚀 Getting Started
To get a local copy up and running, follow these simple steps.

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation
1. Clone the repository
```bash
git clone https://github.com/yourusername/rentease.git
cd rentease
```

2. Install dependencies
```bash
# Install server dependencies
npm install

# Install client dependencies
cd client
npm install
```

3. Start the development server
```bash
# Start the backend server
npm run server

# Start the frontend development server
npm run dev
```

## 🔑 Environment Variables
Create a `.env` file in the root directory with the following variables:
```env
# Server Configuration
PORT=5000

# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/RentEase

# JWT Configuration
JWT_SECRET=your_jwt_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email Configuration
EMAIL_USER=your_email
EMAIL_PASSWORD=your_email_password

# Cloudinary Configuration
CLOUD_NAME=your_cloud_name
CLOUD_API_KEY=your_cloud_api_key
CLOUD_API_SECRET=your_cloud_api_secret
```

## 📡 API Endpoints
### Authentication
- `POST /api/signup` - User registration
- `POST /api/signin` - User login
- `POST /api/auth/google` - Google OAuth authentication

### Vehicles
- `GET /api/vehicles` - Get all vehicles
- `POST /api/vehicles` - Add new vehicle
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle

### User Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

## 🤝 Contributing
Contributions are what make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <sub>Built with ❤️ by Your Name</sub>
</div>
