const { Transaction } = require("../../Models/Transaction");


async function createPendingTransaction(obj){
    obj.studentId ??= null
    obj.instructorId ??= null
    const document = new Transaction({
        amount:obj.amount,
        sender: 'student',
        senderId:obj.studentId,
        receiver: 'admin',
        status: 'pending',
        invoice: obj.receipt,
        razorpayOrderId:obj.order,
        razorpayOrderIdTimestamp: obj.createdAt,
        currency:obj.currency,
    })
    await document.save()
}


async function checkSlotStatus(instructorId, slotId, date){
    /**
     * @TODO
     * 
     */
}

module.exports = {createPendingTransaction, checkSlotStatus}