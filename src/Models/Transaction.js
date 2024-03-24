const { default: mongoose } = require("mongoose");

const transactionSchema = new mongoose.Schema(
    {
        confirmTimestamp:{
            type:Date
        },
        amount:{
            type:Number,
            required:true
        },
        senderId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'student'
        },
        receiverId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"instructor"
        },
        status:{
            type:String, 
            enum:['pending', 'successful', 'failed']
        },
        invoice:{
            type:String
        },
        razorpayOrderId:{
            type:String,
            unique:true
        },
        razorpayOrderIdTimestamp:{
            type:Date
        },
        razorpayPaymentId:{
            type:String
        },
        razorpaySignature:{
            type:String
        },
        currency:{
            type:String
        },
        paymentDoneToReceiver:{
            type:Boolean,
            default:false
        }
    }
)

const Transaction = mongoose.model("transaction",transactionSchema)
module.exports = {Transaction}