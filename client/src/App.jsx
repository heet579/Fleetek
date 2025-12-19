import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import CarForm from './pages/CarForm';
import UserManagement from './pages/UserManagement';
import Garage from './pages/Garage';
import FleetCircle from './pages/FleetCircle';
import FuelSheet from './pages/FuelSheet';
import { useState, useEffect } from 'react';

// Simple Auth Context helper (can be moved to context later)
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />; // Or forbidden page
  }

  return children;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={
            <ProtectedRoute allowedRoles={['client', 'user', 'admin']}>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/inventory" element={
            <ProtectedRoute allowedRoles={['client', 'user', 'admin']}>
              <Inventory />
            </ProtectedRoute>
          } />

          <Route path="/cars/new" element={
            <ProtectedRoute allowedRoles={['client', 'admin']}>
              <CarForm />
            </ProtectedRoute>
          } />

          <Route path="/cars/:id/edit" element={
            <ProtectedRoute allowedRoles={['client', 'admin']}>
              <CarForm />
            </ProtectedRoute>
          } />

          <Route path="/users" element={
            <ProtectedRoute allowedRoles={['client', 'admin']}>
              <UserManagement />
            </ProtectedRoute>
          } />

          <Route path="/garage" element={
            <ProtectedRoute allowedRoles={['client', 'admin', 'user']}>
              <Garage />
            </ProtectedRoute>
          } />

          <Route path="/fleet-circle" element={
            <ProtectedRoute allowedRoles={['client', 'admin', 'user']}>
              <FleetCircle />
            </ProtectedRoute>
          } />

          <Route path="/fuel-sheet" element={
            <ProtectedRoute allowedRoles={['client', 'admin', 'user']}>
              <FuelSheet />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
