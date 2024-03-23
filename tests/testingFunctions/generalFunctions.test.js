const { connectMongoDb } = require("../../src/configs/configureMongoDb");
const { getSlotDoc } = require("../../src/services/slots/querySlotsService")



beforeAll(
    async ()=>{
        await connectMongoDb()
        console.log('configured mongo')
    }
)

test('Query slots service test', async () => { 
    try{
        const response = await getSlotDoc('65c26ad62b6203aca3381d16','asdfas','q234');
        expect(response).not.toBeNull()
    }
    catch(e){
        console.error('Error is ', e.toString())
        expect(true).toBe(false)
    }
 })