const mongoose = require('mongoose');
const adminSchema = new mongoose.Schema({
    username:{
        unique:true,
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
})
const adminModel = mongoose.model('Admin',adminSchema,"admin_table");
module.exports = adminModel;