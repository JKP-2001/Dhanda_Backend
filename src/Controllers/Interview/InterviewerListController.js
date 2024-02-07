const { Instructor } = require("../../Models/peoples/Instructor");
const { decryptFromJson } = require("../../Utils/EncryptDecrypt");
const { EncryptRes } = require("../../Utils/EncryptRes")
const logger = require("../../helpers/Logger")
const Paginator = require("../../helpers/Paginator")


const BY_RATING = "rating";
const BY_NO_OF_INTERVIEWS_TAKEN = "interviewsTaken";
const BY_PRICE_LOW_TO_HIGH = "priceLth";
const BY_PRICE_HIGH_TO_LOW = "priceHtl";

async function interviewerListController(req, res) {
  const queryParameters = decryptFromJson(req.query.fetchId)
  console.log("query is " , req.query, "and decrypted ", queryParameters)
  let sortBy = queryParameters.sortBy;
  if (sortBy === undefined) sortBy = BY_RATING;

  const category =
    queryParameters.category === undefined || queryParameters.category == "all"
      ? {}
      : { category: queryParameters.category };
  
  const companyQuery = 
    queryParameters.companies.length > 0 ? 
    {company:{$in:queryParameters.companies}} :
    {}


  let allUsers = await Instructor.find({...category, ...companyQuery},'firstName lastName headline rating interviewsTaken price interviewDuration profilePic')
  // allUsers = allUsers.filter((val,idx)=>val.role == "tutor")
  switch (sortBy){
      case BY_RATING:{
          allUsers = allUsers.sort((a,b)=>parseFloat(b.rating)-parseFloat(a.rating))
          break
      }
      case BY_NO_OF_INTERVIEWS_TAKEN:{
          allUsers = allUsers.sort((a,b)=>parseInt(b.interviewsTaken)-parseInt(a.interviewsTaken))
          break
      }
      case BY_PRICE_HIGH_TO_LOW:{
          allUsers = allUsers.sort((a,b)=>parseFloat(b.price)-parseFloat(a.price))
          break
      }
      case BY_PRICE_LOW_TO_HIGH:{
          allUsers = allUsers.sort((a,b)=>parseFloat(a.price)-parseFloat(b.price))
          break
      }
  }


  const page = queryParameters.page ? queryParameters.page : 1
  const limit = queryParameters.limit ? parseInt(queryParameters.limit) : allUsers.length;
  // logger('array ', allUsers)
  const paginatedResult = Paginator(allUsers, page, limit);
  
  const encryptedResult = EncryptRes(paginatedResult)
  res.status(200).json(encryptedResult)

}

module.exports = {
  interviewerListController,
}
