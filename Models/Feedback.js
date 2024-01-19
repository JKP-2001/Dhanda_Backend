import mongoose from "mongoose"

const feedbackSchema = new mongoose.Schema({
    comment:{
        type:String,
        required:true
    },
    rating:{
        type:Number,
        required:true
    },
    author_id:{
        type:mongoose.Schema.Types.ObjectId
    },
    receiver:{
        type:mongoose.Schema.Types.ObjectId
    }    
})

const Feedback = mongoose.model("feedback",feedbackSchema)

export {Feedback}