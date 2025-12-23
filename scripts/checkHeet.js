import mongoose from 'mongoose';
import User from '../models/User.js';

const ATLAS_URI = 'mongodb+srv://heet0882_db_user:heet0882@cluster0.l56bq9m.mongodb.net/car_inventory?appName=Cluster0';

const checkHeet = async () => {
    try {
        await mongoose.connect(ATLAS_URI);
        const user = await User.findOne({ username: 'heet' });
        console.log('User heet info:', {
            username: user?.username,
            email: user?.email,
            role: user?.role
        });
        process.exit(0);
    } catch (error) {
        console.error('Check failed:', error);
        process.exit(1);
    }
};

checkHeet();
