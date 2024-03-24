const mongoose = require("mongoose")

const meetingSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    startTime:{
        type:Date,
        reuqired:true
    },
    duration:{
        type:String,
        required:true
    },
    participant:[
        {type:mongoose.Schema.Types.ObjectId, default:[], refPath:"refModel"},
    ],
    meeting_link:{
        type:String,
        required:true
    },
    refModel:{
        type:String,
        required:true,
        enum:['student','instructor']
    },
    transaction_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"transaction"
    }
})

const Meeting = mongoose.model("meeting",meetingSchema)

module.exports = {Meeting}