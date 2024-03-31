const { DM } = require("../../Models/DM");
const { Transaction } = require("../../Models/Transaction");


async function createPendingTransaction(obj){
    obj.studentId ??= null
    obj.instructorId ??= null
    const document = await Transaction.create({
        amount:obj.amount,
        sender: 'student',
        senderId:obj.studentId,
        receiverId:obj.instructorId,
        status: 'pending',
        invoice: obj.receipt,
        razorpayOrderId:obj.order,
        razorpayOrderIdTimestamp: Date.now(),
        currency:obj.currency,
    })

    return document._id;
}

async function checkSlotStatus(instructorId, slotId, date){
    /**
     * @TODO
     * 
     */
}

module.exports = {createPendingTransaction, checkSlotStatus}