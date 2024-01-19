import mongoose from "mongoose"

const postSchema = new mongoose.Schema({
    content:{
        type:String,
        required:true,
    },
    likes:[{
        type:mongoose.Schema.Types.ObjectId,
        default:[]
    }],
    share:[{
        type:mongoose.Schema.Types.ObjectId,
        default:[]
    }],
    author:{
        type:mongoose.Schema.Types.ObjectId,
    },
    images:{
        type:String
    },
    comments:[{
        type:mongoose.Schema.Types.ObjectId,
        default:[]
    }],
    createdAt:{
        type:Date,
        default:Date.now
    },
    updateTime:{
        type:Date
    }
})

const Post = mongoose.model("post",postSchema)

export {Post}