import express from 'express';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get all users
router.get('/', auth, async (req, res) => {
    try {
        const requesterId = req.user.userId;
        const requester = await User.findById(requesterId);

        if (requester.role !== 'client' && requester.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        let query = {};
        // If client, only show users they created
        if (requester.role === 'client') {
            query = { createdBy: requesterId };
        }
        // If admin, show all (query remains empty)

        const users = await User.find(query).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user (permissions/role)
router.put('/:id', auth, async (req, res) => {
    try {
        const requesterId = req.user.userId;
        const requester = await User.findById(requesterId);

        if (requester.role !== 'admin' && requester.role !== 'client') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { role, permissions } = req.body;
        const userToUpdate = await User.findById(req.params.id);

        if (!userToUpdate) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Clients can only update users they created
        if (requester.role === 'client' && userToUpdate.createdBy?.toString() !== requesterId) {
            return res.status(403).json({ message: 'You can only update your own team members' });
        }

        // Apply updates
        if (role) userToUpdate.role = role;
        if (permissions) userToUpdate.permissions = permissions;

        await userToUpdate.save();

        res.json({
            message: 'User updated successfully',
            user: {
                id: userToUpdate._id,
                username: userToUpdate.username,
                email: userToUpdate.email,
                role: userToUpdate.role,
                permissions: userToUpdate.permissions
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
