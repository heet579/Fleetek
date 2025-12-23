import mongoose from 'mongoose';
import User from '../models/User.js';

const LOCAL_URI = 'mongodb://localhost:27017/car_inventory';
const ATLAS_URI = 'mongodb+srv://heet0882_db_user:heet0882@cluster0.l56bq9m.mongodb.net/car_inventory?appName=Cluster0';

const compare = async () => {
    try {
        const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
        const atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();

        const LocalUser = localConn.model('User', User.schema);
        const AtlasUser = atlasConn.model('User', User.schema);

        const localUser = await LocalUser.findOne({ username: 'admin' });
        const atlasUser = await AtlasUser.findOne({ username: 'admin' });

        console.log('--- Comparison for user "admin" ---');
        console.log('Local Hash:', localUser?.password);
        console.log('Atlas Hash:', atlasUser?.password);

        if (localUser && atlasUser && localUser.password !== atlasUser.password) {
            console.log('CRITICAL: Hashes do not match! Double hashing detected.');
        } else {
            console.log('Hashes match or user missing.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Comparison failed:', error);
        process.exit(1);
    }
};

compare();
