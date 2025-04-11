const mongoose = require('mongoose');
const imageData = require('./images');
const sellerSchema = new mongoose.Schema({
    sellerId:{
        unique:true,
        type:String,
        required:true
    },
    sellerName:{
        type:String,
        required:true
    },
    sellerEmail:{
        type:String,
        required:true
    },
    sellerPhone:{
        type:String,
        required:true
    },
    sellerAddress:{
        type:String,
        required:true
    },
    sellerCity:{
        type:String,
        required:true
    },
    sellerState:{
        type:String,
        required:true
    },
    sellerCountry:{
        type:String,
        required:true
    },
    status:{
        type:String,
        required:true,
        default:"Active",
        enum:["Active","Inactive"]
    },
    password:{
        type:String,
        required:true,
        default:"amz8787"
    }
});
const sellerModel = mongoose.model('Seller',sellerSchema,"seller_table");
module.exports = sellerModel;