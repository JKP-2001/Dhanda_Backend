const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
    },
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
        type:String
    },
    role:{
        type:String,
        enum:['student','instructor'],
        required:true
    },
    meetingScheduled:[
        {type:mongoose.Schema.Types.ObjectId, default:[], ref:"meeting"},
    ],
    pastMeeting:[
        {type:mongoose.Schema.Types.ObjectId, default:[], ref:"meeting"},
    ],
    profilePic:{
        type:String
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
    description:{
        type:String,
        default:""
    },
    posts:[
        {type:mongoose.Schema.Types.ObjectId, default:[], ref:"posts"},
    ],
    postsSaved:[
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
    followings:[
        {type:mongoose.Schema.Types.ObjectId, default:[], ref:"user"},
    ],
    availableTimeslots:[{
        type:String,
        default:""
    }],
    createdAt:{
        type:Date,
        default:Date.now   
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
    },

    passwordChangeRequest:{
        type:Boolean,
        default:false
    },

    onBoarding:{
        type:Boolean,
        default:false
    }
})

const Instructor = mongoose.model("instructor",userSchema)

module.exports= {Instructor}