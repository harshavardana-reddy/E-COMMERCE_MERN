const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
    orderId: {
        unique: mongoose.Schema.Types.String,
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.String,
        ref: 'User',
        required: true,
    },
    products: [{
        productId: {
            type: mongoose.Schema.Types.String,
            ref: 'Product',
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
        },
        price: {  // Price per unit at time of purchase
            type: Number,
            required: true
        }
    }],
    sellerId: {
        type: mongoose.Schema.Types.String,
        ref: 'Seller',
        required: true,
    },
    totalPrice: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: ['Pending','Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending'
    }
}, { timestamps: true });  // Added timestamps for created/updated dates

const orderModel = mongoose.model('Order', orderSchema, "order_table");
module.exports = orderModel;