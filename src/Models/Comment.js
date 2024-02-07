const mongoose = require("mongoose")

const commentSchema = new mongoose.Schema({
    post_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"post"
    },
    content:{
        type:String,
        required:true
    },
    creationDateAndTime:{
        type:Date,
        default:Date.now()
    },
    replies:[{
        type:mongoose.Schema.Types.ObjectId,
        default:[],
        ref:"reply"
    }],
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

const Comment = mongoose.model("comment",commentSchema)

module.exports =  {Comment}