const mongoose = require("mongoose")

const comment = require("./Comment")

const reply = require("./Reply");

const feedback = require("./Feedback");


const postSchema = new mongoose.Schema({
    content:{
        type:String,
    },
    likes:[{
        type:mongoose.Schema.Types.ObjectId,
        default:[],
        refPath:"refModel"
    }],
    bookmarks:[{
        type:mongoose.Schema.Types.ObjectId,
        default:[],
        refPath:"refModel"
    }],
    share:[{
        type:mongoose.Schema.Types.ObjectId,
        default:[],
        refPath:"refModel"
    }],
    author:{
        type:mongoose.Schema.Types.ObjectId,
        refPath:"refModel"
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
    },
    refModel:{
        type:String,
        required:true,
        enum:['student','instructor']
    }
})

const Post = mongoose.model("post",postSchema)

module.exports = {Post}