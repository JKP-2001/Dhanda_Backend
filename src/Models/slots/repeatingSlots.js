const mongoose = require("mongoose")

const repeatingSlots = new mongoose.Schema({
    startTime:{
        type:Date,
        required:true
    },
    endTime:{
        type:Date,
        required:true
    },
    day:{
        type:String,
        required:true
    },
    bookings:[{
        type:Date,
        default:[],
    }],
    suspended:[{
        type:Date,
        default:[]
    }]
})

const RepeatingSlots = mongoose.model("repeatingSlots",repeatingSlots)

module.exports =  {RepeatingSlots}