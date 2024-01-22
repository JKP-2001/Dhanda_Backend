const express = require('express')
const { User } = require('../Models/User')
const router = express.Router()
const {interviewerListController} = require('../Controllers/Interview/InterviewerListController')

router.get('/all',interviewerListController) 




module.exports = router