
const mongoose = require("mongoose")


const { decryptFromJson } = require("../Utils/EncryptDecrypt");
const { getPeople } = require("../helpers/HelperFunctions");
const { Instructor } = require("../Models/peoples/Instructor");
const { Student } = require("../Models/peoples/Student");

/**
 * Asynchronous function to check user authentication and set user email in request object.
 *
 * @param {Object} req - the request object
 * @param {Object} res - the response object
 * @param {Function} next - the next function
 * @return {Promise<void>} Promise that resolves when the function completes
 */
const checkUser = async (req, res, next) => {

    try {

        

        const authToken = req.headers['auth-token'];


        if (!authToken) {
            throw new Error("Token not found");
        }
        const decryptedData = decryptFromJson(authToken, process.env.ENCRYPT_KEY);

        console.log({decryptedData});
   
        const people = getPeople(decryptedData.role)

        const user = await people.findOne({ email: decryptedData.email });


        const createdAt = decryptedData.createdAt;

        // check if token is expired after 5 days

        const currentTime = Date.now();

        const timeDiff = currentTime - createdAt;

        if (timeDiff > 5 * 24 * 60 * 60 * 1000) {

            throw new Error("Token expired");
        }

        if (!user) {
            throw new Error("User not found");
        }

        

        req.userEmail = user.email;
        req.role = decryptedData.role

        next();

    } catch (error) {

        res.status(401).json({ success:false, msg: error.toString() });
    }
}

module.exports = {checkUser}