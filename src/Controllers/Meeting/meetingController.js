const axios = require('axios')
const { jsPDF } = require('jspdf')
const { parse } = require('json2csv');
require('jspdf-autotable')

const { sendMail, sendAttachment } = require('../../Utils/SendMail')
const { Meeting } = require('../../Models/Meeting')
const { Transaction } = require('../../Models/Transaction')
const { getPeople } = require('../../helpers/HelperFunctions')
const Paginator = require('../../helpers/Paginator')
const { convertISOtoTime, convertISOtoDate } = require('../../Utils/Constants')

const ZOOM_ACCOUNT_ID = process.env.ZOOM_ACCOUNT_ID
const ZOOM_CLIENT_ID = process.env.ZOOM_CLIENT_ID
const ZOOM_CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET
const ZOOM_SECRET_TOKEN = process.env.ZOOM_SECRET_TOKEN
const ZOOM_VERIFICATION_TOKEN = process.env.ZOOM_VERIFICATION_TOKEN

const auth_token_url = "https://zoom.us/oauth/token"
const api_base_url = "https://api.zoom.us/v2/users/me/meetings"


const timeZone = 'Asia/Kolkata';


const getAllMeetings = async (meetingIdArray) => {
    try {
        const length = meetingIdArray.length;

        var meetings = [];

        for (let i = 0; i < length; i++) {
            const meeting = await Meeting.findById(meetingIdArray[i]);

            if (meeting) {
                const transaction = await Transaction.findById(meeting.transaction_id);

                if (transaction) {
                    if (transaction.status === 'successful') {
                        meetings.push(meeting);
                    }
                }
            }
        }

        return meetings
    } catch (err) {
        console.log(err)
    }
}


const createMeeting = async (startTime, topic, duration, interviewerName, studentName, studentEmail, hostEmail) => {
    try {

        const token_link = auth_token_url + `?grant_type=account_credentials&account_id=${ZOOM_ACCOUNT_ID}`;

        const encoded = Buffer.from(ZOOM_CLIENT_ID + ':' + ZOOM_CLIENT_SECRET).toString('base64');



        const authResponse = await axios.post(token_link, null, {
            headers: {
                'Authorization': `Basic ${encoded}`,
                'Content-Type': 'application/json'
            }
        })

        if (authResponse.status !== 200) {
            console.log('Unable to get access token');
            return;
        }

        const access_token = authResponse.data.access_token;

        const headers = {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json'
        };

        const payload = {
            topic: topic,
            duration: duration,
            start_time: startTime,
            type: 2,
            timezone: timeZone,
            settings: {
                join_before_host: true,
            },
        };

        const meetingResponse = await axios.post(`${api_base_url}`, payload, { headers });

        if (meetingResponse.status !== 201) {
            console.log('Unable to generate meeting link');
            return;
        }

        const response_data = meetingResponse.data;


        const content = {
            meeting_url: response_data.join_url,
            password: response_data.password,
            meetingTime: response_data.start_time,
            purpose: response_data.topic,
            duration: response_data.duration,
            message: 'Success',
            status: 1,
            id: response_data.id
        };

        // extarct date from meeting time
        // set date to dd-mm-yyyy
        const date = content.meetingTime.split('T')[0].split('-')[2] + '-' + content.meetingTime.split('T')[0].split('-')[1] + '-' + content.meetingTime.split('T')[0].split('-')[0];
        const time = content.meetingTime.split('T')[1].split(':')[0] + ':' + content.meetingTime.split('T')[1].split(':')[1];

        console.log("Sending mail....")
        await sendMail(studentEmail, 'Mock Interview with ' + interviewerName, interviewerName, studentName, date, time, content.meeting_url, "", "", content.password, content.id);

        console.log("Sending mail....")
        await sendMail(hostEmail, 'Mock Interview with ' + studentName, studentName, interviewerName, date, time, content.meeting_url, "", "", content.password, content.id);

        return content
    } catch (error) {
        console.log({ error });
    }
}


const fetchUserMeetings = async (req, res) => {
    try {
        var meetingIdArray = req.body.meetingIdArray;
        // meetingIdArray = JSON.parse(meetingIdArray);
        const meetings = await getAllMeetings(meetingIdArray);

        res.status(200).json({ success: true, data: meetings });
    } catch (err) {

        res.status(400).json({ success: false, msg: err.toString() });
    }
}

const fetchUserTransactions = async (req, res) => {
    try {
        const people = getPeople(req.role);

        const user = await people.findOne({ email: req.userEmail });

        if (!user) {
            throw new Error("User not found");
        }

        const meetingScheduledIds = user.meetingScheduled;

        // console.log({ meetingScheduledIds });

        // below code doesnt fetching all ids present in the array


        const month = req.query.month ? parseInt(req.query.month) : new Date().getMonth();

        // console.log({ month });

        const page = (req.query.page) ? parseInt(req.query.page) : 1
        const limit = (req.query.limit) ? parseInt(req.query.limit) : 10;


        let totalResult = 0;


        const monthStartDate = new Date(new Date().getFullYear(), month, 1);
        const monthEndDate = new Date(new Date().getFullYear(), month + 1, 2);

        if (page === 1) {
            const tempdata = await Meeting.find({
                _id: { $in: meetingScheduledIds },
            })
                .populate({
                    path: "transaction_id",
                    select: "confirmTimestamp",
                })

            const dataFiltered = tempdata.filter(meeting => {
                const meetingDate = new Date(meeting.transaction_id.confirmTimestamp);
                return meetingDate >= monthStartDate && meetingDate <= monthEndDate;
            });


            totalResult = dataFiltered.length;

        }


        const data = await Meeting.find({
            _id: { $in: meetingScheduledIds },
        })
            .select("transaction_id title calendarEvent")
            .populate({
                path: "transaction_id",
                select: "_id status amount senderId invoice razorpayOrderId razorpayPaymentId refundId refundAt confirmTimestamp paymentDoneToReceiver",
                options: { sort: { "confirmTimestamp": -1 } }
            })
            .populate({ path: "studentId", select: "firstName middleName lastName email _id" })
            .populate({ path: "instructorId", select: "firstName middleName lastName email _id" })
            .skip((page - 1) * limit)
            .limit(limit);
        // extract meeting where confirmTimestamp is in between monthStartDate and monthEndDate

        const dataFiltered = data.filter(meeting => {
            const meetingDate = new Date(meeting.transaction_id.confirmTimestamp);
            return meetingDate >= monthStartDate && meetingDate <= monthEndDate;
        })



        res.status(200).json({ success: true, data: dataFiltered, totalResult });

    } catch (err) {
        res.status(400).json({ success: false, msg: err.toString() });
    }
}


const usersMeetings = async (req, res) => {
    try {
        const people = getPeople(req.role);

        const user = await people.findOne({ email: req.userEmail });

        if (!user) {
            throw new Error("User not found");
        }

        const meetingScheduledIds = user.meetingScheduled;

        const type = req.query.type ? req.query.type : 'upcoming';

        const page = req.query.page ? req.query.page : 1

        const limit = req.query.limit ? parseInt(req.query.limit) : allPosts.length;

        const rdata = await Meeting.find({ _id: { $in: meetingScheduledIds } });



        let data;
        let totalResult;

        if (type === 'upcoming') {
            data = await Meeting.find(
                {
                    _id: { $in: meetingScheduledIds },
                    "calendarEvent.start": {
                        $gt: new Date()
                    }
                })

                .populate({
                    path: "transaction_id",
                    select: "_id status amount senderId invoice razorpayOrderId razorpayPaymentId refundId refundAt confirmTimestamp paymentDoneToReceiver",
                    options: { sort: { "confirmTimestamp": -1 } } // Sort by confirmTimestamp in descending order
                })
                .populate({ path: "studentId", select: "firstName middleName lastName email _id" })
                .populate({ path: "instructorId", select: "firstName middleName lastName email _id" })
                .limit(parseInt(limit))
                .skip((parseInt(page) - 1) * limit)

            //reverse the data



            // const x = await Meeting.

            const temp = await Meeting.find(
                {
                    _id: { $in: meetingScheduledIds },
                    "calendarEvent.start": {
                        $gt: new Date()
                    }
                })

            totalResult = temp.length

            // const sortedData = data.sort((a, b) => new Date(b.transaction_id.confirmTimestamp) - new Date(a.transaction_id.confirmTimestamp));
        }

        else {
            data = await Meeting.find(
                {
                    _id: { $in: meetingScheduledIds },
                    "calendarEvent.start": {
                        $lt: new Date()
                    }
                })
                .populate({
                    path: "transaction_id",
                    select: "_id status amount senderId invoice razorpayOrderId razorpayPaymentId refundId refundAt confirmTimestamp paymentDoneToReceiver",
                    options: { sort: { "confirmTimestamp": -1 } } // Sort by confirmTimestamp in descending order
                })
                .populate({ path: "studentId", select: "firstName middleName lastName email _id" })
                .populate({ path: "instructorId", select: "firstName middleName lastName email _id" })
                .limit(parseInt(limit))
                .skip((parseInt(page) - 1) * limit)

            const temp = await Meeting.find(
                {
                    _id: { $in: meetingScheduledIds },
                    "calendarEvent.start": {
                        $lt: new Date()
                    }
                }
            )

            data = data.reverse();

            totalResult = temp.length;

        }



        res.status(200).json({ success: true, data: data, totalResult });

    } catch (err) {
        res.status(400).json({ success: false, msg: err.toString() });
    }
}


const exportTransactionDataToCSV = async (req, res) => {

    try {

        const people = getPeople(req.role);

        const user = await people.findOne({ email: req.userEmail });

        if (!user) {
            throw new Error("User not found");
        }



        const tillMonth = req.query.month ? parseInt(req.query.month) : 1;


        const month = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const currentDate = new Date().getDate();

        // Create a new date by subtracting 'tillMonth' months from the current date
        const targetDate = new Date(currentYear, month - tillMonth, currentDate);

        var data;

        if (user.role === 'instructor') {
            data = await Transaction.find({
                receiverId: user._id,
            }).populate({
                path: "senderId",
                select: "firstName middleName lastName email _id",
            })
                .populate({ path: "receiverId", select: "firstName middleName lastName email _id" })


        }

        else {
            data = await Transaction.find({
                senderId: user._id,
            }).populate({
                path: "senderId",
                select: "firstName middleName lastName email _id",
            })
                .populate({ path: "receiverId", select: "firstName middleName lastName email _id" })

        }

        const doc = new jsPDF();

        // Set font style
        doc.setFont('helvetica');

        // Add content to the PDF
        doc.setFontSize(12);
        doc.text('Transaction Data', 10, 10);
        doc.setFontSize(10);
        const headers = ['Invoice_Number','Sender_ID', 'Receiver_ID', 'Amount', 'Currency', 'Payment_ID', 'Date', 'Time'];
        const jsonData = data.map(transaction => ({
            Invoice: transaction.invoice?transaction.invoice:"Not Found",
            Sender: transaction.senderId?transaction.senderId._id?transaction.senderId._id:"Not Found":"Not Found",
            Receiver: transaction.receiverId?transaction.receiverId._id?transaction.receiverId._id:"Not Found":"Not Found",
            Amount: transaction.amount?parseInt(transaction.amount)/100:"Not Found",
            Currency: 'INR',
            PaymentID: transaction.razorpayPaymentId?transaction.razorpayPaymentId:"Not Found",
            Date: transaction.confirmTimestamp?convertISOtoDate(transaction.confirmTimestamp):"Not Found",
            Time: transaction.confirmTimestamp?convertISOtoTime(transaction.confirmTimestamp):"Not Found"
        }));

        // Build the table
        

        const opts = { headers };
        const csv = parse(jsonData, opts);

        // Generate PDF as data URI
        // const pdfDataURI = doc.output('datauristring');

        res.status(200).json({ success:true, msg: "Alright! We'll share the file over email in next few minutes" });
        // Finalize the PDF
        console.log("sending....");
        await sendAttachment(user.email, csv, user._id, user.email, user.role);
        console.log("sent....");



    } catch (err) {
        res.status(400).json({ success: false, msg: err.toString() });
    }
}


module.exports = { createMeeting, fetchUserMeetings, fetchUserTransactions, usersMeetings, exportTransactionDataToCSV };



