import mongoose from "mongoose"

const commentSchema = new mongoose.Schema({
    post_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"post"
    },
    creationDateAndTime:{
        type:Date
    },
    replies:[{
        type:mongoose.Schema.Types.ObjectId,
        default:[],
        ref:"reply"
    }],
    author_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    }    
})

const Comment = mongoose.model("comment",commentSchema)

export {Comment}