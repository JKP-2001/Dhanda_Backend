const mongoose = require("mongoose")

const fixedSlotSchema = new mongoose.Schema({
    startTime:{
        type:Date,
        reuqired:true
    },
    endTime:{
        type:Date,
        required:true
    },
    day:{
        type:String,
        required:true
    },
    isBooked:{
        type:Boolean,
        default:false
    },
    suspended:{
        type:Boolean,
        default:false
    } 
})

const FixedSlots = mongoose.model("fixedSlots",fixedSlotSchema)

module.exports =  {FixedSlots}