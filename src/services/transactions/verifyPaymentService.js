const { HmacSHA256 } = require("crypto-js");
const { Transaction } = require("../../Models/Transaction");

async function storePaymentInfo(orderId, paymentId, signature){
    
}


async function verifyPaymentInfo(orderId, paymentId, razorpaySignature){
    const transaction = await Transaction.findOne({razorpayOrderId:orderId})
    if (transaction == null) 
        throw new Error(`No transaction with orderId ${orderId} was found in db`)
    const secret = process.env.RAZORPAY_KEY_SECRET 
    const generatedSignature = HmacSHA256(orderId+"|"+paymentId, secret)
    if (generatedSignature == razorpaySignature){
        return true
    }
    else return false
}