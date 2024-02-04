const { Education } = require("../../Models/Education");
const { Experience } = require("../../Models/Experience");
const {User} = require("../../Models/User");

const { encryptToJson, decryptFromJson } = require("../../Utils/EncryptDecrypt");


const getUserData = async (req, res) => {

    try {

        const user = await User.findOne({ email: req.userEmail }).select("-password");

        if (!user) {
            throw new Error("User not found");
        }

        const encryptedData = encryptToJson(user, process.env.ENCRYPT_KEY);

        res.status(200).json({ success:true, data:encryptedData });

    } catch (error) {

        res.status(400).json({ success, msg: error.toString() });
    }
}


const onBoardingProcess = async (req, res) => {

    try {

        const user = await User.findOne({ email: req.userEmail });

        if (!user) {
            throw new Error("User not found");
        }

        const encryptedData = req.body.payload;

        const decryptedData = decryptFromJson(encryptedData, process.env.ENCRYPT_KEY);

        const {bio, description, role} = decryptedData;


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
            branch: educationData.branch
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
                company: currentJob.company
            });    
        }
        


        if(role!=="student"){
            await User.findByIdAndUpdate(
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
            await User.findByIdAndUpdate(
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