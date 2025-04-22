import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from './view/homepage';
import Login from './signin';
import Signup from './signup';
import AdminVehicleManagement  from './view/ad_vehiclemanagement';
import Dashboard  from './view/ad_dashboard';
import UserVehicle from './user/user_vehicle';
import Booking from "./user/booking";
import Profile from "./user/Profile";
import Users from "./view/ad_users";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin" element={<AdminVehicleManagement />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/user" element={<UserVehicle />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/profile" element={<Profile/>}/>
        <Route path="/users" element={<Users/>}/>
      </Routes>
    </Router>
  );
}

export default App;