const mongoose = require('mongoose');
const paymentSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.String,
        ref:'User',
        required:true,
    },
    orderId:{
        type:mongoose.Schema.Types.String,
        ref:'Order',
        required:true,
    },
    amount:{
        type:Number,
        required:true,
    },
    transactionId:{
        unique:true,
        type:String,
        required:true
    },
    paymentDate:{
        type:Date,
        default:Date.now(),
    },
    paymentMethod:{
        type:String,
        required:true,
    },
    status:{
        type:String,
        required:true,
    }
},{timestamps:true}); // Added timestamps for created/updated dates
const paymentModel = mongoose.model('Payment',paymentSchema,"payment_table");
module.exports = paymentModel;