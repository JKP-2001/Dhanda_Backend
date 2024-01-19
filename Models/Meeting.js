import mongoose from "mongoose"

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
        {type:mongoose.Schema.Types.ObjectId, default:[]},
    ],
    meeting_link:{
        type:String,
        required:true
    }
})

const Meeting = mongoose.model("meeting",meetingSchema)

export {Meeting}