import mongoose from 'mongoose';

const rentalSchema = new mongoose.Schema({
    car: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car',
        required: true
    },
    customerName: {
        type: String,
        required: true,
        trim: true
    },
    customerPhone: {
        type: String,
        trim: true
    },
    destination: {
        type: String,
        required: true,
        trim: true
    },
    startDate: {
        type: Date,
        default: Date.now,
        required: true
    },
    plannedEndDate: {
        type: Date,
        required: true
    },
    actualReturnDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'cancelled'],
        default: 'active'
    },
    notes: String,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

export default mongoose.model('Rental', rentalSchema);
