const mongoose = require("mongoose")

const dmSchema = new mongoose.Schema({
    senderId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"student"
    },
    receiverId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"instructor"
    },
    question:{
        type:String
    },
    answer:{
        type:String
    },
    isAnswered:{
        type:Boolean,
        default:false
    },
    creationDateAndTime:{
        type:Date
    },
    transaction_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"transaction"
    },
    answerDateAndTime:{
        type:Date
    },
    seen:{
        type:Boolean,
        default:false
    }
})

const DM = mongoose.model("dm",dmSchema)

module.exports = {DM}
