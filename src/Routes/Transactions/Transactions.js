const { generateOrderIdController } = require('../../Controllers/Transactions/GenerateOrderIdController')
const { verifyPaymentController } = require('../../Controllers/Transactions/verifyPaymentController')
const { checkUser } = require('../../Middlewares/checkUser')

const transactionsRouter = require('express').Router()

transactionsRouter.post("/generate-order-id", checkUser, generateOrderIdController)

transactionsRouter.post('/verify-payment', verifyPaymentController)

module.exports = {transactionsRouter}