
const userRouter = require("express").Router();

const { getUserData, onBoardingProcess, getUserDataById, handleTimeSlots,contactus } = require("../../Controllers/User/userControllers");
const { checkUser } = require("../../Middlewares/checkUser");

userRouter.get("/user-data", checkUser, getUserData);
userRouter.get("/user-data/:role/:id", getUserDataById);
userRouter.post("/contactus", contactus);
userRouter.patch("/onboarding", checkUser, onBoardingProcess);
userRouter.patch("/handle-time-slots", checkUser, handleTimeSlots);

module.exports = userRouter