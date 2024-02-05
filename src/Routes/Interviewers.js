const express = require('express')
const { User } = require('../Models/peoples/Interviewer')
const router = express.Router()
const {interviewerListController} = require('../Controllers/Interview/InterviewerListController')
const InterviewerProfileController = require('../Controllers/Interview/InterviewerProfileController')

router.get('/all',interviewerListController) 

router.get('/',InterviewerProfileController)

// router.post('/',function(req,res,next){

//     console.log('The query is ', req.query)
//     console.log('Body is ', req.body)
//     res.send('hi')
//     next()
// })


module.exports = router