const { default: mongoose, mongo } = require("mongoose");

const transactionSchema = new mongoose.Schema(
    {
        confirmTimestamp:{
            type:Date,
            required:true
        },
        amount:{
            type:Number,
            required:true
        },
        sender:{
            type:mongoose.Schema.Types.ObjectId,
            refPath:"refModel"
        },
        receiver:{
            type:mongoose.Schema.Types.ObjectId,
            refPath:"refModel"
        },
        status:{
            type:String, 
            enum:['pending', 'successful', 'failed']
        },
        invoice:{
            type:String
        },
        razorpay_order_id:{
            type:String
        },
        razorpay_payment_id:{
            type:String
        },
        razorpay_signature:{
            type:String
        },
        refModel:{
            type:String,
            required:true,
            enum:['instructor','student']
        }
    }
)

const Transaction = mongoose.model("transaction",transactionSchema)
module.exports = {Transaction}