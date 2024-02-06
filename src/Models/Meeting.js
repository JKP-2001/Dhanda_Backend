const mongoose = require("mongoose")
import mongoose from "mongoose"
import { MEETING_COMPLETED, MEETING_MISSED, MEETING_PENDING, MEETING_STATUS } from "../Utils/Constants"

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
        {type:mongoose.Schema.Types.ObjectId, default:[], ref:"user"},
    ],
    meeting_link:{
        type:String,
        required:true
    },
    status:{
        type: String,
        enum : [MEETING_COMPLETED,MEETING_MISSED,MEETING_PENDING],
        default: MEETING_PENDING
    }
})

const Meeting = mongoose.model("meeting",meetingSchema)

module.exports = {Meeting}