
const express = require('express')
const { createMeeting, fetchUserMeetings, fetchUserTransactions, usersMeetings, exportTransactionDataToCSV } = require('../../Controllers/Meeting/meetingController');
const { checkUser } = require('../../Middlewares/checkUser');

const meetingRouter = express.Router()

// meetingRouter.post("/create-meeting",createMeeting);

meetingRouter.post('/meetings', fetchUserMeetings);
meetingRouter.get('/transactions', checkUser, fetchUserTransactions);
meetingRouter.get('/meetings', checkUser, usersMeetings);


module.exports = meetingRouter



