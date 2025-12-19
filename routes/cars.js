import express from 'express';
import Car from '../models/Car.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all cars (public)
router.get('/', async (req, res) => {
  try {
    const { search, make, minPrice, maxPrice, year, status = 'available' } = req.query;

    let filter = { status };

    // Search filter
    if (search) {
      filter.$or = [
        { make: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Additional filters
    if (make) filter.make = make;
    if (year) filter.year = parseInt(year);
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseInt(minPrice);
      if (maxPrice) filter.price.$lte = parseInt(maxPrice);
    }

    const cars = await Car.find(filter).sort({ createdAt: -1 });
    res.json(cars);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single car
router.get('/:id', async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }
    res.json(car);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create car (admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'client') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const car = new Car({
      ...req.body,
      createdBy: req.user.userId
    });

    await car.save();
    res.status(201).json(car);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update car (admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'client') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const car = await Car.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    res.json(car);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete car (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'client') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const car = await Car.findByIdAndDelete(req.params.id);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    res.json({ message: 'Car deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get car statistics
router.get('/stats/summary', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'client') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const stats = await Car.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$price' }
        }
      }
    ]);

    const totalCars = await Car.countDocuments();

    res.json({
      totalCars,
      statusBreakdown: stats
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;