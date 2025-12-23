import mongoose from 'mongoose';

const carSchema = new mongoose.Schema({
  make: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  costPrice: {
    type: Number,
    min: 0
  },
  soldPrice: {
    type: Number,
    min: 0
  },
  soldDate: {
    type: Date
  },
  rego: {
    type: String,
    required: true,
    trim: true
  },
  mvaNumber: {
    type: String,
    trim: true
  },
  kmsDriven: {
    type: Number,
    required: true,
    min: 0
  },
  color: {
    type: String,
    trim: true
  },
  // Keeping mileage for backward compatibility if needed, otherwise optional
  mileage: {
    type: Number,
    min: 0
  },
  fuelType: {
    type: String,
    enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid'],
    required: true
  },
  transmission: {
    type: String,
    enum: ['Manual', 'Automatic'],
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  images: [{
    type: String
  }],
  location: {
    type: String,
    enum: ['Yard', 'Parking', 'Showroom'],
    default: 'Yard'
  },
  status: {
    type: String,
    enum: ['available', 'sold', 'reserved', 'service', 'new', 'yard', 'rental'],
    default: 'available'
  },
  serviceHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    kms: Number,
    description: String,
    cost: Number
  }],
  maintenanceNotes: {
    type: String,
    trim: true
  },
  engineNumber: {
    type: String,
    trim: true
  },
  vendor: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['Luxury', 'SUV', 'Sedan', 'Hatchback', 'Truck', 'Wagon', 'Coupe', 'Other']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for search functionality
carSchema.index({ make: 'text', model: 'text', description: 'text' });

export default mongoose.model('Car', carSchema);