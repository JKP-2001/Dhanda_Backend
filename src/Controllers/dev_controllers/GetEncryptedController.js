const { encryptToJson } = require("../../Utils/EncryptDecrypt")

/**
 * @openapi
 * tags:
 *   - name: Dev
 *     description: Only available in dev mode
 * /convert:
 *   post:
 *     summary: Convert json in body to hash
 *     parameters:
 *       - in: header
 *         name: security-key
 *         default: dhanda
 *     tags:
 *       - Dev 
 *     requestBody:
 *       required: true
 *       content: 
 *         application/json:
 *           schema: {}
 *     responses:
 *       '200':
 *         description: Successfully converted to encrypted
 *       '400':
 *         description: Some Error
 */

function getEncryptedController(req,res){
    try {
        const body = req.body
        const urlEncode = req.query.urlEncode ? req.query.urlEncode === 'true' : false
        console.log('received body is ', body)
        console.log('and urlEncode ', urlEncode)
        let payload = encryptToJson(body)
        if (urlEncode) payload = encodeURIComponent(payload)

        res.status(200).send(payload)
    }
    catch(e){
        res.status(400).json({success:false, msg:e})
    }
}

module.exports = {getEncryptedController}