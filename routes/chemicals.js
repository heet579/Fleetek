import express from 'express';
import Chemical from '../models/Chemical.js';
import ChemicalOrder from '../models/ChemicalOrder.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all chemicals and stock
router.get('/', auth, async (req, res) => {
    try {
        const chemicals = await Chemical.find();
        res.json(chemicals);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all chemical orders (Dealer sees only theirs, Admin sees all)
router.get('/orders', auth, async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'dealer') {
            query.dealer = req.user.userId;
        } else if (req.user.role !== 'admin' && req.user.role !== 'client') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const orders = await ChemicalOrder.find(query)
            .populate('chemical')
            .populate('dealer', 'username email')
            .sort({ date: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create a new chemical delivery (Dealer/Admin)
router.post('/orders', auth, async (req, res) => {
    try {
        const { chemicalId, quantity, cost, date, receiptImage, paymentStatus, location } = req.body;

        // Ensure user is dealer or admin
        if (req.user.role !== 'dealer' && req.user.role !== 'admin' && req.user.role !== 'client') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const order = new ChemicalOrder({
            chemical: chemicalId,
            dealer: req.user.role === 'dealer' ? req.user.userId : req.body.dealerId || req.user.userId,
            quantity,
            cost,
            date: date || new Date(),
            receiptImage,
            paymentStatus: paymentStatus || 'pending',
            location
        });

        await order.save();

        // Update stock
        await Chemical.findByIdAndUpdate(chemicalId, {
            $inc: { currentStock: quantity }
        });

        res.status(201).json(order);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update chemical order payment status (Admin/Client only)
router.patch('/orders/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'client') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { paymentStatus } = req.body;
        const order = await ChemicalOrder.findByIdAndUpdate(
            req.params.id,
            { paymentStatus },
            { new: true }
        ).populate('chemical').populate('dealer', 'username email');

        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Create a new chemical type (Admin only)
router.post('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.role !== 'client') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const chemical = new Chemical(req.body);
        await chemical.save();
        res.status(201).json(chemical);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
