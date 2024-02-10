const { Instructor } = require("../../Models/peoples/Instructor");
const { decryptFromJson } = require("../../Utils/EncryptDecrypt");
const { EncryptRes } = require("../../Utils/EncryptRes");
const { levenshteinDistance } = require("../../helpers/HelperFunctions");
const Paginator = require("../../helpers/Paginator");
const { getNonSimilarityScore } = require("../../services/interviewerListControllerService");

const BY_RATING = "rating";
const BY_NO_OF_INTERVIEWS_TAKEN = "interviewsTaken";
const BY_PRICE_LOW_TO_HIGH = "priceLth";
const BY_PRICE_HIGH_TO_LOW = "priceHtl";

async function interviewerListController(req, res) {
    try {
        const queryParameters = decryptFromJson(req.query.fetchId);
        if (queryParameters == null) {
            throw new Error("Query is not valid, ensure parameter fetchId with encrypted data is present")
        }

        let sortBy = queryParameters.sortBy;
        if (sortBy === undefined) sortBy = BY_RATING;
        
        const category =
            queryParameters.category === undefined ||
            queryParameters.category == "all"
                ? {}
                : { category: queryParameters.category };
        
        const companyNames = queryParameters.companies
        console.log('company names ', companyNames)

        let instructors = await Instructor.find(
            { ...category},
            "firstName lastName headline rating interviewsTaken price interviewDuration profilePic experience"
        )
        .populate('experience')

        console.log('instructors array is ', instructors)
        let matchInstructors = instructors.filter(
            (instructor,idx)=>{
                if (companyNames.length == 0) return true
                let instructorCompanyNames = []
                instructor.experience.forEach((item,idx)=>{
                    instructorCompanyNames.push(item.company)
                })
                const nomatch = getNonSimilarityScore(companyNames, instructorCompanyNames)
                console.log("no match value is " , nomatch)
                return nomatch == 0
            }
        )
        matchInstructors = matchInstructors.map(
            (instructor)=>{
                delete instructor._doc.experience
                return {...instructor._doc}
            }
        )
        console.log('matchInstructor ', matchInstructors)
        
        
        switch (sortBy) {
            case BY_RATING: {
                matchInstructors = matchInstructors.sort(
                    (a, b) => parseFloat(b.rating) - parseFloat(a.rating)
                );
                break;
            }
            case BY_NO_OF_INTERVIEWS_TAKEN: {
                matchInstructors = matchInstructors.sort(
                    (a, b) =>
                        parseInt(b.interviewsTaken) -
                        parseInt(a.interviewsTaken)
                );
                break;
            }
            case BY_PRICE_HIGH_TO_LOW: {
                matchInstructors = matchInstructors.sort(
                    (a, b) => parseFloat(b.price) - parseFloat(a.price)
                );
                break;
            }
            case BY_PRICE_LOW_TO_HIGH: {
                matchInstructors = matchInstructors.sort(
                    (a, b) => parseFloat(a.price) - parseFloat(b.price)
                );
                break;
            }
        }

        const page = queryParameters.page ? queryParameters.page : 1;
        const limit = queryParameters.limit
            ? parseInt(queryParameters.limit)
            : matchInstructors.length;
        // console.log('array ', matchInstructors)
        const paginatedResult = Paginator(matchInstructors, page, limit);

        const encryptedResult = EncryptRes(paginatedResult);
        res.status(200).json(encryptedResult);
    } catch (e) {
        console.error('Error at interviewer list controller : ', e)
        res.status(400).json({success:false, msg:e})
    }
}

module.exports = {
    interviewerListController,
};
