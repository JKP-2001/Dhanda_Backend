
const { generateOrderIdController } = require("../../src/Controllers/Transactions/GenerateOrderIdController");

test("controller ",async ()=>{
    const req = {body:{
        amount:3000,
        currency:'INR'
    }}
    let status = 0
    let json = {}
    const res={
        status:(x)=>{
            status = x
            return {
                json:(e)=>{
                    json = e
                }
            }
        }
    };
    await generateOrderIdController(req,res)
    expect(status).toBe(200)
})