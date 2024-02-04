const mongoose = require("mongoose")

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
    }
})

const Education = mongoose.model("education",educationSchema)

module.exports = {Education}