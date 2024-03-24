const crypto = require('crypto')

function validateVerifyPayment(parameters) {
    // const required = ['orderId', 'checkoutId', 'signature']
    // required.forEach((parameter, idx)=>{
    //     if (!parameters.hasOwnProperty(parameter)){
    //         throw new Error(`parameter ${parameter} is missing in request body`)
    //     }

    // })

    const orderId = parameters.orderId
    const paymentId = parameters.paymentId
    const signature = parameters.signature

    if (!orderId || !paymentId || !signature) {
        throw new Error('orderId, paymentId, signature are required in request body')
    }

    if (typeof orderId !== 'string' || typeof paymentId !== 'string' || typeof signature !== 'string') {
        throw new Error('orderId, paymentId, signature should be of type string')
    }

    if (orderId.length === 0 || paymentId.length === 0 || signature.length === 0) {
        throw new Error('orderId, paymentId, signature should not be empty')
    }

    const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET

    const hmac = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET);

    hmac.update(orderId + "|" + paymentId);
    let generatedSignature = hmac.digest('hex');

    let isSignatureValid = generatedSignature == signature;

    if (!isSignatureValid) {
        throw new Error('Invalid signature')
    }

    else{
        return true
    }


}

module.exports = { validateVerifyPayment }