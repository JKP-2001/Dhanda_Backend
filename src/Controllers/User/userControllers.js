const { Education } = require("../../Models/Education");
const { Experience } = require("../../Models/Experience");
const { Post } = require("../../Models/Posts");

const { encryptToJson, decryptFromJson } = require("../../Utils/EncryptDecrypt");
const { getPeople, getRoleFromReq } = require("../../helpers/HelperFunctions");




const getUserData = async (req, res) => {

    try {
        const role = getRoleFromReq(req)
        const people = getPeople(role)
        const user = await people.findOne({ email: req.userEmail }).select("-password");

        if (!user) {
            throw new Error("User not found");
        }


        const education = await Education.find({ _id: { $in: user.education } });

        const experience = await Experience.find({ _id: { $in: user.experience } });

        const posts = await Post.find({ _id: { $in: user.posts } });

        const newUser = {
            ...user._doc,
            education,
            experience,
            posts
        };

        const encryptedData = encryptToJson(newUser, process.env.ENCRYPT_KEY);

        res.status(200).json({ success:true, data:encryptedData });

    } catch (error) {
        console.error('ERROR at getuserData :',error)
        res.status(400).json({ success:false, msg: error.toString() });
    }
}


const onBoardingProcess = async (req, res) => {

    try {
        const role = getRoleFromReq(req)
        const people = getPeople(role)
        const user = await people.findOne({ email: req.userEmail });

        if (!user) {
            throw new Error("User not found");
        }

        

       
        const decryptedData = req.body;

      

        const {bio, description} = decryptedData;


        const educationData = decryptedData.current_education;

        const currentJob = decryptedData.current_job;

        let newEducation = await Education.create({
            author_id: user._id,
            instituteName: educationData.instituteName,
            startDate: educationData.startDate,
            endDate: educationData.endDate?educationData.endDate:null,
            onGoing: educationData.onGoing,
            description: educationData.description,
            degree: educationData.degree,
            branch: educationData.branch,
            refModel: role
        });

        let newExperience = null;

        if(role!=="student"){
            newExperience = await Experience.create({
                author_id: user._id,
                role: currentJob.role,
                startDate: currentJob.startDate,
                onGoing: currentJob.onGoing,
                endDate: currentJob.endDate?currentJob.endDate:null,
                description: currentJob.description,
                company: currentJob.company,
                refModel: role
            });    
        }
        


        if(role!=="student"){
            await people.findByIdAndUpdate(
            user._id,
            {
                bio: bio,
                description: description,
                $push: {
                    education: newEducation._id,
                    experience: newExperience._id
                },
                onBoarding: true
            },
            { new: true }
        )}
        else{
            await people.findByIdAndUpdate(
                user._id,
                {
                    bio: bio,
                    description: description,
                    $push: {
                        education: newEducation._id,
                    },
                    onBoarding: true
                },
                { new: true }
            )
        }

        res.status(200).json({ success: true, msg: "Onboarding process completed" });

    } catch (error) {
        res.status(400).json({ success: false, msg: error.toString() });
    }
}

module.exports = { getUserData, onBoardingProcess };