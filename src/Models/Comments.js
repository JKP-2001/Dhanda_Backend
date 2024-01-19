import mongoose from "mongoose"

const commentSchema = new mongoose.Schema({
    post_id:{
        type:mongoose.Schema.Types.ObjectId
    },
    creationDateAndTime:{
        type:Date
    },
    replies:[{
        type:mongoose.Schema.Types.ObjectId,
        default:[]
    }],
    author_id:{
        type:mongoose.Schema.Types.ObjectId
    }    
})

const Comment = mongoose.model("comment",commentSchema)

export {Comment}