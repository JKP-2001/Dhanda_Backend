import mongoose from "mongoose"

const educationSchema = new mongoose.Schema({
    author_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    instituteName:{
        type:String,
        required:true
    },
    startDate:{
        type:Date,
        required:true
    },
    endDate:{
        type:Date,
        requried:true
    },
    description:{
        type:String
    },
    degree:{
        type:String,
        required:true
    },
    branch:{
        type:String,
        required:true
    }
})

const Education = mongoose.model("education",educationSchema)

export {Education}