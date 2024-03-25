
const express = require('express')
const { createMeeting, fetchUserMeetings } = require('../../Controllers/Meeting/meetingController')

const meetingRouter = express.Router()

// meetingRouter.post("/create-meeting",createMeeting);

meetingRouter.post('/meetings', fetchUserMeetings);

module.exports = meetingRouter



