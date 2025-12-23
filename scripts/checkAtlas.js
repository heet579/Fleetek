import mongoose from 'mongoose';
import User from '../models/User.js';

const ATLAS_URI = 'mongodb+srv://heet0882_db_user:heet0882@cluster0.l56bq9m.mongodb.net/car_inventory?appName=Cluster0';

const check = async () => {
    try {
        await mongoose.connect(ATLAS_URI);
        console.log('Connected to Atlas');
        const users = await User.find({}, { password: 0 }); // Don't log passwords
        console.log('Total users in Atlas:', users.length);
        console.log('Users:', users.map(u => u.username));
        process.exit(0);
    } catch (error) {
        console.error('Check failed:', error);
        process.exit(1);
    }
};

check();
