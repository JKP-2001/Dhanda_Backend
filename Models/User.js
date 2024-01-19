import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
    },
    middleName:{
        type:String,
        default:""
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
        type:String
    },
    meeting_scheduled:[
        {type:mongoose.Schema.Types.ObjectId, default:[], ref:"meeting"},
    ],
    past_meeting:[
        {type:mongoose.Schema.Types.ObjectId, default:[], ref:"meeting"},
    ],
    profile_pic:{
        type:String,
        required:true
    },
    education:[{
        type:mongoose.Schema.Types.ObjectId, 
        default:[],
        ref:"education"
    }],
    experience:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"experience"
    }],
    bio:{
        type:String,
        default:""
    },
    posts:[
        {type:mongoose.Schema.Types.ObjectId, default:[], ref:"posts"},
    ],
    posts_Saved:[
        {type:mongoose.Schema.Types.ObjectId, default:[], ref:"posts"},
    ],
    companies:[{
        type:String,
        default:""
    }],
    profiles:[{
        type:String,
        default:""
    }],
    followers:[
        {type:mongoose.Schema.Types.ObjectId, default:[], ref:"user"},
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
    feedbacks:[{type:mongoose.Schema.Types.ObjectId, default:[], ref:"feedback"}]
})

const User = mongoose.model("user",userSchema)

export {User}