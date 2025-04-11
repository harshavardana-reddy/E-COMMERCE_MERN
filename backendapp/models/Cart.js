const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.SchemaTypes.String,
        ref: 'Product',
        required: true,
        unique: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },
    addedAt: {
        type: Date,
        default: Date.now
    },
    price: {  // Store price at time of adding to cart
        type: Number,
        required: true
    }
});

const cartSchema = new mongoose.Schema({
    userId: {
        type: String,
        ref: 'User',
        required: true,
        unique: true  // One cart per user
    },
    items: [cartItemSchema],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true  // Auto-manage createdAt and updatedAt
});

// Update the updatedAt field before saving
cartSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const cartModel = mongoose.model('Cart', cartSchema, "cart_table");
module.exports = cartModel;