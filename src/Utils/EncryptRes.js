const { encryptToJson } = require("./EncryptDecrypt");

/**
 * Returns object in encrypted format. 
 * Demo usage: 
    const paginatedResult = Paginator(allUsers, page, limit);
    const encryptedResult = EncryptRes(paginatedResult)
    res.send(encryptedResult)
 */

function EncryptRes(payload){
    const encryptedData = encryptToJson(payload)
    return {
        payload:encryptedData
    }
}

module.exports = {EncryptRes}