const { generateOrderIdController } = require('../../Controllers/Transactions/GenerateOrderIdController')
const { checkUser } = require('../../Middlewares/checkUser')

const transactionsRouter = require('express').Router()

transactionsRouter.post("/generate-order-id", checkUser, generateOrderIdController)

module.exports = {transactionsRouter}