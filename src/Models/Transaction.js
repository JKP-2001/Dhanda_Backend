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
        sender:{
            type:String,
            enum:['instructor', 'student','admin'],
            required:true
        },
        senderId:{
            type:mongoose.Schema.Types.ObjectId,
            validate:{
                validator:function(value){
                    console.log('value in validator is ', value)
                    if (this.sender === 'instructor' || this.sender === 'student')
                        return mongoose.Types.ObjectId.isValid(value)
                    return true
                },
                message: "valid senderId is required for student or instructor sender type"
            }
        },
        receiver:{
            type:String,
            enum:['instructor', 'student','admin'],
            required:true
        },
        receiverId:{
            type:mongoose.Schema.Types.ObjectId,
            validate:{
                validator:function(value){
                    if (this.receiver=== 'instructor' || this.receiver=== 'student')
                        return mongoose.Types.ObjectId.isValid(value)
                    return true
                },
                message: "valid receiverId is required for student or instructor receiver type"
            }
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
            type:String,
            unique:true
        },
        razorpaySignature:{
            type:String
        },
        currency:{
            type:String
        }

    }
)

const Transaction = mongoose.model("transaction",transactionSchema)
module.exports = {Transaction}