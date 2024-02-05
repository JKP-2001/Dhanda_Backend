const mongoose = require("mongoose")

const postSchema = new mongoose.Schema({
    content:{
        type:String,
    },
    likes:[{
        type:mongoose.Schema.Types.ObjectId,
        default:[],
        ref:"user"
    }],
    share:[{
        type:mongoose.Schema.Types.ObjectId,
        default:[],
        ref:"post"
    }],
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    images:[{
        type:String
    }],
    comments:[{
        type:mongoose.Schema.Types.ObjectId,
        default:[],
        ref:"comment"
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

module.exports = {Post}