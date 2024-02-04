
const userRouter = require("express").Router();

const { getUserData, onBoardingProcess } = require("../../Controllers/User/userControllers");
const { checkUser } = require("../../Middlewares/checkUser");

userRouter.get("/user-data", checkUser, getUserData);
userRouter.patch("/onboarding", checkUser, onBoardingProcess);

module.exports = userRouter