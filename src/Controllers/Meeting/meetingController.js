const axios = require('axios')
const { sendMail } = require('../../Utils/SendMail')

const ZOOM_ACCOUNT_ID = process.env.ZOOM_ACCOUNT_ID
const ZOOM_CLIENT_ID = process.env.ZOOM_CLIENT_ID
const ZOOM_CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET
const ZOOM_SECRET_TOKEN = process.env.ZOOM_SECRET_TOKEN
const ZOOM_VERIFICATION_TOKEN = process.env.ZOOM_VERIFICATION_TOKEN

const auth_token_url = "https://zoom.us/oauth/token"
const api_base_url = "https://api.zoom.us/v2/users/me/meetings"


const timeZone = 'Asia/Kolkata';


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
        await sendMail(studentEmail, 'Mock Interview with '+ interviewerName, interviewerName, studentName,   date, time, content.meeting_url, "", "", content.password, content.id);

        console.log("Sending mail....")
        await sendMail(hostEmail, 'Mock Interview with '+ studentName,  studentName, interviewerName, date, time, content.meeting_url, "", "", content.password, content.id);

        return content
    } catch (error) {
        console.log({ error });
    }
}


module.exports = { createMeeting }



