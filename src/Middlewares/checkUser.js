

const User = require("../Models/User");

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

        const { token } = req.headers;

        if (!token) {
            throw new Error("Token not found");
        }

        const decryptedData = decryptFromJson(token, process.env.ENCRYPT_KEY);

        const user = await User.findOne({ email: decryptedData.email });

        if (!user) {
            throw new Error("User not found");
        }

        req.userEmail = user.email;

        next();

    } catch (error) {

        res.status(401).json({ message: error.message });
    }
}

module.exports = {checkUser}