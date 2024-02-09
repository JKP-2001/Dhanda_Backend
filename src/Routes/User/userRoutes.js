
const userRouter = require("express").Router();

const { getUserData, onBoardingProcess, getUserDataById } = require("../../Controllers/User/userControllers");
const { checkUser } = require("../../Middlewares/checkUser");

userRouter.get("/user-data", checkUser, getUserData);
userRouter.get("/user-data/:role/:id", getUserDataById);
userRouter.patch("/onboarding", checkUser, onBoardingProcess);

module.exports = userRouter