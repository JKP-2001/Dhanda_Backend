
const userRouter = require("express").Router();

const multer = require("multer");
const { getUserData, onBoardingProcess, getUserDataById, handleTimeSlots,contactus, profileImageUpload } = require("../../Controllers/User/userControllers");
const { checkUser } = require("../../Middlewares/checkUser");


let upload;

try{
    upload = multer({
        storage: multer.memoryStorage(),
        limits: {
          fileSize: 5 * 1024 * 1024, // limit file size to 5MB
        },
      });

}catch(err){
    console.log(err);
}

userRouter.get("/user-data", checkUser, getUserData);
userRouter.get("/user-data/:role/:id", getUserDataById);
userRouter.post("/contactus", contactus);
userRouter.patch("/onboarding", checkUser, onBoardingProcess);
userRouter.patch("/handle-time-slots", checkUser, handleTimeSlots);
userRouter.patch("/profile-image-upload", checkUser, upload.array('files'), profileImageUpload);

module.exports = userRouter