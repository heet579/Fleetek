import mongoose from 'mongoose';
import Car from '../models/Car.js';
import FuelLog from '../models/FuelLog.js';
import User from '../models/User.js';
import Chemical from '../models/Chemical.js';
import ChemicalOrder from '../models/ChemicalOrder.js';
import Rental from '../models/Rental.js';

const LOCAL_URI = 'mongodb://localhost:27017/car_inventory';
const ATLAS_URI = 'mongodb+srv://heet0882_db_user:heet0882@cluster0.l56bq9m.mongodb.net/car_inventory?appName=Cluster0';

const migrate = async () => {
    try {
        console.log('Connecting to local database...');
        const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
        console.log('Connected to local DB.');

        console.log('Connecting to Atlas database...');
        const atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();
        console.log('Connected to Atlas DB.');

        const collections = [
            { name: 'User', model: User },
            { name: 'Car', model: Car },
            { name: 'FuelLog', model: FuelLog },
            { name: 'Chemical', model: Chemical },
            { name: 'ChemicalOrder', model: ChemicalOrder },
            { name: 'Rental', model: Rental }
        ];

        for (const col of collections) {
            console.log(`Migrating ${col.name}...`);

            // Get data from local
            const LocalModel = localConn.model(col.name, col.model.schema);
            const data = await LocalModel.find({});
            console.log(`Found ${data.length} records in local ${col.name}.`);

            if (data.length > 0) {
                // Clear and insert into atlas
                const AtlasModel = atlasConn.model(col.name, col.model.schema);
                await AtlasModel.deleteMany({});
                await AtlasModel.insertMany(data);
                console.log(`Successfully migrated ${col.name} to Atlas.`);
            }
        }

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
