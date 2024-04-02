const { DM } = require("../../Models/DM");
const { getPeople } = require("../../helpers/HelperFunctions");


const fetchDMOfUser = async (req, res) => {
    try{
        const people = getPeople(req.role);

        const user = await people.findOne({ email: req.userEmail });

        if (!user) {
            throw new Error("User not found");
        }

        const type = req.query.type ? req.query.type : "unanswered";

        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit? parseInt(req.query.limit) : 10;

        

        let totalResult = 0;
        let dms;

        if(type === "unanswered"){
            if(user.role === "student"){
                dms = await DM.find({ senderId: user._id, isAnswered: false, transaction_id: { $exists: true } }).populate({path: "senderId", select:"_id firstName middleName lastName role email"}).populate({path: "receiverId", select:"_id firstName middleName lastName role email"}).
                skip((page - 1) * limit).limit(limit);


                if(page === 1){
                    totalResult = await DM.countDocuments({ senderId: user._id, isAnswered: false, transaction_id: { $exists: true } });
                }
            }
            else{
                dms = await DM.find({ receiverId: user._id, isAnswered: false, transaction_id: { $exists: true } }).populate({path: "senderId", select:"_id firstName middleName lastName role email"}).populate({path: "receiverId", select:"_id firstName middleName lastName role email"})
                .skip((page - 1) * limit).limit(limit);


                if(page === 1){
                    totalResult = await DM.countDocuments({ receiverId: user._id, isAnswered: false, transaction_id: { $exists: true } });

                }
            }
        }else{
            if(user.role === "student"){
                dms = await DM.find({ senderId: user._id, isAnswered: true, transaction_id: { $exists: true } }).populate({path: "senderId", select:"_id firstName middleName lastName role email"}).populate({path: "receiverId", select:"_id firstName middleName lastName role email"}).sort({answerDateAndTime: -1}).
                skip((page - 1) * limit).limit(limit);


                if(page === 1){
                    totalResult = await DM.countDocuments({ senderId: user._id, isAnswered: true, transaction_id: { $exists: true } });
                }
            }
            else{
                dms = await DM.find({ receiverId: user._id, isAnswered: true, transaction_id: { $exists: true } }).populate({path: "senderId", select:"_id firstName middleName lastName role email"}).populate({path: "receiverId", select:"_id firstName middleName lastName role email"}).sort({answerDateAndTime: -1}).
                skip((page - 1) * limit).limit(limit);


                if(page === 1){
                    totalResult = await DM.countDocuments({ receiverId: user._id, isAnswered: true, transaction_id: { $exists: true } });
                    
                }
            }
        }

        console.log({totalResult})

        res.status(200).json({success:true, data:dms, totalResult:totalResult});

    }catch(err){
        res.status(200).json({success:false, msg:err.toString()})
    }
}


const answerToDM = async (req, res) => {

    try{
        const people = getPeople(req.role);

        const user = await people.findOne({ email: req.userEmail });

        if (!user) {
            throw new Error("User not found");
        }

        if(user.role !== "instructor"){
            throw new Error("Only instructors can answer DM");
        }

        if(!req.body.answer){
            throw new Error("Answer is required");
        }

        const { id } = req.params;

        const dm = await DM.findById(id);

        if (!dm) {
            throw new Error("DM not found");
        }

        const isAnswered = dm.isAnswered;

        if(isAnswered){
            throw new Error("DM already answered");
        }

        if(dm.receiverId.toString() !== user._id.toString()){
            throw new Error("You are not authorized to answer this DM");
        }

        await DM.findByIdAndUpdate(id, { isAnswered: true, answer: req.body.answer, answerDateAndTime: Date.now() });

        res.status(200).json({success:true, msg:"DM answered successfully"});

    }catch(err){
        res.status(200).json({success:false, msg:err.toString()})
    }
}


module.exports = {fetchDMOfUser, answerToDM};