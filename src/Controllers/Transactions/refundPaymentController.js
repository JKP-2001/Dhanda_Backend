const { Transaction } = require("../../Models/Transaction");
const { razorpayInstance } = require("../../configs/ConfigureRazorpay");


const refund = async (req,res)=>{
    try {

        const transactionId = req.body.transactionId;

        const transaction = await Transaction.findById(transactionId);

        if(!transaction){
            throw new Error('Transaction not found')
        }

        if(transaction.status === 'refunded'){
            throw new Error('Payment already refunded')
        }

        if(transaction.status !== 'successful'){
            throw new Error('Payment is not successful')
        }

        const options = {
            "amount": transaction.amount,
            "speed": "optimum",
            "receipt": transaction.invoice,
            "currency": "INR"
          }
        //first validate the payment Id then call razorpay API
        const razorpayResponse = await razorpayInstance.payments.refund(transaction.razorpayPaymentId,options);

        

        await Transaction.findByIdAndUpdate(transactionId,{status:'refunded', refundId:razorpayResponse.id, refundAt:Date.now()});


        //we can store detail in db and send the response
        res.status(200).json({msg:'Payment refunded successfully', razorpayResponse})
    } catch (error) {
        // console.log(error);
        res.status(400).json({error:error.message});
    }     
}

module.exports = {refund}