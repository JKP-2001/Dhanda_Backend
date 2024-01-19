const mongoose = require('mongoose')

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
        enum:['student','tutor'],
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
    feedbacks:[{type:mongoose.Schema.Types.ObjectId, default:[]}],

    //appears on profile at the bottom of photo
    headline:{
        type:String,
        default:''
    },
    //only for tutor
    rating:{
        type:Number,
        min:0,
        max:5,
        default:0
    },
    //only for tutor
    interviewsTaken:{
        type:Number,
        validate:{
            validator:Number.isInteger,
            message:'It must be integer'
        },
        default:0
    },
    //only for tutor
    price:{
        type:Number,
        default:0
    },
    //only for tutors, in minutes
    interviewDuration:{
        type:Number,
        default:45
    },
    //only for tutors
    category :{
        type:String,
        enum:['sde','dataScience', 'analyst']
    }
})

const User = mongoose.model("user",userSchema)

module.exports= {User}