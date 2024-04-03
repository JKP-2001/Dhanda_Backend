const { DM } = require("../../Models/DM");
const { Meeting } = require("../../Models/Meeting");
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

            const meeting = await createMeeting(req.body.orderDetails.startTime, req.body.orderDetails.topic, req.body.orderDetails.duration, instructor.firstName+" "+instructor.lastName, student.firstName+" "+student.lastName, student.email, instructor.email);

            console.log("Meeting created.........", meeting);
            
            await Transaction.findByIdAndUpdate(transactionId,{
                status:'successful',
                confirmTimestamp:Date.now(),
                razorpayOrderId:req.body.orderDetails.orderId,
                razorpayPaymentId:req.body.orderDetails.paymentId,
                razorpaySignature:req.body.orderDetails.signature,
                senderId:transaction.senderId,
                receiverId:transaction.receiverId,
                paymentMode:req.body.orderDetails.paymentMethod
            })


            const createNewMeeting = await Meeting.create({
                title: req.body.orderDetails.topic,
                startTime: req.body.orderDetails.startTime,
                duration: req.body.orderDetails.duration,
                studentId: student._id,
                instructorId: instructor._id,
                meeting_link: meeting.meeting_url,
                transaction_id: transactionId,
                calendarEvent:req.body.orderDetails.newEvent
            })

            await Student.findOneAndUpdate({ _id: student._id }, { $push: { meetingScheduled: createNewMeeting._id } });
            await Instructor.findOneAndUpdate({ _id: instructor._id }, { $push: { meetingScheduled: createNewMeeting._id } });



            res.status(200).json({success:true, msg:'Payment verified successfully', meeting:meeting})
        }
    }
    catch(e){
        console.log('Error at verifyPaymentController ', e)
        res.status(400).json({success:false,msg:e.toString()})
    }
}


async function verifyPaymentControllerForDM(req,res){
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


            console.log("Sending DM.........");

            
            await Transaction.findByIdAndUpdate(transactionId,{
                status:'successful',
                confirmTimestamp:Date.now(),
                razorpayOrderId:req.body.orderDetails.orderId,
                razorpayPaymentId:req.body.orderDetails.paymentId,
                razorpaySignature:req.body.orderDetails.signature,
                senderId:transaction.senderId,
                receiverId:transaction.receiverId,
                paymentMode:req.body.orderDetails.paymentMethod
            })

            
            const newDM = await DM.create({
                senderId:student._id,
                receiverId:instructor._id,
                question:req.body.orderDetails.question,
                transaction_id:transactionId,
                creationDateAndTime:Date.now()
            })

            console.log("DM sent");


            await Student.findOneAndUpdate({ _id: student._id }, { $push: {dms: newDM._id } });
            await Instructor.findOneAndUpdate({ _id: instructor._id }, { $push: {dms: newDM._id} });



            res.status(200).json({success:true, msg:'Payment verified successfully', dm:newDM})
        }
    }
    catch(e){
        console.log('Error at verifyPaymentController ', e)
        res.status(400).json({success:false,msg:e.toString()})
    }
}


module.exports = {verifyPaymentController, verifyPaymentControllerForDM}