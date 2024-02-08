const express = require('express');
const multer = require('multer');
const { createNewPost, getAllPosts, deleteAllPosts, deleteAPost, getAPost, likeAPost, bookMarkAPost, commentOnAPost, replyOnComment, updateAPost, getAllPostsOfAUser, getBookMarkedPosts } = require('../../Controllers/Post/PostController');
const { checkUser } = require('../../Middlewares/checkUser');
const fs = require('fs');

const postRouter = express.Router();

const destinationPath = "./src/uploads/posts";

let upload;

try{
    if (!fs.existsSync(destinationPath)) {
        fs.mkdirSync(destinationPath, { recursive: true });
    }
    
    const file_storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, destinationPath);
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + "-" + file.originalname);
        }
    });
    
    upload = multer({
        storage: file_storage,
        limits: { fileSize: 1024 * 1024 * 10 },
        fileFilter: (req, file, cb) => {
            if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg" || file.mimetype.split("/")[1] === "pdf") {
                cb(null, true);
            } else {
                cb(null, false);
                return cb(new Error('Only .png, .jpg .jpeg .pdf format allowed!'));
            }
        }
    });
}catch(err){
    console.log(err);
}




postRouter.get('/get-all-posts', getAllPosts);
postRouter.get('/get-post/:id', getAPost);
postRouter.get('/get-all-posts-of-user/:role/:id', checkUser, getAllPostsOfAUser);
postRouter.get('/get-book-marked-post/:role/:id', checkUser, getBookMarkedPosts);

postRouter.post('/create-post', checkUser, upload.array('files'), createNewPost);
postRouter.post('/comment/:id', checkUser, commentOnAPost);
postRouter.post('/reply/comment/:id', checkUser, replyOnComment);

postRouter.patch('/update-post/:id', checkUser, upload.array('files'), updateAPost);
postRouter.patch('/like-post/:id', checkUser, likeAPost);
postRouter.patch('/bookmark-post/:id', checkUser, bookMarkAPost);


postRouter.delete('/delete-all-posts', checkUser, deleteAllPosts);
postRouter.delete('/delete-post/:id', checkUser, deleteAPost);

module.exports = postRouter;