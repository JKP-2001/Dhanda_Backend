const { default: mongoose, mongo } = require("mongoose");
const { Instructor } = require("../../Models/peoples/Instructor");



async function InterviewerProfileController(req, res) {
    try {
        const userId = req.query.userId
        if (userId === undefined) {
            res.status(400).send('Query parameter userId not present')
            throw 'Query parameter userId not present'
        }

        let userIdObject;
        try {
            userIdObject = new mongoose.Types.ObjectId(userId)
        }
        catch(e){
            res.status(400).json('userId query parameter is not a valid ObjectId')
            throw e
        }
        let userInfo = await Instructor 
            .aggregate()
            .match({ _id: userIdObject })
            .project({
                username: 1,
                firstName: 1,
                middleName: 1,
                lastName: 1,
                followersCount: {
                    $cond: {
                        if: { $isArray: '$followers' }, // Check if 'followers' is an array
                        then: { $size: '$followers' },   // Apply $size if it is an array
                        else: 0                           // Default value if 'followers' is not an array
                    }
                },
                followingsCount: {
                    $cond: {
                        if: { $isArray: '$followings' }, // Check if 'followers' is an array
                        then: { $size: '$followings' },   // Apply $size if it is an array
                        else: 0                           // Default value if 'followers' is not an array
                    }
                },
                postsCount: {
                    $cond: {
                        if: { $isArray: '$posts' }, // Check if 'followers' is an array
                        then: { $size: '$posts' },   // Apply $size if it is an array
                        else: 0                           // Default value if 'followers' is not an array
                    }
                },
                profilePic: 1,
                headline: 1,
                description: 1,
                experience: 1,
                education: 1,
                feedbacks: 1,
                posts: 1

            })
            .exec()
        userInfo = userInfo[0] 
        
        
        if (!userInfo) {
            const errorMessage = `User with userId ${userId} is not present on database`
            res.status(404).json(errorMessage)
            throw errorMessage
        }
        res.status(200).json(userInfo)
    }
    catch (err) {
        console.error('ERROR: At InterviewProfileController function. \n', err, '\n')
    }
}

module.exports = InterviewerProfileController