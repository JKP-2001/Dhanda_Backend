const { Instructor } = require("../../Models/peoples/Instructor")
const { EncryptRes } = require("../../Utils/EncryptRes")
const logger = require("../../helpers/Logger")
const Paginator = require("../../helpers/Paginator")

const BY_RATING = 'rating'
const BY_NO_OF_INTERVIEWS_TAKEN = 'interviewsTaken'
const BY_PRICE_LOW_TO_HIGH = 'priceLth'
const BY_PRICE_HIGH_TO_LOW = 'priceHtl'


async function interviewerListController(req,res){
    let company = req.query.company 
    if (company === undefined) company = 'all'

    let sortBy = req.query.sortBy 
    if (sortBy === undefined) sortBy = BY_RATING

    const category = req.query.category === undefined || req.query.category == 'all' ? {} : {category:req.query.category}

    let allUsers = await Instructor.find({...category},'firstName lastName headline rating interviewsTaken price interviewDuration profilePic')
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

    const page = req.query.page ? req.query.page : 1
    const limit = req.query.limit ? parseInt(req.query.limit) : allUsers.length;
    // logger('array ', allUsers)
    const paginatedResult = Paginator(allUsers, page, limit);
    logger(paginatedResult)
    const encryptedResult = EncryptRes(paginatedResult)
    res.status(200).json(encryptedResult)
    
}

module.exports = {
    interviewerListController
}