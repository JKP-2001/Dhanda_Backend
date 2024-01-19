import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
    },
    lastName:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        required:true
    },
    meeting_scheduled:[
        {type:mongoose.Schema.Types.ObjectId, default:[]},
    ],
    past_meeting:[
        {type:mongoose.Schema.Types.ObjectId, default:[]},
    ],
    profile_pic:{
        type:String,
        required:true
    },
    education:[{
        type:mongoose.Schema.Types.ObjectId, 
        default:[]
    }],
    experience:[{
        type:mongoose.Schema.Types.ObjectId,
    }],
    bio:{
        type:String,
        default:""
    },
    posts:[
        {type:mongoose.Schema.Types.ObjectId, default:[]},
    ],
    posts_Saved:[
        {type:mongoose.Schema.Types.ObjectId, default:[]},
    ],
    companies:{
        type:String,
        default:""
    },
    profiles:{
        type:String,
        default:""
    },
    followers:[
        {type:mongoose.Schema.Types.ObjectId, default:[]},
    ],
    available_Timeslots:[{
        type:String,
        default:""
    }],
    timeOfCreation:{
        type:Date
    },
    dateOfCreation:{
        type:Date
    },
    feedbacks:[{type:mongoose.Schema.Types.ObjectId, default:[]}]
})

const User = mongoose.model("user",userSchema)

export {User}