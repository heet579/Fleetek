import mongoose from 'mongoose';

const chemicalSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    description: {
        type: String,
        trim: true
    },
    unit: {
        type: String,
        default: 'Litres',
        trim: true
    },
    currentStock: {
        type: Number,
        default: 0,
        min: 0
    }
}, {
    timestamps: true
});

export default mongoose.model('Chemical', chemicalSchema);
