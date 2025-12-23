import mongoose from 'mongoose';
import User from '../models/User.js';

const ATLAS_URI = 'mongodb+srv://heet0882_db_user:heet0882@cluster0.l56bq9m.mongodb.net/car_inventory?appName=Cluster0';

const listUsers = async () => {
    try {
        await mongoose.connect(ATLAS_URI);
        const users = await User.find({}, { username: 1, email: 1, role: 1 });
        console.log('--- Atlas Users ---');
        users.forEach(u => {
            console.log(`User: ${u.username}, Email: ${u.email}, Role: ${u.role}`);
        });
        process.exit(0);
    } catch (error) {
        console.error('List failed:', error);
        process.exit(1);
    }
};

listUsers();
