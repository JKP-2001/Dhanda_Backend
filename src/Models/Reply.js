const mongoose = require("mongoose")

const replySchema = new mongoose.Schema({
    comment_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"comment"
    },
    creationDateAndTime:{
        type:Date
    },
    content:{
        type:String,
        required:true
    },
    author_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    }    
})

const Reply = mongoose.model("reply",replySchema)

module.exports = {Reply}


