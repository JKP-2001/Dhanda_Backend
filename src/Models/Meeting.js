const mongoose = require("mongoose")
const { MEETING_COMPLETED, MEETING_MISSED, MEETING_PENDING, REFUND_COMPLETED, UNDER_REFUND, PAID_TO_DHANDA, PAID_TO_INSTRUCTOR, MEETING_CANCELLED_STUDENT, MEETING_CANCELLED_INSTRUCTOR} = require("../Utils/Constants")

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
    instructorId:{
        type:mongoose.Schema.Types.ObjectId, 
        ref:"instructor",
        required:true
    },
    studentId:{
        type:mongoose.Schema.Types.ObjectId, 
        ref:"student",
        required:true
    },
    meetingLink:{
        type:String,
        required:true
    },
    meetingStatus:{
        type: String,
        enum : [MEETING_COMPLETED ,MEETING_MISSED,MEETING_PENDING, MEETING_CANCELLED_STUDENT, MEETING_CANCELLED_INSTRUCTOR],
        default: MEETING_PENDING
    },
    paymentStatus:{
        type:String,
        enum: [REFUND_COMPLETED, UNDER_REFUND, PAID_TO_DHANDA, PAID_TO_INSTRUCTOR],
        default:PAID_TO_DHANDA
    },
    actualStartTime:{
        type:Date,
    },
    actualEndTime:{
        type:Date,
    },
    studentDhandaPaymentId:{
        type:String,
        required:true
    },
    DhandaInstructorPaymentId:{
        type:String
    },
    Feedback:{
        type:String,
    },
    issuedRaisedByUser:{
        type:String
    }
})

const Meeting = mongoose.model("meeting",meetingSchema)

module.exports = {Meeting}