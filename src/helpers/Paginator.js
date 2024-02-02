/**
 * This function would do the pagination for you. 
 * Just replace your res with Paginator(res,page,limit) before sending
 */

const logger = require("./Logger");
const {encryptToJson,decryptFromJson}= require("../Utils/EncryptDecrypt")

/**
 * 
 * @param {Array} res 
 * @param {Integer} page 
 * @param {Integer} limit 
 * @returns {Array} 
 */

function Paginator(res,page,limit){
    if (!Array.isArray(res)){
        logger('Error in paginator, res is not an array type')
        return []
    }

    const result = {}
    const startIndex = (page-1)*limit;
    const endIndex = Math.min(page*limit,res.length);

    result.result = res.slice(startIndex,endIndex);
    if (page > 1){
        result.previous = {
            page:parseInt(page)-1,
            limit:limit
        }
    }
    if (endIndex < res.length){
        result.next = {
            page:parseInt(page)+1,
            limit:limit
        }
    }
    const encryptedData=encryptToJson(result,process.env.ENCRYPT_KEY);
    return encryptedData;
}

module.exports = Paginator