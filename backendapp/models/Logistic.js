const mongoose = require('mongoose')

const logisticSchema = new mongoose.Schema({
    orderId:{
        type:mongoose.SchemaTypes.String,
        ref:'Order',
        required:true
    },
    logisticName:{
        type:String,
        enum:["DTDC","DELHIVERY","BLUE-DART"],
        required:true
    },
    logisticStatus:{
        type:String,
        enum:["Shipped","Delivered","Cancelled"],
        required:true,
        default:"Shipped"
    },
    trackingNumber:{
        type:String,
        required:true,
    }
})
const logisticModel = mongoose.model('Logistic',logisticSchema,"logistic_table");
module.exports = logisticModel