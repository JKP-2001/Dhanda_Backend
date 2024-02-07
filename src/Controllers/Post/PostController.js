


const { Comment } = require("../../Models/Comment");
const { Post } = require("../../Models/Posts");
const { Reply } = require("../../Models/Reply");
const { getPeople } = require("../../helpers/HelperFunctions");
const Paginator = require("../../helpers/Paginator");

const fs = require('fs');

const getImageUrls = (files) => {
    var imageUrls = [];

    for (let i = 0; i < files.length; i++) {
        imageUrls.push(files[i].path);
    }

    return imageUrls;
}


const createNewPost = async (req, res) => {

    try {
        const files = req.files;

        var imageUrls = getImageUrls(files);

        const people = getPeople(req.role);

        const user = await people.findOne({ email: req.userEmail });

        if (!user) {
            throw new Error("User not found");
        }

        const post = await Post.create({
            content: req.body.content,
            author: user._id,
            images: imageUrls,
            refModel: req.role
        })

        await people.findOneAndUpdate({ _id: user._id }, { $push: { posts: post._id } });

        res.status(200).json({ success: true, message: "Post created successfully" });
    } catch (err) {
        res.status(400).json({ success: false, message: err.toString() })
    }
}


const getAllPosts = async (req, res) => {

    try {
        
        const allPosts = await Post.find().
        populate({
            path:"author",
            select: "-password"
        })
        .populate({
            path:"likes",
            select: "firstName middleName lastName role email _id"
        }).
        populate({
            path:"bookmarks",
            select: "firstName middleName lastName role email _id"
        })
        .populate({
            path:"comments",
            populate: {
                path: "author_id",
                select: "firstName middleName lastName role email _id"
            },
            populate: {
                path: "replies",
                select: "content author_id refModel comment_id _id",
                populate: {
                    path: "author_id",
                    select: "firstName middleName lastName role email _id"
                }
            }
        })
        .populate("share");

        const page = req.query.page ? req.query.page : 1
        
        const limit = req.query.limit ? parseInt(req.query.limit) : allPosts.length;
     
        const paginatedResult = Paginator(allPosts, page, limit);


        res.status(200).json({ success: true, data: paginatedResult });

    } catch (err) {
        res.status(400).json({ success: false, message: err.toString() })
    }
}


const getAPost = async (req, res) => {

    try {
        
        const postId = req.params.id;

        const post = await Post.findById(postId).
        populate({
            path:"author",
            select: "-password"
        })
        .populate({
            path:"likes",
            select: "firstName middleName lastName role email _id"
        }).
        populate({
            path:"bookmarks",
            select: "firstName middleName lastName role email _id"
        })
        .populate({
            path:"comments",
            populate: {
                path: "author_id",
                select: "firstName middleName lastName role email _id"
            },
            populate: {
                path: "replies",
                select: "content author_id refModel comment_id _id",
                populate: {
                    path: "author_id",
                    select: "firstName middleName lastName role email _id"
                }
            }
        })
        .populate("share");

        if (!post) {
            throw new Error("Post not found");
        }

        res.status(200).json({ success: true, data: post });

    } catch (err) {
        res.status(400).json({ success: false, message: err.toString() });
    }
}

const updateAPost = async (req, res) => {

    try {

        console.log({filesToBeDeleted: req.filesToBeDeleted});

        const people = getPeople(req.role);

        const user = await people.findOne({ email: req.userEmail });

        if (!user) {
            throw new Error("User not found");
        }

        const postId = req.params.id;

        const post = await Post.findById(postId);

        if(!post){
            throw new Error("Post not found");
        }

        if(post.author.toString() !== user._id.toString()){
            throw new Error("You are not authorized to update this post");
        }

        let imageUrls = post.images;

        const filesToBeDeleted = req.filesToBeDeleted;

        if(filesToBeDeleted){
            for(let i = 0; i < filesToBeDeleted.length; i++){
                const filePath = filesToBeDeleted[i];
                fs.unlinkSync(filePath);
            }
        }

        if(req.files){
            const newImageUrls = getImageUrls(req.files);

            imageUrls = imageUrls.concat(newImageUrls);
        }

        await Post.findByIdAndUpdate(postId, {
            content: req.body.content,
            images: imageUrls,
            refModel: req.role,
            updatedAt: Date.now()
        });

        res.status(200).json({ success: true, message: "Post updated successfully" });

    } catch (err) {
        res.status(400).json({ success: false, message: err.toString() });
    }
}

const deleteAPost = async (req, res) => {
    try{

        const people = getPeople(req.role);

        const user = await people.findOne({ email: req.userEmail });

        if (!user) {
            throw new Error("User not found");
        }

        const postId = req.params.id;

        const post = await Post.findById(postId);

        if(!post){
            throw new Error("Post not found");
        }

        if(post.author.toString() !== user._id.toString()){
            throw new Error("You are not authorized to delete this post");
        }

        const imageUrls = post.images;

        for (let i = 0; i < imageUrls.length; i++) {
            fs.unlinkSync(imageUrls[i]);
        }

        await Post.findByIdAndDelete(postId);

        await people.findOneAndUpdate({ _id: user._id }, { $pull: { posts: postId } });

        res.status(200).json({ success: true, message: "Post deleted successfully" });

    }catch(err){
        res.status(400).json({ success: false, message: err.toString() })
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

        res.status(200).json({ success: true, message: "All posts deleted successfully" });

    } catch (err) {
        res.status(400).json({ success: false, message: err.toString() })
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
                res.status(200).json({ success: true, message: "Post unliked successfully" });
            } else {
                await Post.findByIdAndUpdate(postId, { $push: { likes: user._id } });
                await people.findOneAndUpdate({ _id: user._id }, { $push: { postLikes: postId } });
                res.status(200).json({ success: true, message: "Post liked successfully" });
            }
    
        } catch (err) {
            res.status(400).json({ success: false, message: err.toString() })
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
            res.status(200).json({ success: true, message: "Post unbookmarked successfully" });
        }

        else {
            await Post.findByIdAndUpdate(postId, { $push: { bookmarks: user._id } });
            await people.findOneAndUpdate({ _id: user._id }, { $push: { postsSaved: postId } });
            res.status(200).json({ success: true, message: "Post bookmarked successfully" });
        }

    } catch (err) {
        res.status(400).json({ success: false, message: err.toString() })
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
            post_id: postId
        };

        const newComment = await Comment.create(comment);

        await Post.findByIdAndUpdate(postId, { $push: { comments: newComment._id } });

        res.status(200).json({ success: true, message: "Commented on post successfully" });

    } catch (err) {
        res.status(400).json({ success: false, message: err.toString() });
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
            comment_id: commentId
        }

        const newReply = await Reply.create(reply);

        await Comment.findByIdAndUpdate(commentId, { $push: { replies: newReply._id } });

        res.status(200).json({ success: true, message: "Replied on comment successfully" });

    } catch (err) {
        res.status(400).json({ success: false, message: err.toString() });
    }
}





module.exports = { createNewPost, getAllPosts, deleteAllPosts, deleteAPost, getAPost, likeAPost, bookMarkAPost, commentOnAPost, replyOnComment, updateAPost };