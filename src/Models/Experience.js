const mongoose = require("mongoose");

const experienceSchema = new mongoose.Schema({
    author_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
    },
    role:{
        type:"String",
        required:true
    },
    startDate:{
        type:Date,
        reuqired:true
    },
    onGoing:{
        type:Boolean,
        default:false
    },
    
    endDate:{
        type:Date,
        default:Date.now()
    },
    description:{
        type:String,
    },
    company:{
        type:String,
        required:true
    },
    
    createdAt:{
        type:Date,
        default:Date.now()
    }
})

const Experience = mongoose.model("experience",experienceSchema)

module.exports = {Experience}