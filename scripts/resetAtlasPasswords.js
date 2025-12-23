import mongoose from 'mongoose';
import User from '../models/User.js';

const ATLAS_URI = 'mongodb+srv://heet0882_db_user:heet0882@cluster0.l56bq9m.mongodb.net/car_inventory?appName=Cluster0';

const resetPasswords = async () => {
    try {
        await mongoose.connect(ATLAS_URI);
        console.log('Connected to Atlas');

        const usersToReset = ['admin', 'heet'];
        for (const username of usersToReset) {
            const user = await User.findOne({ username });
            if (user) {
                user.password = 'password123';
                await user.save();
                console.log(`Password reset for user: ${username}`);
            } else {
                console.log(`User not found: ${username}`);
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('Reset failed:', error);
        process.exit(1);
    }
};

resetPasswords();
