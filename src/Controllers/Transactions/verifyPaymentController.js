const { validateVerifyPayment } = require("../../validations/Transactions/validateVerifyPayment")

async function verifyPaymentController(req,res){
    try{
        validateVerifyPayment(req.body)
        
    }
    catch(e){
        console.log('Error at verifyPaymentController ', e)
        res.status(400).json({success:false,msg:e.toString()})
    }
}


module.exports = {verifyPaymentController}