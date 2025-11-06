import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CarsList from './pages/CarsList';
import CarDetails from './pages/CarDetails';
import TripsManagement from './pages/TripsManagement';
import Login from './pages/Login';
import Register from './pages/Register';
import Navbar from './components/Navbar';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <Navbar />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<CarsList />} />
          <Route path="/cars/:id" element={<CarDetails />} />
          <Route path="/trips" element={<TripsManagement />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
