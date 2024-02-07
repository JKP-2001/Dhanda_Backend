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
    endTime:{
        type:Date,
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
    }
})

const Meeting = mongoose.model("meeting",meetingSchema)

module.exports = {Meeting}