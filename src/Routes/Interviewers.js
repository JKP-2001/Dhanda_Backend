const express = require('express')
const { User } = require('../Models/User')
const router = express.Router()
const {interviewerListController} = require('../Controllers/Interview/InterviewerListController')
const InterviewerProfileController = require('../Controllers/Interview/InterviewerProfileController')

router.get('/all',interviewerListController) 

router.get('/',InterviewerProfileController)


module.exports = router