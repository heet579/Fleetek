import mongoose from 'mongoose';

const chemicalOrderSchema = new mongoose.Schema({
    chemical: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chemical',
        required: true
    },
    dealer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 0
    },
    cost: {
        type: Number,
        required: true,
        min: 0
    },
    date: {
        type: Date,
        default: Date.now
    },
    receiptImage: {
        type: String // Path to uploaded receipt
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid'],
        default: 'pending'
    },
    location: {
        type: String,
        enum: ['Airport', 'City', 'Klemzig', 'Salisbury', 'Wingfield', 'Marleston'],
        required: true
    },
    status: {
        type: String,
        enum: ['delivered', 'pending', 'cancelled'],
        default: 'delivered'
    }
}, {
    timestamps: true
});

export default mongoose.model('ChemicalOrder', chemicalOrderSchema);
