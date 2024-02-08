const mongoose = require("mongoose")

const replySchema = new mongoose.Schema({
    comment_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"comment"
    },
    creationDateAndTime:{
        type:Date,
        default:Date.now()
    },
    content:{
        type:String,
        required:true
    },
    author_id:{
        type:mongoose.Schema.Types.ObjectId,
        refPath:"refModel"
    },
    refModel:{
        type:String,
        required:true,
        enum:['student','instructor']
    }   
})

const Reply = mongoose.model("reply",replySchema)

module.exports = {Reply}


