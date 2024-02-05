const { decryptFromJson } = require("../Utils/EncryptDecrypt");


/**
 * Decrypts the Body and Query data to normal form. 
 * Expects query to be in the form {payload:<encrypted data>}
 * and also the body to be in the form {payload:<encrypted data>}.
 * Transforms the query and body to decrypted json data, i.e. now 
 * the body and query will be decrypted value in json format. 
 */

async function DecryptReq(req,res,next){
    if (req.body && req.body.hasOwnProperty('payload')){
        try {
        const decryptedReqBody = decryptFromJson(req.body.payload) 
        req.body = decryptedReqBody
        }
        catch (e){
            console.error('Error on DecryptDrq Middleware at body part :',e);
        }
    }

    if (req.query && req.query.hasOwnProperty('payload')){
        try {
            const decryptedQuery = decryptFromJson(req.query.payload)
            req.query = decryptedQuery
        }
        catch(e){
            console.error('Error in DecryptReq at query part :',e)
        }
    }
    next()
}

module.exports = DecryptReq 