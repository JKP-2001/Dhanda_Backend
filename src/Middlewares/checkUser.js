
const mongoose = require("mongoose")

const {User} = require("../Models/peoples/Interviewer")

const { decryptFromJson } = require("../Utils/EncryptDecrypt");

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

        const user = await User.findOne({ email: decryptedData.email });

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

        next();

    } catch (error) {

        res.status(401).json({ success:false, msg: error.toString() });
    }
}

module.exports = {checkUser}