import mongoose from "mongoose"

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

export {Reply}