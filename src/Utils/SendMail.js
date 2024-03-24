require("dotenv").config();

const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs");

const path = require("path");




/**
 * Get the current date and time in ISO format
 * @returns {string} - The current date and time in ISO format
 */
function getCurrentDate() {
    const date = new Date();
    return date.toISOString();
}


const transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com", // hostname
    secureConnection: false, // TLS requires secureConnection to be false
    port: 587, // port for secure SMTP
    tls: {
        ciphers: 'SSLv3',
    },
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});

const sendMail = async (receiver, subject, username, studentName="", date="", time="", link = "", otp = "", type = "", meetPass = "") => {


    try {

        var filePath;

        

        let replacements;

        

        if (otp !== "") {
            filePath = path.join(__dirname, "../Emails_Template/otp.html");

            replacements = {
                username: username,
                otp: otp,
                type: type
            };
        }

        else if (link !== "" && studentName=="") {
            filePath = path.join(__dirname, "../Emails_Template/verify.html");
            replacements = {
                name: username,
                link: link
            };
        }

        else{
            filePath = path.join(__dirname, "../Emails_Template/meeting_confirmation.html");
            replacements = {
                name: username,
                studentName: studentName,
                date: date,
                time: time,
                link: link,
                pass:meetPass
            };
        }

        const source = fs.readFileSync(filePath, "utf-8").toString();
        const template = handlebars.compile(source);

        const htmlToSend = template(replacements);

        const mailOptions = {
            from: process.env.EMAIL,
            to: receiver,
            subject: subject,
            html: htmlToSend
        }

        const success = await transporter.sendMail(mailOptions);

        if(success){
            console.log("Email sent successfully to " + receiver + "!");
            return true;
        }

        return false;

    } catch (e) {
        console.log("sendEmail error: ", e.toString());
    }

}

module.exports = { sendMail, getCurrentDate }