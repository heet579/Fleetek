import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const seedAdmin = async () => {
    try {
        const adminExists = await User.findOne({ role: 'admin' });
        if (adminExists) {
            console.log('Admin user already exists');
            return;
        }

        const hashedPassword = await bcrypt.hash('admin', 12);

        const adminUser = new User({
            username: 'admin',
            email: 'admin@fleetek.com',
            password: 'admin123', // The pre-save hook might retry hashing if we aren't careful, but here we are creating a new instance.
            // Actually, the User model has a pre-save hook that hashes the password if modified.
            // If we pass the plain text 'admin' here, the model will hash it.
            // Let's pass plain text and let the model handle hashing to be consistent with the model logic.
            role: 'admin',
            permissions: ['all']
        });

        await adminUser.save();
        console.log('Admin user created successfully');
    } catch (error) {
        console.error('Error seeding admin user:', error);
    }
};

export default seedAdmin;
