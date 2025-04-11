const mongoose = require('mongoose');
const imageData = require('./images');
const userSchema = new mongoose.Schema({
    userId:{
        unique:true,
        type:String,
        required:true
    },
    userName:{
        type:String,
        required:true
    },
    userEmail:{
        type:String,
        required:true
    },
    userPhone:{
        type:String,
        required:true
    },
    userGender:{
        type:String,
        required:true,
        enum:["Male","Female","Other"]
    },
    userAddress:{
        type:String,
        required:true
    },
    userCity:{
        type:String,
        required:true
    },
    userState:{
        type:String,
        required:true
    },
    userCountry:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true,
    },
    userImage:{
        type:String,
        required:true,
        default:imageData.defaultImage
    }
});
const userModel = mongoose.model('User',userSchema,"user_table");
module.exports = userModel;