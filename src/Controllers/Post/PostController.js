


const { Comment } = require("../../Models/Comment");
const { Post } = require("../../Models/Posts");
const { Reply } = require("../../Models/Reply");
const { getPeople } = require("../../helpers/HelperFunctions");
const Paginator = require("../../helpers/Paginator");

const fs = require('fs');


const AWS = require('aws-sdk');

const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const BUCKET_REGION = process.env.BUCKET_REGION




const s3 = new AWS.S3({
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
    region: BUCKET_REGION
});

const deleteS3Files = async (imageUrls) => {

    const deletePromises = imageUrls.map(async (url) => {
        const key = url.split('/').pop(); // Assuming the key is the last part of the URL
        const params = {
            Bucket: 'mock-interview',
            Key: key,
        };
        await s3.deleteObject(params).promise();
    });

    await Promise.all(deletePromises);

};


const uploadFilesToAWS = async (files) => {
    const uploadPromises = files.map(async (file) => {
        const params = {
            Bucket: 'mock-interview',
            Key: file.originalname,
            Body: file.buffer,
        };

        return new Promise((resolve, reject) => {
            s3.upload(params, (err, data) => {
                if (err) {
                    console.error(err);
                    reject(`Error uploading file ${file.originalname}`);
                } else {
                    resolve(data.Location || ''); // Ensure to handle the case when Location is undefined
                }
            });
        });
    });

    const uploadedUrls = await Promise.all(uploadPromises.filter(url => url !== '')); // Filter out empty URLs

    return uploadedUrls;
}


const getImageUrls = (files) => {
    var imageUrls = [];

    for (let i = 0; i < files.length; i++) {
        const path = files[i].path.replace(/\\/g, '/');
        imageUrls.push(path);
    }

    return imageUrls;
}


const createNewPost = async (req, res) => {

    try {




        const people = getPeople(req.role);

        const user = await people.findOne({ email: req.userEmail });

        if (!user) {
            throw new Error("User not found");
        }

        const files = req.files;

        const uploadedUrls = await uploadFilesToAWS(files);




        const post = await Post.create({
            content: req.body.content,
            author: user._id,
            images: uploadedUrls,
            refModel: req.role,
            updatedAt: Date.now(),
        });


        await people.findOneAndUpdate({ _id: user._id }, { $push: { posts: post._id } });

        res.status(200).json({ success: true, msg: "Post created successfully" });
    } catch (err) {
        res.status(400).json({ success: false, msg: err.toString() })
    }
}


const getAllPosts = async (req, res) => {

    try {

        const allPosts = await Post.find().
            populate({
                path: "author",
                select: "-password"
            })
            .populate({
                path: "likes",
                select: "firstName middleName lastName role email _id"
            }).
            populate({
                path: "bookmarks",
                select: "firstName middleName lastName role email _id"
            })
            .populate({
                path: "comments",
                populate: {
                    path: "author_id",
                    select: "firstName middleName lastName role email _id bio"
                },
                populate: {
                    path: "replies",
                    select: "content author_id refModel comment_id _id",
                    populate: {
                        path: "author_id",
                        select: "firstName middleName lastName role email _id bio"
                    }
                }
            })
            .populate("share").sort({ updatedAt: -1, createdAt: -1 });

        const page = req.query.page ? req.query.page : 1

        const limit = req.query.limit ? parseInt(req.query.limit) : allPosts.length;

        const paginatedResult = Paginator(allPosts, page, limit);

        res.status(200).json({ success: true, data: paginatedResult });

    } catch (err) {
        res.status(400).json({ success: false, msg: err.toString() })
    }
}


const getAllPostsOfAUser = async (req, res) => {

    try {

        const people = getPeople(req.role);

        const user = await people.findOne({ email: req.userEmail });

        if (!user) {
            throw new Error("User not found");
        }



        const id = req.params.id;
        const role = req.params.role



        const People = getPeople(role);

        const searchedUser = await People.findOne({ _id: id });

        if (!searchedUser) {
            throw new Error("User not found");
        }

        const posts = searchedUser.posts;


        const allPosts = await Post.find({ _id: { $in: posts } }).
            populate({
                path: "author",
                select: "-password"
            })
            .populate({
                path: "likes",
                select: "firstName middleName lastName role email _id"
            }).
            populate({
                path: "bookmarks",
                select: "firstName middleName lastName role email _id"
            })
            .populate({
                path: "comments",
                populate: {
                    path: "author_id",
                    select: "firstName middleName lastName role email _id bio"
                },
                populate: {
                    path: "replies",
                    select: "content author_id refModel comment_id _id",
                    populate: {
                        path: "author_id",
                        select: "firstName middleName lastName role email _id bio"
                    }
                }
            })
            .populate("share").sort({ updatedAt: -1, createdAt: -1 });

        const page = req.query.page ? req.query.page : 1

        const limit = req.query.limit ? parseInt(req.query.limit) : allPosts.length;

        const paginatedResult = Paginator(allPosts, page, limit);

        res.status(200).json({ success: true, data: paginatedResult });

    } catch (err) {
        res.status(400).json({ success: false, msg: err.toString() })
    }
}


const getAPost = async (req, res) => {

    try {

        const postId = req.params.id;

        const post = await Post.findById(postId).
            populate({
                path: "author",
                select: "-password"
            })
            .populate({
                path: "likes",
                select: "firstName middleName lastName role email _id"
            }).
            populate({
                path: "bookmarks",
                select: "firstName middleName lastName role email _id"
            })
            .populate("share");

        if (!post) {
            throw new Error("Post not found");
        }

        res.status(200).json({ success: true, data: post });

    } catch (err) {
        res.status(400).json({ success: false, msg: err.toString() });
    }
}

const getBookMarkedPosts = async (req, res) => {

    try {

        const people = getPeople(req.role);

        const user = await people.findOne({ email: req.userEmail });

        if (!user) {
            throw new Error("User not found");
        }

        const id = req.params.id;
        const role = req.params.role



        const People = getPeople(role);

        const searchedUser = await People.findOne({ _id: id });

        if (!searchedUser) {
            throw new Error("User not found");
        }

        const posts = searchedUser.postsSaved;

        const allPosts = await Post.find({ _id: { $in: posts } }).populate({
            path: "author",
            select: "-password"
        })
            .populate({
                path: "likes",
                select: "firstName middleName lastName role email _id"
            }).
            populate({
                path: "bookmarks",
                select: "firstName middleName lastName role email _id"
            })
            .populate("share").sort({ updatedAt: -1, createdAt: -1 });

        const page = req.query.page ? req.query.page : 1

        const limit = req.query.limit ? parseInt(req.query.limit) : allPosts.length;

        const paginatedResult = Paginator(allPosts, page, limit);

        res.status(200).json({ success: true, data: paginatedResult });

    } catch (err) {
        res.status(400).json({ success: false, msg: err.toString() })
    }

}

const updateAPost = async (req, res) => {

    try {


        const people = getPeople(req.role);

        const user = await people.findOne({ email: req.userEmail });

        if (!user) {
            throw new Error("User not found");
        }

        const postId = req.params.id;

        const post = await Post.findById(postId);

        if (!post) {
            throw new Error("Post not found");
        }

        if (post.author.toString() !== user._id.toString()) {
            throw new Error("You are not authorized to update this post");
        }

        let imageUrls = post.images;

        const filesToBeDeleted = JSON.parse(req.body.filesToBeDeleted);

        // console.log({filesToBeDeleted})


        if (filesToBeDeleted.length > 0) {
            imageUrls = imageUrls.filter(url => !filesToBeDeleted.includes(url));
            deleteS3Files(filesToBeDeleted);
        }

        if (req.files) {
            const files = req.files;
            const uploadedUrls = await uploadFilesToAWS(files); //Filter out empty URLs
            imageUrls = imageUrls.concat([...uploadedUrls]);
        }

      

        await Post.findByIdAndUpdate(postId, {
            content: req.body.content,
            images: imageUrls,
            refModel: req.role,
            updatedAt: Date.now(),
            isUpdated: true
        });

        res.status(200).json({ success: true, msg: "Post updated successfully" });

    } catch (err) {
        // console.log({err:err.toString()});
        res.status(400).json({ success: false, msg: err.toString() });
    }
}

const deleteAPost = async (req, res) => {
    try {

        const people = getPeople(req.role);

        const user = await people.findOne({ email: req.userEmail });

        if (!user) {
            throw new Error("User not found");
        }

        const postId = req.params.id;

        const post = await Post.findById(postId);

        if (!post) {
            throw new Error("Post not found");
        }

        if (post.author.toString() !== user._id.toString()) {
            throw new Error("You are not authorized to delete this post");
        }

        const imageUrls = post.images;



        await deleteS3Files(imageUrls);

        await Post.findByIdAndDelete(postId);

        await people.findOneAndUpdate({ _id: user._id }, { $pull: { posts: postId } });

        res.status(200).json({ success: true, msg: "Post deleted successfully" });

    } catch (err) {
        res.status(400).json({ success: false, msg: err.toString() })
    }
}

const deleteAllPosts = async (req, res) => {

    try {
        const people = getPeople(req.role);

        const user = await people.findOne({ email: req.userEmail });

        if (!user) {
            throw new Error("User not found");
        }

        // delete post present in user post array

        const allPosts = await Post.find({ author: user._id });

        for (let i = 0; i < allPosts.length; i++) {
            const imageUrls = allPosts[i].images;

            for (let j = 0; j < imageUrls.length; j++) {
                fs.unlinkSync(imageUrls[j]);
            }
        }

        await Post.deleteMany({ author: user._id });

        await people.findOneAndUpdate({ _id: user._id }, { $set: { posts: [] } });

        res.status(200).json({ success: true, msg: "All posts deleted successfully" });

    } catch (err) {
        res.status(400).json({ success: false, msg: err.toString() })
    }
}


const likeAPost = async (req, res) => {

    try {
        const people = getPeople(req.role);

        const user = await people.findOne({ email: req.userEmail });

        if (!user) {
            throw new Error("User not found");
        }

        const postId = req.params.id;

        const post = await Post.findById(postId);

        if (!post) {
            throw new Error("Post not found");
        }

        const isLiked = post.likes.includes(user._id);

        if (isLiked) {
            await Post.findByIdAndUpdate(postId, { $pull: { likes: user._id } });
            await people.findOneAndUpdate({ _id: user._id }, { $pull: { postLikes: postId } });
            res.status(200).json({ success: true, msg: "Post unliked successfully" });
        } else {
            await Post.findByIdAndUpdate(postId, { $push: { likes: user._id } });
            await people.findOneAndUpdate({ _id: user._id }, { $push: { postLikes: postId } });
            res.status(200).json({ success: true, msg: "Post liked successfully" });
        }

    } catch (err) {
        res.status(400).json({ success: false, msg: err.toString() })
    }
}

const bookMarkAPost = async (req, res) => {

    try {
        const people = getPeople(req.role);

        const user = await people.findOne({ email: req.userEmail });

        if (!user) {
            throw new Error("User not found");
        }

        const postId = req.params.id;

        const post = await Post.findById(postId);

        if (!post) {
            throw new Error("Post not found");
        }

        const isBookMarked = post.bookmarks.includes(user._id);

        if (isBookMarked) {
            await Post.findByIdAndUpdate(postId, { $pull: { bookmarks: user._id } });
            await people.findOneAndUpdate({ _id: user._id }, { $pull: { postsSaved: postId } });
            res.status(200).json({ success: true, msg: "Post unbookmarked successfully" });
        }

        else {
            await Post.findByIdAndUpdate(postId, { $push: { bookmarks: user._id } });
            await people.findOneAndUpdate({ _id: user._id }, { $push: { postsSaved: postId } });
            res.status(200).json({ success: true, msg: "Post bookmarked successfully" });
        }

    } catch (err) {
        res.status(400).json({ success: false, msg: err.toString() })
    }
}


const commentOnAPost = async (req, res) => {

    try {
        const people = getPeople(req.role);



        const user = await people.findOne({ email: req.userEmail });

        if (!user) {
            throw new Error("User not found");
        }

        const postId = req.params.id;

        const post = await Post.findById(postId);

        if (!post) {
            throw new Error("Post not found");
        }

        const comment = {
            content: req.body.content,
            author_id: user._id,
            refModel: req.role,
            post_id: postId,
            creationDateAndTime: Date.now()
        };

        const newComment = await Comment.create(comment);

        await Post.findByIdAndUpdate(postId, { $push: { comments: newComment._id } });

        res.status(200).json({ success: true, msg: "Commented on post successfully" });

    } catch (err) {
        res.status(400).json({ success: false, msg: err.toString() });
    }
}


const getCommentsOfAPost = async (req, res) => {

    try {

        const postId = req.params.id;

        const post = await Post.findById(postId);

        if (!post) {
            throw new Error("Post not found");
        }

        const comments = await Comment.find({ post_id: postId }).populate("author_id", "firstName middleName lastName role email _id").sort({ creationDateAndTime: -1 });

        const page = parseInt(req.query.page) || 1;

        const limit = parseInt(req.query.limit) || 10;

        const paginatedResult = Paginator(comments, page, limit);

        res.status(200).json({ success: true, data: paginatedResult });

    } catch (err) {
        res.status(400).json({ success: false, msg: err.toString() });
    }
}

const getRepliesOfAComment = async (req, res) => {

    try {

        const commentId = req.params.id;

        const comment = await Comment.findById(commentId);

        if (!comment) {
            throw new Error("Comment not found");
        }

        const replies = await Reply.find({ comment_id: commentId }).populate("author_id", "firstName middleName lastName role email _id").sort({ creationDateAndTime: -1 });

        const page = parseInt(req.query.page) || 1;

        const limit = parseInt(req.query.limit) || 10;

        const paginatedResult = Paginator(replies, page, limit);

        res.status(200).json({ success: true, data: paginatedResult });

    } catch (err) {
        res.status(400).json({ success: false, msg: err.toString() });
    }
}


const replyOnComment = async (req, res) => {

    try {
        const people = getPeople(req.role);

        const user = await people.findOne({ email: req.userEmail });

        if (!user) {
            throw new Error("User not found");
        }

        const commentId = req.params.id;

        const comment = await Comment.findById(commentId);

        if (!comment) {
            throw new Error("Comment not found");
        }

        const reply = {
            content: req.body.content,
            author_id: user._id,
            refModel: req.role,
            comment_id: commentId,
            creationDateAndTime: Date.now()
        }

        const newReply = await Reply.create(reply);

        await Comment.findByIdAndUpdate(commentId, { $push: { replies: newReply._id } });

        res.status(200).json({ success: true, msg: "Replied on comment successfully" });

    } catch (err) {
        res.status(400).json({ success: false, msg: err.toString() });
    }
}





module.exports = { createNewPost, getAllPosts, deleteAllPosts, deleteAPost, getAPost, likeAPost, bookMarkAPost, commentOnAPost, replyOnComment, updateAPost, getAllPostsOfAUser, getBookMarkedPosts, getCommentsOfAPost, getRepliesOfAComment };