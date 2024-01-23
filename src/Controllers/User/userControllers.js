const {User} = require("../../Models/User");

const { encryptToJson, decryptFromJson } = require("../../Utils/EncryptDecrypt");


const getUserData = async (req, res) => {

    try {

        const user = await User.findOne({ email: req.userEmail }).select("-password");

        if (!user) {
            throw new Error("User not found");
        }

        const encryptedData = encryptToJson(user, process.env.ENCRYPT_KEY);

        res.status(200).json({ success:true, data:encryptedData });

    } catch (error) {

        res.status(400).json({ success, msg: error.toString() });
    }
}

module.exports = { getUserData }