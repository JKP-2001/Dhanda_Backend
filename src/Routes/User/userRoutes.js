
const userRouter = require("express").Router();

const { getUserData, onBoardingProcess, getAllUserforInterviewer, banUser, unBanUser } = require("../../Controllers/User/userControllers");

const { checkUser } = require("../../Middlewares/checkUser");

userRouter.get("/user-data", checkUser, getUserData);
userRouter.patch("/onboarding", checkUser, onBoardingProcess);
userRouter.get("/user-for-interview",checkUser,getAllUserforInterviewer);
userRouter.get("/ban-user",checkUser,banUser);
userRouter.get("/unban-user",checkUser,unBanUser);

module.exports = userRouter