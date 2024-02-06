const mongoose = require("mongoose")

const repeatingSlots = new mongoose.Schema({
    startDate:{
        type:Date,
        required:true
    },
    startTime:{
        type:Date,
        required:true
    },
    meetEndTime:{
        type:Date,
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