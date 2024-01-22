require("dotenv").config();


const { User } = require("../../Models/User");

const bcrypt = require("bcryptjs");

const { isValidEmail, isStrongPassword, isValidName, validateUsername, generateOTP } = require("../../helpers/Auth_Helper");
const { encryptToJson, decryptFromJson } = require("../../Utils/EncryptDecrypt");
const { sendMail } = require("../../Utils/SendMail");





const Signup = async (req, res) => {
    try {

        const payload = req.body.payload;

        const DATA = decryptFromJson(payload, process.env.ENCRYPT_KEY);


        const email = DATA.email;
        const password = DATA.password;
        const repassword = DATA.repassword;
        const username = DATA.username;
        const { firstName, middleName, lastName } = DATA;

        const role = DATA.role;

        if (middleName && !isValidName(middleName)) {
            throw new Error("Invalid name");
        }

        if (!isValidName(firstName) || !isValidName(lastName)) {

            throw new Error("Invalid name");
        }

        if (!isValidEmail(email)) {
            throw new Error("Invalid email");
        }

        const isUser = await User.findOne({ email });

        if (isUser) {
            throw new Error("User already exists");
        }


        const isUsername = await User.findOne({ username });

        if (isUsername) {
            throw new Error("Username already exists");
        }

        if (!validateUsername(username)) {
            throw new Error("Invalid username");
        }



        if (!isStrongPassword(password)) {
            throw new Error("Password is not strong enough");
        }

        if (password !== repassword) {
            throw new Error("Passwords do not match");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const otp = generateOTP();

        const newDATA = {
            email,
            password: hashedPassword,
            username,
            firstName,
            middleName,
            lastName,
            role
        }

        const data = {
            main:newDATA,
            otp: otp,
            createdAt: Date.now()
        };

        const encryptedData = encryptToJson(data, process.env.ENCRYPT_KEY);

        

        await sendMail(email, "Verify Email", username,"", otp, "Signup");

    

        res.status(200).json({ success: true, msg: "Email sent successfully to " + email +". Check your inbox." , encryptedData });


    } catch (err) {
        res.status(400).json({ success: false, msg: err.toString() });
    }
}


const verifyEmail = async (req, res) => {

    try {

        const encryptedData = req.body.encryptedData;

        const decryptedData = decryptFromJson(encryptedData, process.env.ENCRYPT_KEY);

        const { main, otp, createdAt} = decryptedData;

        const currentTime = Date.now();

        const timeDiff = currentTime - createdAt;

        if(timeDiff > 5 * 60 * 1000){
            throw new Error("OTP expired");
        }

        const user = await User.findOne({ email: main.email });

        if (user) {
            throw new Error("User already exists.");
        }

        if(otp !== req.body.otp){
            throw new Error("Invalid OTP");
        }


        await User.create(main);

        res.status(200).json({ success: true, msg: "Email verified successfully." });

    }catch(err){

        res.status(400).json({ success: false, msg: err.toString() });
    }
}


const Signin = async (req, res) => {

    try {

        const payload = req.body.payload;

        const DATA = decryptFromJson(payload, process.env.ENCRYPT_KEY);

        const email = DATA.email;

        const password = DATA.password;

        const findUser = await User.findOne({ email });

        if (!findUser) {
            throw new Error("User not found");
        }

        const isMatch = await bcrypt.compare(password, findUser.password);

        if (!isMatch) {
            throw new Error("Incorrect password");
        }

        const user = await User.findOne({ email }).select("-password ");

        const encryptedData = encryptToJson(user, process.env.ENCRYPT_KEY);
        
        const unique_data = {
            email:user.email,
            role:user.role
        }

        const unique = encryptToJson(unique_data, process.env.ENCRYPT_KEY);

        res.status(200).json({ success: true, msg: "Login successful", encryptedData, unique });

    } catch (err) {

        res.status(400).json({ success: false, msg: err.toString() });
    }
}

module.exports = { Signup, verifyEmail, Signin };