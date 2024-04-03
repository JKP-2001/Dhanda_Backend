const { Instructor } = require("../../Models/peoples/Instructor");
const {
    decryptFromJson,
    encryptToJson,
} = require("../../Utils/EncryptDecrypt");
const { EncryptRes } = require("../../Utils/EncryptRes");
const Paginator = require("../../helpers/Paginator");
const {
    getNonSimilarityScore,
} = require("../../services/interviewerListControllerService");

const BY_RATING = "Rating";
const BY_NO_OF_INTERVIEWS_TAKEN = "interviewsTaken";
const BY_PRICE_LOW_TO_HIGH = "Price Low to High";
const BY_PRICE_HIGH_TO_LOW = "Price High to Low";

/**
 * @openapi
 * tags:
 *   - name: Interviewers
 *     description: All apis related to interviewers
 * /api/v1/interviewers/all:
 *   get:
 *     summary: Retrieve information based on payload.
 *     tags:
 *       - Interviewers
 *     description: |
 *       Retrieves information based on the provided payload query parameter.
 *     parameters:
 *       - in: query
 *         name: fetchId
 *         required: true
 *         schema:
 *           type: string
 *         description: write encrypted hash with data as {sortBy, companies, category}
 *     responses:
 *       '200':
 *          description: You will get valid result
 *       '400':
 *         description: some
 */

async function interviewerListController(req, res) {
    try {
        const queryParameters = decryptFromJson(req.query.fetchId);
        
        if (queryParameters == null) {
            throw new Error(
                "Query is not valid, ensure parameter fetchId with encrypted data is present"
            );
        }

        let sortBy = queryParameters.sortBy;
        if (sortBy === undefined || sortBy === ""||sortBy===null) sortBy = BY_RATING;

        const category =
            queryParameters.category === undefined ||
            queryParameters.category == "all"
                ? {}
                : { category: queryParameters.category };

        const companyNames = queryParameters.companies;
        console.log("company names ", companyNames);

        let instructors = await Instructor.find(
            { ...category },
            "firstName lastName headline rating interviewsTaken price interviewDuration profilePic experience"
        ).populate("experience");

        console.log("instructors array is ", instructors);
        let matchInstructors = instructors.filter((instructor, idx) => {
            if (companyNames.length == 0) return true;
            let instructorCompanyNames = [];
            instructor.experience.forEach((item, idx) => {
                instructorCompanyNames.push(item.company);
            });
            const nomatch = getNonSimilarityScore(
                companyNames,
                instructorCompanyNames
            );
            console.log("no match value is ", nomatch);
            return nomatch == 0;
        });
        matchInstructors = matchInstructors.map((instructor) => {
            delete instructor._doc.experience;
            return { ...instructor._doc };
        });
        console.log("matchInstructor ", matchInstructors);

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
        let results = Paginator(matchInstructors, page, limit);

        if (process.env.DEVELOPMENT === "false")
            results = encryptToJson(results);
        res.status(200).json({ success: true, data: results });
    } catch (e) {
        console.error("Error at interviewer list controller : ", e);
        res.status(400).json({ success: false, msg: e.toString() });
    }
}

module.exports = {
    interviewerListController,
};
