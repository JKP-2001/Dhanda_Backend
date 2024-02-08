const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username:{
        type:String,
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
        type:String,
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
    postLikes:[
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
    interviewsGiven:{
        type:Number,
        validate:{
            validator:Number.isInteger,
            message:'It must be integer'
        },
        default:0
    },

    passwordChangeRequest:{
        type:Boolean,
        default:false
    },

    onBoarding:{
        type:Boolean,
        default:false
    },
    socialLoginId:{
        type:String,
        default:""
    },
    loginProvider:{
        type:String,
        default:""
    },
    role:{
        type:String,
        required:true
    }
})

const Student = mongoose.model("student",userSchema)

module.exports= {Student}