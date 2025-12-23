import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import carRoutes from './routes/cars.js';
import userRoutes from './routes/users.js';
import fuelRoutes from './routes/fuel.js';
import chemicalRoutes from './routes/chemicals.js';
import rentalRoutes from './routes/rentals.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/dist')));

  app.get('*', (req, res, next) => {
    // If request is for an API route, skip to next middleware (routes)
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
  });
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/users', userRoutes);
app.use('/api/fuel', fuelRoutes);
app.use('/api/chemicals', chemicalRoutes);
app.use('/api/rentals', rentalRoutes);

import seedAdmin from './scripts/seedAdmin.js'; // Import the seed function

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/car_inventory')
  .then(async () => {
    console.log('MongoDB connected');
    await seedAdmin(); // Run the seed script
  })
  .catch(err => console.log('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});