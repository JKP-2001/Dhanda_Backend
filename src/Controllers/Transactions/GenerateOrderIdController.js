const { razorpayInstance } = require("../../configs/ConfigureRazorpay")
const logger = require("../../helpers/Logger")
const { createPendingTransaction, checkSlotStatus } = require("../../services/transactions/generateOrderIdServices")
const { validateGenerateOrderId } = require("../../validations/Transactions/ValidateGenerateOrderId")

/**
* @openapi
* tags:
*   - name: Transactions
*     description: All APIs related to transactions
* /api/v1/transactions/generate-order-id:
*   post:
*     summary: Generate order ID for initiating Razorpay checkout
*     description: |
*       The default student (llakshya63@gmail.com) and instructor p.jitendra6957@gmail.com
*     tags:
*       - Transactions
*     parameters:
*       - in: header
*         name: security-key
*         default: dhanda
*       - in: header
*         name: auth-token
*         default: U2FsdGVkX1/mzTZNNFNWeuhqyaQBWqb/vfyGB22chAu8ps/vrSuhtNG8okKVEDQGol0OidVsFyRMKi7rBegNEcEvuJ5HO0ca+aSQn+lwDX/m5RURlF8xvfQHFcx8zB5tYLysGEGEG5JGSIthgDCUhQ==
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               amount:
*                 type: integer
*                 default: 0
*               currency:
*                 type: string
*                 default: INR
*               studentId:
*                 type: string
*                 default: 65c35606a2e6aabf70ae72f2
*               instructorId:
*                 type: string
*                 default: 65c26ad62b6203aca3381d16
*               
*               
*             required:
*               - amount
*               - currency
*               - studentId
*               - instructorId
*     responses:
*       '200':
*         description: Successful, run to see return data type. In case of production, data would be encrypted
*       '400':
*         description: Some error
* 
* 
 */



async function generateOrderIdController(req,res){
    try {
        validateGenerateOrderId(req.body)
        const options = {
            amount: req.body.amount,
            currency:req.body.currency,
            // receipt:req.body.receipt
        }
        const order = await razorpayInstance.orders.create(options)
        console.log('order is ', order)
        const instructorId= req.body.instructorId
        const studentId = req.body.studentId

        await createPendingTransaction({...options,order:order.id, createdAt:order.created_at,studentId})
        await checkSlotStatus()
        const data = {
            orderId: order.id
        }
        let result = {success:true,data}
        res.status(200).json(result)
    }
    catch(e){
        logger('Error at GenerateOrderIdController :', e)
        res.status(400).json({success:false, msg:e})
    }
}

module.exports = {generateOrderIdController}

