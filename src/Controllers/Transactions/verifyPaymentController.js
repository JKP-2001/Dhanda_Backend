const { Transaction } = require("../../Models/Transaction");
const { Instructor } = require("../../Models/peoples/Instructor");
const { Student } = require("../../Models/peoples/Student");
const { validateVerifyPayment } = require("../../validations/Transactions/validateVerifyPayment");
const { createMeeting } = require("../Meeting/meetingController");

async function verifyPaymentController(req,res){
    try{
        
        const isSuccess = validateVerifyPayment(req.body.orderDetails)
        if(isSuccess){

            const transactionId = req.body.orderDetails.transactionId;

            const transaction = await Transaction.findById(transactionId);

            if(!transaction){
                throw new Error('Transaction not found')
            }

            if(transaction.status === 'successful'){
                throw new Error('Payment already verified')
            }

            if(transaction.status === 'failed'){
                throw new Error('Payment failed')
            }

            console.log({transaction});

            const student = await Student.findById(transaction.senderId);
            const instructor = await Instructor.findById(transaction.receiverId);

            if(!student){
                throw new Error('Student not found')
            }

            if(!instructor){
                throw new Error('Instructor not found')
            }


            console.log("Creating meeting.........");

            const meeting = await createMeeting(req.body.startTime, req.body.topic, req.body.duration, instructor.firstName+" "+instructor.lastName, student.firstName+" "+student.lastName, student.email, instructor.email);

            console.log("Meeting created.........", meeting);
            
            await Transaction.findByIdAndUpdate(transactionId,{
                status:'successful',
                confirmTimestamp:Date.now(),
                razorpayOrderId:req.body.orderDetails.orderId,
                razorpayPaymentId:req.body.orderDetails.paymentId,
                razorpaySignature:req.body.orderDetails.signature,
                senderId:transaction.senderId,
                receiverId:transaction.receiverId
            })

            res.status(200).json({success:true, msg:'Payment verified successfully', meeting:meeting})
        }
    }
    catch(e){
        console.log('Error at verifyPaymentController ', e)
        res.status(400).json({success:false,msg:e.toString()})
    }
}


module.exports = {verifyPaymentController}