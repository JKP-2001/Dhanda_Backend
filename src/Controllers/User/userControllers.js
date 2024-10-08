const { Contact } = require("../../Models/Contact");
const { Education } = require("../../Models/Education");
const { Experience } = require("../../Models/Experience");
const { Post } = require("../../Models/Posts");


const { encryptToJson, decryptFromJson } = require("../../Utils/EncryptDecrypt");
const { getPeople, getRoleFromReq } = require("../../helpers/HelperFunctions");


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


const  getUserDataById = async (req, res) => {

    try {
        const role = req.params.role;
        const people = getPeople(role);
        const user = await people.findById(req.params.id).select("-password");

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

        // const encryptedData = encryptToJson(newUser, process.env.ENCRYPT_KEY);

        res.status(200).json({ success:true, data:newUser });

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


const handleTimeSlots = async (req, res) => {

    try {
        const role = getRoleFromReq(req)
        const people = getPeople(role)
        const user = await people.findOne({ email: req.userEmail });

        if (!user) {
            throw new Error("User not found");
        }

        if(user.role!=="instructor"){
            throw new Error("Only Instructors can handle time slots");
        }

        const availableTimeslots = req.body.availableTimeslots;
        

        await people.findByIdAndUpdate(
            user._id,
            {
                availableTimeslots: availableTimeslots
            }
        )

        res.status(200).json({ success: true, msg: "Time slots handled successfully" });

    } catch (error) {
        res.status(400).json({ success: false, msg: error.toString() });
    }
}


const profileImageUpload = async (req, res) => {

    try {
        const role = getRoleFromReq(req)
        const people = getPeople(role)
        const user = await people.findOne({ email: req.userEmail });

        if (!user) {
            throw new Error("User not found");
        }


        const files = req.files;

        const profilepic = user.profilePic

        const uploadedUrls = await uploadFilesToAWS(files);

        if(profilepic){
            await deleteS3Files([profilepic]);
        }

        await people.findByIdAndUpdate(
            user._id,
            {
                profilePic: uploadedUrls[0]
            }
        )

        res.status(200).json({success: true, msg: "Image uploaded successfully", url: uploadedUrls[0]});

    }catch(err){
        res.status(400).json({success:false, msg:err.toString()});
    }
}


const contactus = async (req, res) => {

    try {
        
        await Contact.create({
            email:req.body.email,
            subject:req.body.subject,
            message:req.body.message,
            createdAt:Date.now()
        })

        res.status(200).json({success:true,msg:"Form is submitted successfully."})

    } catch (error) {
        console.error('ERROR at getuserData :',error)
        res.status(400).json({ success:false, msg: error.toString() });
    }
}


const addEducation = async (req, res) => {

    try {
        const role = getRoleFromReq(req)
        const people = getPeople(role)
        const user = await people.findOne({ email: req.userEmail });

        if (!user) {
            throw new Error("User not found");
        }

        const newEducation = await Education.create({
            author_id: user._id,
            instituteName: req.body.instituteName,
            startDate: req.body.startDate,
            endDate: req.body.endDate?req.body.endDate:null,
            onGoing: req.body.onGoing?true:false,
            description: req.body.description,
            degree: req.body.degree,
            branch: req.body.branch,
            refModel: role
        });

        await people.findOneAndUpdate({ _id: user._id }, { $push: { education: newEducation._id } });

        res.status(200).json({ success: true, msg: "Education added successfully", data: newEducation });

    } catch (error) {
        res.status(400).json({ success: false, msg: error.toString() });
    }
}


const editEducation = async (req, res) => {

    try {
        const role = getRoleFromReq(req)
        const people = getPeople(role)
        const user = await people.findOne({ email: req.userEmail });

        if (!user) {
            throw new Error("User not found");
        }

        const educationId = req.params.id;

        const isEducationExist = await Education.findById(educationId);

        if (!isEducationExist) {
            throw new Error("Education not found");
        }

        if(isEducationExist.author_id.toString() !== user._id.toString()){
            throw new Error("You are not authorized to edit this education");
        }

        const updatedEducation = await Education.findByIdAndUpdate(educationId, req.body, { new: true });

        res.status(200).json({ success: true, msg: "Education updated successfully", data: updatedEducation });

    } catch (error) {
        res.status(400).json({ success: false, msg: error.toString() });
    }
}

const addExperience = async (req, res) => {

    try {
        const role = getRoleFromReq(req)
        const people = getPeople(role)
        const user = await people.findOne({ email: req.userEmail });

        if (!user) {
            throw new Error("User not found");
        }

        const newExperience = await Experience.create({
            author_id: user._id,
            company: req.body.company,
            role: req.body.role,
            startDate: req.body.startDate,
            endDate: req.body.endDate?req.body.endDate:Date.now(),
            onGoing: req.body.onGoing?true:false,
            description: req.body.description,
            refModel: role
        });

        await people.findOneAndUpdate({ _id: user._id }, { $push: { experience: newExperience._id } });

        res.status(200).json({ success: true, msg: "Experience added successfully", data: newExperience });

    } catch (error) {
        res.status(400).json({ success: false, msg: error.toString() });
    }
}

const updateExperience = async (req, res) => {
    try{

        const role = getRoleFromReq(req)
        const people = getPeople(role)
        const user = await people.findOne({ email: req.userEmail });

        if (!user) {
            throw new Error("User not found");
        }

        const experienceId = req.params.id;

        const isExperienceExist = await Experience.findById(experienceId);

        if (!isExperienceExist) {
            throw new Error("Experience not found");
        }

        if(isExperienceExist.author_id.toString() !== user._id.toString()){
            throw new Error("You are not authorized to edit this experience");
        }

        const updatedExperience = await Experience.findByIdAndUpdate(experienceId, req.body, { new: true });

        res.status(200).json({ success: true, msg: "Experience updated successfully", data: updatedExperience });

    }catch(error){
        res.status(400).json({ success: false, msg: error.toString() });   
    }
}

const deleteEducation = async (req, res) => {

    try {
        const role = getRoleFromReq(req)
        const people = getPeople(role)
        const user = await people.findOne({ email: req.userEmail });

        if (!user) {
            throw new Error("User not found");
        }

        const educationId = req.params.id;

        const isEducationExist = await Education.findById(educationId);

        if (!isEducationExist) {
            throw new Error("Education not found");
        }

        if(isEducationExist.author_id.toString() !== user._id.toString()){
            throw new Error("You are not authorized to delete this education");
        }

        await Education.findByIdAndDelete(educationId);

        await people.findOneAndUpdate({ _id: user._id }, { $pull: { education: educationId } });

        res.status(200).json({ success: true, msg: "Education deleted successfully" });

    } catch (error) {
        res.status(400).json({ success: false, msg: error.toString() });
    }
}

const deleteExperience = async (req, res) => {

    try {
        const role = getRoleFromReq(req)
        const people = getPeople(role)
        const user = await people.findOne({ email: req.userEmail });

        if (!user) {
            throw new Error("User not found");
        }

        const experienceId = req.params.id;

        const isExperienceExist = await Experience.findById(experienceId);

        if (!isExperienceExist) {
            throw new Error("Experience not found");
        }

        if(isExperienceExist.author_id.toString() !== user._id.toString()){
            throw new Error("You are not authorized to delete this experience");
        }

        await Experience.findByIdAndDelete(experienceId);

        await people.findOneAndUpdate({ _id: user._id }, { $pull: { experience: experienceId } });

        res.status(200).json({ success: true, msg: "Experience deleted successfully" });

    } catch (error) {
        res.status(400).json({ success: false, msg: error.toString() });
    }
}


const editPersonalInfo = async (req, res) => {

    try {
        const role = getRoleFromReq(req)
        const people = getPeople(role)
        const user = await people.findOne({ email: req.userEmail });

        if (!user) {
            throw new Error("User not found");
        }


        const updatedUser = await people.findOneAndUpdate({ _id: user._id }, req.body, { new: true });

        res.status(200).json({ success: true, msg: "Personal info updated successfully", data: updatedUser });

    } catch (error) {
        res.status(400).json({ success: false, msg: error.toString() });
    }

}
module.exports = { getUserData, onBoardingProcess, getUserDataById, handleTimeSlots,contactus, profileImageUpload, addEducation, editEducation, addExperience, updateExperience, deleteEducation,deleteExperience, editPersonalInfo };