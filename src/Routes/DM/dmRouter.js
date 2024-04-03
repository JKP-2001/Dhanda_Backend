const dmRouter = require("express").Router();

const { fetchDMOfUser, answerToDM , makeSeen} = require("../../Controllers/DmController/DmController");
const { fetchUserDMTransactions } = require("../../Controllers/Meeting/meetingController");
const { checkUser } = require("../../Middlewares/checkUser");


dmRouter.get("/dm", checkUser, fetchDMOfUser);
dmRouter.post("/dm/:id", checkUser, answerToDM);
dmRouter.get('/dm/transactions', checkUser, fetchUserDMTransactions);
dmRouter.get('/dm/makeseen',checkUser,makeSeen);

module.exports =  {dmRouter}