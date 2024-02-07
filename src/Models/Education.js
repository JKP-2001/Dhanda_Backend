const mongoose = require("mongoose")

const educationSchema = new mongoose.Schema({
    author_id:{
        type:mongoose.Schema.Types.ObjectId,
        refPath:"refModel"
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
    onGoing:{
        type:Boolean,
        default:false
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
    },
    refModel:{
        type:String,
        required:true,
        enum:['student','instructor']
    }
})

const Education = mongoose.model("education",educationSchema)

module.exports = {Education}