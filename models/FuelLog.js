import mongoose from 'mongoose';

const fuelLogSchema = new mongoose.Schema({
    car: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car'
    },
    mvaNumber: {
        type: String,
        required: true,
        trim: true,
        maxlength: 8
    },
    rego: {
        type: String,
        required: true,
        trim: true
    },
    kms: {
        type: Number,
        required: true
    },
    litres: {
        type: Number,
        required: true
    },
    cost: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

export default mongoose.model('FuelLog', fuelLogSchema);
