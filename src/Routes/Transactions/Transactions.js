const { exportTransactionDataToCSV } = require('../../Controllers/Meeting/meetingController')
const { generateOrderIdController } = require('../../Controllers/Transactions/GenerateOrderIdController')
const { refund } = require('../../Controllers/Transactions/refundPaymentController')
const { verifyPaymentController, verifyPaymentControllerForDM } = require('../../Controllers/Transactions/verifyPaymentController')
const { checkUser } = require('../../Middlewares/checkUser')

const transactionsRouter = require('express').Router()

transactionsRouter.post("/generate-order-id", checkUser, generateOrderIdController)

transactionsRouter.post('/verify-payment', verifyPaymentController)

transactionsRouter.post('/verify-payment-dm', verifyPaymentControllerForDM)

transactionsRouter.post('/refund', refund);

transactionsRouter.get('/export', checkUser, exportTransactionDataToCSV);


module.exports = {transactionsRouter}