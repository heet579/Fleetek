import express from 'express';
import Rental from '../models/Rental.js';
import Car from '../models/Car.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all rentals
router.get('/', auth, async (req, res) => {
    try {
        const rentals = await Rental.find()
            .populate('car')
            .populate('createdBy', 'username')
            .sort({ createdAt: -1 });
        res.json(rentals);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create a new rental
router.post('/', auth, async (req, res) => {
    try {
        const { carId, customerName, customerPhone, destination, startDate, plannedEndDate, notes } = req.body;

        const rental = new Rental({
            car: carId,
            customerName,
            customerPhone,
            destination,
            startDate: startDate || new Date(),
            plannedEndDate,
            notes,
            createdBy: req.user.userId
        });

        await rental.save();

        // Update car status to 'rental'
        await Car.findByIdAndUpdate(carId, { status: 'rental' });

        res.status(201).json(rental);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Return a car (Complete rental)
router.patch('/:id/return', auth, async (req, res) => {
    try {
        const { actualReturnDate } = req.body;
        const rental = await Rental.findById(req.params.id);

        if (!rental) {
            return res.status(404).json({ message: 'Rental record not found' });
        }

        rental.status = 'completed';
        rental.actualReturnDate = actualReturnDate || new Date();
        await rental.save();

        // Update car status back to 'available'
        await Car.findByIdAndUpdate(rental.car, { status: 'available' });

        res.json(rental);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Cancel a rental
router.patch('/:id/cancel', auth, async (req, res) => {
    try {
        const rental = await Rental.findById(req.params.id);

        if (!rental) {
            return res.status(404).json({ message: 'Rental record not found' });
        }

        rental.status = 'cancelled';
        await rental.save();

        // Update car status back to 'available'
        await Car.findByIdAndUpdate(rental.car, { status: 'available' });

        res.json(rental);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
