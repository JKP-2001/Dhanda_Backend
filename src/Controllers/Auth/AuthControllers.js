require("dotenv").config();

const bcrypt = require("bcryptjs");
const { isValidEmail, isStrongPassword, isValidName, validateUsername, generateOTP } = require("../../helpers/Auth_Helper");
const { encryptToJson, decryptFromJson } = require("../../Utils/EncryptDecrypt");
const { sendMail } = require("../../Utils/SendMail");
const { EncryptRes } = require("../../Utils/EncryptRes");
const { getPeople } = require("../../helpers/HelperFunctions");
const { Student } = require("../../Models/peoples/Student");
const { Instructor } = require("../../Models/peoples/Instructor");


const FRONT_END_URL = process.env.FRONT_END_URL


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
 

        if (middleName && !isValidName(middleName)) {
            throw new Error("Invalid name");
        }

        if (!isValidName(firstName) || !isValidName(lastName)) {

            throw new Error("Invalid name");
        }

        if (!isValidEmail(email)) {
            throw new Error("Invalid email");
        }

        const people = getPeople(role)
        const isUser = await people.findOne({ email });

        if (isUser) {
            throw new Error("User already exists");
        }


        const isUsername = await people.findOne({ username });

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


        const currentTime = Date.now();

        const timeDiff = currentTime - createdAt;

        if(timeDiff > 5 * 60 * 1000){
            throw new Error("OTP expired");
        }

        const people = getPeople(main.role)

        const user = await people.findOne({ email: main.email });

        if (user) {
            throw new Error("User already exists.");
        }

        if(otp !== req.body.otp){
            throw new Error("Invalid OTP");
        }

        await people.create(main);

        res.status(200).json(EncryptRes({ success: true, msg: "Email verified successfully." }));

    }catch(err){
        console.error('Error in verify Email :', err)
        res.status(400).json(EncryptRes({ success: false, msg: err.toString() }));
    }
}











const Signin = async (req, res) => {

    try {

       

        const DATA = req.body
    
        const email = DATA.email;

        const password = DATA.password;

        const role = DATA.role;

        console.log({DATA});

        const people = getPeople(role)

        const findUser = await people.findOne({ email });
        
        if (!findUser) {
            throw new Error("User not found");
        }
        
        // if(findUser.role!==role){
        //     throw new Error("Please select the correct role.");
        // }


        const isMatch = await bcrypt.compare(password, findUser.password);

        if (!isMatch) {
            throw new Error("Incorrect password");
        }

        const user = await people.findOne({ email }).select("-password ");

   
        
        const unique_data = {
            email:user.email,
            role:role,
            createdAt: Date.now()
        }

        const unique = encryptToJson(unique_data, process.env.ENCRYPT_KEY);

        res.status(200).json(EncryptRes({ success: true, msg: "Login successful", unique}));

    } catch (err) {
        console.error('Error at Siginin controller :', err)
        res.status(400).json(EncryptRes({ success: false, msg: err.toString() }));
    }
}









const passwordChangeRequest = async (req, res) => {
    try {
       
        const decryptedData = req.body

        const email = decryptedData.email;

        const student = await Student.findOne({email})
        const instructor = await Instructor.findOne({email})
        const people = student ? Student : Instructor
        const user = await people.findOne({ email });

        if (!user) {
            throw new Error("User not found");
        }

        const data = {
            email: email,
            createdAt: Date.now(),
        };

        const encryptedData = encryptToJson(data, process.env.ENCRYPT_KEY);

       
        const dataArray = [...encryptedData].map((char) => encodeURIComponent(char));

       
        const url = `${FRONT_END_URL}/reset-password?key=${dataArray.join('')}`;
        

        const name = user.firstName + " " + (user.middleName?user.middleName:"") + " " + user.lastName+" "+`(${user.username})`;

        await sendMail(email, "Reset Password", name, url, "", "Change Password");

        await people.updateOne({ email }, { $set: { passwordChangeRequest: true } });

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

        const student = await Student.findOne({email})
        const instructor = await Instructor.findOne({email})
        const people = student ? student : instructor
        const user = await people.findOne({ email });

        
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

        await people.findOneAndUpdate({ email }, { password: hashedPassword, passwordChangeRequest: false });

        res.status(200).json(EncryptRes({ success: true, msg: "Password changed successfully."}));

    }catch(err){

        res.status(400).json(EncryptRes({ success: false, msg: err.toString()}));
    }


}

module.exports = { Signup, verifyEmail, Signin, passwordChangeRequest, resetPassword };