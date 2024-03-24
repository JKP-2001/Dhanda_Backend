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
    studentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"student"
    },
    instructorId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"instructor"
    },
    meeting_link:{
        type:String,
        required:true
    },
    transaction_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"transaction"
    }
})

const Meeting = mongoose.model("meeting",meetingSchema)

module.exports = {Meeting}