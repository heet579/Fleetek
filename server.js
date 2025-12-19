import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import carRoutes from './routes/cars.js';
import userRoutes from './routes/users.js';
import fuelRoutes from './routes/fuel.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/users', userRoutes);
app.use('/api/fuel', fuelRoutes);

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