
const userRouter = require("express").Router();

const { getUserData } = require("../../Controllers/User/userControllers");
const { checkUser } = require("../../Middlewares/checkUser");

userRouter.get("/user-data", checkUser, getUserData);

module.exports = userRouter