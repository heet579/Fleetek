import User from '../models/User.js';

const checkPermission = (permission) => {
    return async (req, res, next) => {
        try {
            const user = await User.findById(req.user.userId);

            // Clients/Admins have access to everything (or handle specifically)
            if (user.role === 'client' || user.role === 'admin') {
                return next();
            }

            if (user.role === 'user' && user.permissions.includes(permission)) {
                return next();
            }

            return res.status(403).json({
                message: 'Access denied: Insufficient permissions'
            });

        } catch (error) {
            console.error('Permission check error:', error);
            res.status(500).json({ message: 'Server error during permission check' });
        }
    };
};

export default checkPermission;
