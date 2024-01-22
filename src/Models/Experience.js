import mongoose from "mongoose"

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
    endDate:{
        type:Date,
        required:true
    },
    description:{
        type:String,
    },
    company:{
        type:String,
        required:true
    }    
})

const Experience = mongoose.model("experience",experienceSchema)

export {Experience}