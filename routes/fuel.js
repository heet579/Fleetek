import express from 'express';
import FuelLog from '../models/FuelLog.js';
import Car from '../models/Car.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all fuel logs
router.get('/', auth, async (req, res) => {
    try {
        const { month, year } = req.query;
        let filter = {};

        if (month && year) {
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0);
            filter.date = { $gte: startDate, $lte: endDate };
        }

        const logs = await FuelLog.find(filter).sort({ date: -1 });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Add new fuel log
router.post('/', auth, async (req, res) => {
    try {
        const { mvaNumber, rego, kms, litres, cost, date } = req.body;

        // Optional: Auto-link to car if rego matches
        const car = await Car.findOne({ rego: { $regex: new RegExp(`^${rego}$`, 'i') } });

        const newLog = new FuelLog({
            car: car ? car._id : undefined,
            mvaNumber,
            rego,
            kms,
            litres,
            cost,
            date: date || Date.now(),
            createdBy: req.user.userId
        });

        await newLog.save();
        res.status(201).json(newLog);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
