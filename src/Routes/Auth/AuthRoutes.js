const { Signup, verifyEmail, Signin, passwordChangeRequest, resetPassword } = require("../../Controllers/Auth/AuthControllers");

const authRouter = require("express").Router();


authRouter.post("/signup",Signup);
authRouter.post("/verify-email", verifyEmail);
authRouter.post("/signin", Signin);
authRouter.post("/forgotpasswordrequest",passwordChangeRequest);
authRouter.patch("/resetpassword",resetPassword);

module.exports = authRouter