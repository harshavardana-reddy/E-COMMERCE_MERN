const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    productId:{
        unique:true,
        type:String,
        required:true
    },
    productName:{
        type:String,
        required:true
    },
    productPrice:{
        type:Number,
        required:true
    },
    productDescription:{
        type:String,
        required:true
    },
    productCategory:{
        type:String,
        required:true,
        enum:['Electronics','Fashion','Home Appliances','Books']
    },
    productImage:{
        type:String,
        required:true
    },
    productImageType:{
        type:String,
        required:true
    },
    productStatus:{
        type:String,
        required:true,
        default:'Available',
        enum:['Available','Out of Stock']
    },
    sellerId:{
        type:mongoose.Schema.Types.String,
        ref:'Seller',
        required:true,
    }
});



const productModel = mongoose.model('Product',productSchema,"product_table");
module.exports = productModel;