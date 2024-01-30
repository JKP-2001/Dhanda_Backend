require("dotenv").config();


const { User } = require("../../Models/User");

const bcrypt = require("bcryptjs");

const { isValidEmail, isStrongPassword, isValidName, validateUsername, generateOTP } = require("../../helpers/Auth_Helper");
const { encryptToJson, decryptFromJson } = require("../../Utils/EncryptDecrypt");
const { sendMail } = require("../../Utils/SendMail");
const { EncryptRes } = require("../../Utils/EncryptRes");





const Signup = async (req, res) => {
    try {
        const DATA = req.body 

        const email = DATA.email;
        const password = DATA.password;
        const repassword = DATA.repassword;
        const username = DATA.username;
        const firstName = DATA.firstName;
        const middleName = DATA.middleName;
        const lastName = DATA.lastName;
        

        const role = DATA.role;
        console.log('The data is ', DATA)

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

        const name = firstName + " " + (middleName?middleName:"") + " " + lastName

        await sendMail(email, "Verify Email", name,"", otp, "Signup");

        const encryptedData = encryptToJson(data)
        const responseData = { success: true, msg: "Email sent successfully to " + email +". Check your inbox." , encryptedData}
        const encryptedResponseData = EncryptRes(responseData)

        res.status(200).json(encryptedResponseData);


    } catch (err) {
        console.error('Error at Signup Controller :', err)
        res.status(400).json(EncryptRes({ success: false, msg: err.toString() }));
    }
}


const verifyEmail = async (req, res) => {

    try {

        const encryptedData = req.body.encryptedData;

        const decryptedData = decryptFromJson(encryptedData, process.env.ENCRYPT_KEY);

        const { main, otp, createdAt} = decryptedData;
        // const {main,otp,createdAt} = req.body

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

        res.status(200).json(EncryptRes({ success: true, msg: "Email verified successfully." }));

    }catch(err){
        console.error('Error in verify Email :', err)
        res.status(400).json(EncryptRes({ success: false, msg: err.toString() }));
    }
}


const Signin = async (req, res) => {

    try {

        // const payload = req.body.payload;

        // const DATA = decryptFromJson(payload, process.env.ENCRYPT_KEY);

        const DATA = req.body

        const email = DATA.email;

        const password = DATA.password;

        const role = DATA.role;

     

        const findUser = await User.findOne({ email });
        
        if (!findUser) {
            throw new Error("User not found");
        }
        
        if(findUser.role!==role){
            throw new Error("Please select the correct role.");
        }


        const isMatch = await bcrypt.compare(password, findUser.password);

        if (!isMatch) {
            throw new Error("Incorrect password");
        }

        const user = await User.findOne({ email }).select("-password ");

        // const encryptedData = encryptToJson(user, process.env.ENCRYPT_KEY);
        
        const unique_data = {
            email:user.email,
            role:user.role,
            createdAt: Date.now()
        }

        // const unique = encryptToJson(unique_data, process.env.ENCRYPT_KEY);

        res.status(200).json(EncryptRes({ success: true, msg: "Login successful", unique_data }));

    } catch (err) {

        res.status(400).json(EncryptRes({ success: false, msg: err.toString() }));
    }
}

const passwordChangeRequest = async (req, res) => {
    try {
        // const payload = req.body.payload;
        // const decryptedData = decryptFromJson(payload, process.env.ENCRYPT_KEY);
        const decryptedData = req.body

        const email = decryptedData.email;
        const user = await User.findOne({ email });

        if (!user) {
            throw new Error("User not found");
        }

        const data = {
            email: email,
            createdAt: Date.now(),
        };

        const encryptedData = encryptToJson(data, process.env.ENCRYPT_KEY);

       
        const dataArray = [...encryptedData].map((char) => encodeURIComponent(char));

       
        const url = `http://localhost:3000/reset-password?key=${dataArray.join('')}`;

        const name = user.firstName + " " + (user.middleName?user.middleName:"") + " " + user.lastName+" "+`(${user.username})`;

        await sendMail(email, "Reset Password", name, url, "", "Change Password");

        await User.updateOne({ email }, { $set: { passwordChangeRequest: true } });

        res.status(200).json(EncryptRes({ success: true, msg: "Email sent successfully to " + email + ". Check your inbox." }));

    } catch (err) {
        res.status(400).json(EncryptRes({ success: false, msg: err.toString() }));
    }
};


const resetPassword = async (req, res) => {

    try{

        // const payload = req.body.payload;
        // const decryptedData = decryptFromJson(payload, process.env.ENCRYPT_KEY);
        const decryptedData = req.body

        const email = decryptedData.email;

        const password = decryptedData.password;

        const user = await User.findOne({ email });
        
        if(!user){
            throw new Error("User not found");
        }

        if(user.passwordChangeRequest===false){
            throw new Error("Link already used.");
        }

        if(!isStrongPassword(password)){
            throw new Error("Password should be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character");
        }

        if(Date.now() - decryptedData.createdAt > 5 * 60 * 1000){
            throw new Error("OTP expired");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.findOneAndUpdate({ email }, { password: hashedPassword, passwordChangeRequest: false });

        res.status(200).json(EncryptRes({ success: true, msg: "Password changed successfully."}));

    }catch(err){

        res.status(400).json(EncryptRes({ success: false, msg: err.toString()}));
    }


}

module.exports = { Signup, verifyEmail, Signin, passwordChangeRequest, resetPassword };