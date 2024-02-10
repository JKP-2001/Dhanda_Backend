const express = require('express');
const multer = require('multer');
const { createNewPost, getAllPosts, deleteAllPosts, deleteAPost, getAPost, likeAPost, bookMarkAPost, commentOnAPost, replyOnComment, updateAPost, getAllPostsOfAUser, getBookMarkedPosts, getCommentsOfAPost, getRepliesOfAComment } = require('../../Controllers/Post/PostController');
const { checkUser } = require('../../Middlewares/checkUser');
const fs = require('fs');

const AWS = require('aws-sdk');

const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;

AWS.config.update({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY
});

const s3 = new AWS.S3();


const postRouter = express.Router();

const destinationPath = "./src/uploads/posts";

let upload;

try{
    if (!fs.existsSync(destinationPath)) {
        fs.mkdirSync(destinationPath, { recursive: true });
    }
    
    // const file_storage = multer.diskStorage({
    //     destination: function (req, file, cb) {
    //         cb(null, destinationPath);
    //     },
    //     filename: function (req, file, cb) {
    //         cb(null, Date.now() + "-" + file.originalname);
    //     }
    // });
    
    // upload = multer({
    //     storage: file_storage,
    //     limits: { fileSize: 1024 * 1024 * 10 },
    //     fileFilter: (req, file, cb) => {
    //         if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg" || file.mimetype.split("/")[1] === "pdf") {
    //             cb(null, true);
    //         } else {
    //             cb(null, false);
    //             return cb(new Error('Only .png, .jpg .jpeg .pdf format allowed!'));
    //         }
    //     }
    // });

    upload = multer({
        storage: multer.memoryStorage(),
        limits: {
          fileSize: 5 * 1024 * 1024, // limit file size to 5MB
        },
      });

}catch(err){
    console.log(err);
}




postRouter.get('/get-all-posts', getAllPosts);
postRouter.get('/get-post/:id', getAPost);
postRouter.get('/get-all-posts-of-user/:role/:id', checkUser, getAllPostsOfAUser);
postRouter.get('/get-book-marked-post/:role/:id', checkUser, getBookMarkedPosts);
postRouter.get('/post/comments/:id', getCommentsOfAPost);
postRouter.get('/comments/replies/:id', getRepliesOfAComment);

postRouter.post('/create-post', checkUser, upload.array('files'), createNewPost);
postRouter.post('/comment/:id', checkUser, commentOnAPost);
postRouter.post('/reply/comment/:id', checkUser, replyOnComment);

postRouter.patch('/update-post/:id', checkUser, upload.array('files'), updateAPost);
postRouter.patch('/like-post/:id', checkUser, likeAPost);
postRouter.patch('/bookmark-post/:id', checkUser, bookMarkAPost);


postRouter.delete('/delete-all-posts', checkUser, deleteAllPosts);
postRouter.delete('/delete-post/:id', checkUser, deleteAPost);

module.exports = postRouter;