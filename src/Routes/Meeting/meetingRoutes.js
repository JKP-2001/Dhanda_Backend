
const express = require('express')
const { createMeeting } = require('../../Controllers/Meeting/meetingController')

const meetingRouter = express.Router()

meetingRouter.post("/create-meeting",createMeeting);

module.exports = meetingRouter



