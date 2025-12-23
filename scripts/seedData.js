import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Car from '../models/Car.js';
import FuelLog from '../models/FuelLog.js';
import User from '../models/User.js';
import Chemical from '../models/Chemical.js';
import ChemicalOrder from '../models/ChemicalOrder.js';
import Rental from '../models/Rental.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/car_inventory');
        console.log('Connected to MongoDB');

        // Get an admin user to associate with the data
        let admin = await User.findOne({ role: 'admin' });
        if (!admin) {
            console.log('Admin user not found. Please run seedAdmin.js first.');
            process.exit(1);
        }

        // Clear existing data (optional, but good for a fresh start in development)
        await Car.deleteMany({});
        await FuelLog.deleteMany({});
        await Chemical.deleteMany({});
        await ChemicalOrder.deleteMany({});
        await Rental.deleteMany({});
        console.log('Cleared existing car, fuel log, chemical, chemical order, and rental data');

        // Ensure Dealer exists
        let dealer = await User.findOne({ role: 'dealer' });
        if (!dealer) {
            dealer = new User({
                username: 'chemdealer',
                email: 'dealer@chemicals.com',
                password: 'password123', // Will be hashed by pre-save if implemented, or manually if needed
                role: 'dealer',
                permissions: ['manage_chemicals']
            });
            await dealer.save();
            console.log('Created Dealer user');
        }

        const cars = [
            {
                make: 'Toyota',
                model: 'Camry',
                year: 2022,
                price: 35000,
                costPrice: 28000,
                rego: 'T-100-ABC',
                mvaNumber: 'MVA1001',
                kmsDriven: 15000,
                color: 'White',
                fuelType: 'Hybrid',
                transmission: 'Automatic',
                status: 'available',
                location: 'Showroom',
                category: 'Sedan',
                createdBy: admin._id,
                serviceHistory: [
                    { date: new Date('2023-01-15'), kms: 10000, description: 'First Service', cost: 250 }
                ]
            },
            {
                make: 'Ford',
                model: 'Ranger',
                year: 2021,
                price: 45000,
                costPrice: 38000,
                rego: 'F-200-XYZ',
                mvaNumber: 'MVA1002',
                kmsDriven: 45000,
                color: 'Blue',
                fuelType: 'Diesel',
                transmission: 'Automatic',
                status: 'service',
                location: 'Yard',
                category: 'Truck',
                createdBy: admin._id,
                serviceHistory: [
                    { date: new Date('2023-03-10'), kms: 40000, description: 'Brake pad replacement', cost: 600 }
                ]
            },
            {
                make: 'Tesla',
                model: 'Model 3',
                year: 2023,
                price: 65000,
                costPrice: 55000,
                rego: 'E-300-ELE',
                mvaNumber: 'MVA1003',
                kmsDriven: 5000,
                color: 'Black',
                fuelType: 'Electric',
                transmission: 'Automatic',
                status: 'available',
                location: 'Showroom',
                category: 'Sedan',
                createdBy: admin._id
            },
            {
                make: 'Honda',
                model: 'CR-V',
                year: 2020,
                price: 32000,
                costPrice: 25000,
                soldPrice: 31500,
                soldDate: new Date('2023-11-20'),
                rego: 'H-400-SUV',
                mvaNumber: 'MVA1004',
                kmsDriven: 60000,
                color: 'Silver',
                fuelType: 'Petrol',
                transmission: 'Automatic',
                status: 'sold',
                location: 'Yard',
                category: 'SUV',
                createdBy: admin._id,
                serviceHistory: [
                    { date: new Date('2023-05-12'), kms: 55000, description: 'Oil change and filter', cost: 180 }
                ]
            },
            {
                make: 'Mazda',
                model: 'CX-5',
                year: 2019,
                price: 28000,
                costPrice: 20000,
                soldPrice: 27500,
                soldDate: new Date('2023-10-05'),
                rego: 'M-500-MAZ',
                mvaNumber: 'MVA1005',
                kmsDriven: 85000,
                color: 'Red',
                fuelType: 'Petrol',
                transmission: 'Automatic',
                status: 'sold',
                location: 'Yard',
                category: 'SUV',
                createdBy: admin._id
            },
            {
                make: 'BMW',
                model: '3 Series',
                year: 2021,
                price: 52000,
                costPrice: 42000,
                rego: 'B-600-BEA',
                mvaNumber: 'MVA1006',
                kmsDriven: 22000,
                color: 'Deep Blue',
                fuelType: 'Petrol',
                transmission: 'Automatic',
                status: 'available',
                location: 'Showroom',
                category: 'Luxury',
                createdBy: admin._id
            },
            {
                make: 'Audi',
                model: 'Q7',
                year: 2022,
                price: 85000,
                costPrice: 70000,
                rego: 'A-700-AUD',
                mvaNumber: 'MVA1007',
                kmsDriven: 12000,
                color: 'Grey',
                fuelType: 'Diesel',
                transmission: 'Automatic',
                status: 'available',
                location: 'Showroom',
                category: 'Luxury',
                createdBy: admin._id
            },
            {
                make: 'Nissan',
                model: 'Navara',
                year: 2018,
                price: 24000,
                costPrice: 18000,
                soldPrice: 23000,
                soldDate: new Date('2023-12-01'),
                rego: 'N-800-NIS',
                mvaNumber: 'MVA1008',
                kmsDriven: 110000,
                color: 'White',
                fuelType: 'Diesel',
                transmission: 'Manual',
                status: 'sold',
                location: 'Yard',
                category: 'Truck',
                createdBy: admin._id
            },
            {
                make: 'Mercedes-Benz',
                model: 'C-Class',
                year: 2022,
                price: 58000,
                costPrice: 48000,
                rego: 'MB-900-CLA',
                mvaNumber: 'MVA1009',
                kmsDriven: 15000,
                color: 'Black',
                fuelType: 'Petrol',
                transmission: 'Automatic',
                status: 'available',
                location: 'Showroom',
                category: 'Luxury',
                createdBy: admin._id
            },
            {
                make: 'Hyundai',
                model: 'Tucson',
                year: 2021,
                price: 31000,
                costPrice: 25000,
                rego: 'HY-101-TUC',
                mvaNumber: 'MVA1010',
                kmsDriven: 30000,
                color: 'Blue',
                fuelType: 'Petrol',
                transmission: 'Automatic',
                status: 'available',
                location: 'Parking',
                category: 'SUV',
                createdBy: admin._id
            },
            {
                make: 'Kia',
                model: 'Sorento',
                year: 2020,
                price: 29000,
                costPrice: 23000,
                rego: 'KI-202-SOR',
                mvaNumber: 'MVA1011',
                kmsDriven: 45000,
                color: 'White',
                fuelType: 'Diesel',
                transmission: 'Automatic',
                status: 'available',
                location: 'Parking',
                category: 'SUV',
                createdBy: admin._id
            },
            {
                make: 'Volkswagen',
                model: 'Golf',
                year: 2019,
                price: 22000,
                costPrice: 16000,
                rego: 'VW-303-GOL',
                mvaNumber: 'MVA1012',
                kmsDriven: 70000,
                color: 'Grey',
                fuelType: 'Petrol',
                transmission: 'Manual',
                status: 'available',
                location: 'Yard',
                category: 'Hatchback',
                createdBy: admin._id
            },
            {
                make: 'Subaru',
                model: 'Outback',
                year: 2021,
                price: 38000,
                costPrice: 30000,
                rego: 'SB-404-OUT',
                mvaNumber: 'MVA1013',
                kmsDriven: 25000,
                color: 'Green',
                fuelType: 'Petrol',
                transmission: 'Automatic',
                status: 'available',
                location: 'Parking',
                category: 'Wagon',
                createdBy: admin._id
            },
            {
                make: 'Lexus',
                model: 'RX',
                year: 2022,
                price: 72000,
                costPrice: 60000,
                rego: 'LX-505-REX',
                mvaNumber: 'MVA1014',
                kmsDriven: 10000,
                color: 'White',
                fuelType: 'Hybrid',
                transmission: 'Automatic',
                status: 'available',
                location: 'Showroom',
                category: 'Luxury',
                createdBy: admin._id
            },
            {
                make: 'Jeep',
                model: 'Wrangler',
                year: 2021,
                price: 55000,
                costPrice: 45000,
                rego: 'JP-606-WRA',
                mvaNumber: 'MVA1015',
                kmsDriven: 35000,
                color: 'Orange',
                fuelType: 'Petrol',
                transmission: 'Automatic',
                status: 'available',
                location: 'Yard',
                category: 'SUV',
                createdBy: admin._id
            },
            {
                make: 'Porsche',
                model: 'Macan',
                year: 2023,
                price: 110000,
                costPrice: 90000,
                rego: 'PR-707-MAC',
                mvaNumber: 'MVA1016',
                kmsDriven: 2000,
                color: 'Black',
                fuelType: 'Petrol',
                transmission: 'Automatic',
                status: 'available',
                location: 'Showroom',
                category: 'Luxury',
                createdBy: admin._id
            },
            {
                make: 'Mitsubishi',
                model: 'Triton',
                year: 2020,
                price: 34000,
                costPrice: 27000,
                rego: 'MT-808-TRI',
                mvaNumber: 'MVA1017',
                kmsDriven: 55000,
                color: 'Silver',
                fuelType: 'Diesel',
                transmission: 'Automatic',
                status: 'available',
                location: 'Parking',
                category: 'Truck',
                createdBy: admin._id
            },
            {
                make: 'Volvo',
                model: 'XC90',
                year: 2022,
                price: 78000,
                costPrice: 65000,
                rego: 'VL-909-XCO',
                mvaNumber: 'MVA1018',
                kmsDriven: 18000,
                color: 'Blue',
                fuelType: 'Hybrid',
                transmission: 'Automatic',
                status: 'available',
                location: 'Parking',
                category: 'Luxury',
                createdBy: admin._id
            },
            {
                make: 'Suzuki',
                model: 'Swift',
                year: 2021,
                price: 18000,
                costPrice: 13000,
                rego: 'SZ-111-SWI',
                mvaNumber: 'MVA1019',
                kmsDriven: 20000,
                color: 'Yellow',
                fuelType: 'Petrol',
                transmission: 'Automatic',
                status: 'available',
                location: 'Yard',
                category: 'Hatchback',
                createdBy: admin._id
            },
            {
                make: 'Land Rover',
                model: 'Defender',
                year: 2023,
                price: 125000,
                costPrice: 105000,
                rego: 'LR-222-DEF',
                mvaNumber: 'MVA1020',
                kmsDriven: 3000,
                color: 'Tan',
                fuelType: 'Diesel',
                transmission: 'Automatic',
                status: 'available',
                location: 'Showroom',
                category: 'Luxury',
                createdBy: admin._id
            }
        ];

        const savedCars = await Car.insertMany(cars);
        console.log(`Seeded ${savedCars.length} cars`);

        // Seed Fuel Logs
        const fuelLogs = [];
        const fuelPrices = [1.8, 1.9, 2.0, 2.1, 1.7];

        savedCars.forEach((car, index) => {
            if (car.fuelType !== 'Electric') {
                // Add 3 fuel logs for each non-electric car
                for (let i = 0; i < 3; i++) {
                    const litres = 30 + Math.random() * 40;
                    const pricePerLitre = fuelPrices[Math.floor(Math.random() * fuelPrices.length)];
                    fuelLogs.push({
                        car: car._id,
                        mvaNumber: car.mvaNumber,
                        rego: car.rego,
                        kms: car.kmsDriven - (1000 * (i + 1)),
                        litres: parseFloat(litres.toFixed(2)),
                        cost: parseFloat((litres * pricePerLitre).toFixed(2)),
                        date: new Date(Date.now() - (i * 7 * 24 * 60 * 60 * 1000)), // spaced by 7 days
                        createdBy: admin._id
                    });
                }
            }
        });

        await FuelLog.insertMany(fuelLogs);
        console.log(`Seeded ${fuelLogs.length} fuel logs`);

        // Seed Chemicals
        const chemicals = [
            { name: 'Green Liquid', description: 'Heavy duty car wash concentrate', unit: 'Litres', currentStock: 0 },
            { name: 'Glass Cleaner', description: 'Streak-free window cleaner', unit: 'Litres', currentStock: 0 },
            { name: 'Air Freshner', description: 'New Car scent spray', unit: 'Units', currentStock: 0 },
            { name: 'WD-40', description: 'Multipurpose lubricant', unit: 'Cans', currentStock: 0 }
        ];

        const savedChems = await Chemical.insertMany(chemicals);
        console.log(`Seeded ${savedChems.length} chemicals`);

        // Seed Chemical Orders
        const chemOrders = [];
        const locations = ['Airport', 'City', 'Klemzig', 'Salisbury', 'Wingfield', 'Marleston'];
        savedChems.forEach((chem, i) => {
            chemOrders.push({
                chemical: chem._id,
                dealer: dealer._id,
                quantity: 50 + (i * 10),
                cost: 200 + (i * 50),
                date: new Date(Date.now() - (i * 2 * 24 * 60 * 60 * 1000)),
                status: 'delivered',
                paymentStatus: i % 2 === 0 ? 'paid' : 'pending',
                location: locations[i % locations.length]
            });
        });

        await ChemicalOrder.insertMany(chemOrders);
        // Update stock based on orders
        for (const order of chemOrders) {
            await Chemical.findByIdAndUpdate(order.chemical, { $inc: { currentStock: order.quantity } });
        }
        await ChemicalOrder.insertMany(chemOrders);

        // Seed Rentals
        const carsToRent = savedCars.filter(c => c.status === 'available').slice(0, 3);
        const rentals = carsToRent.map((car, i) => ({
            car: car._id,
            customerName: `Customer ${i + 1}`,
            customerPhone: `0400 000 00${i}`,
            destination: ['Airport', 'City', 'Klemzig'][i % 3],
            startDate: new Date(Date.now() - (2 * 24 * 60 * 60 * 1000)),
            plannedEndDate: new Date(Date.now() + (5 * 24 * 60 * 60 * 1000)),
            status: 'active',
            createdBy: admin._id
        }));

        await Rental.insertMany(rentals);

        // Update car statuses for rented cars
        for (const rental of rentals) {
            await Car.findByIdAndUpdate(rental.car, { status: 'rental' });
        }

        console.log(`Seeded ${chemOrders.length} chemical orders`);

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        if (error.errors) {
            Object.keys(error.errors).forEach(key => {
                console.error(`Field ${key}: ${error.errors[key].message}`);
            });
        }
        process.exit(1);
    }
};

seedData();
