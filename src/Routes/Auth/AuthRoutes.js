const { Signup, verifyEmail } = require("../../Controllers/Auth/AuthControllers");

const authRouter = require("express").Router();


authRouter.post("/signup",Signup);
authRouter.post("/verify-email", verifyEmail);

module.exports = authRouter