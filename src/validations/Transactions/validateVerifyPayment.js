
function validateVerifyPayment(parameters){
    const required = ['orderId', 'checkoutId', 'signature']
    required.forEach((parameter, idx)=>{
        if (!parameters.hasOwnProperty(parameter)){
            throw new Error(`parameter ${parameter} is missing in request body`)
        }

    })

}

module.exports = {validateVerifyPayment}