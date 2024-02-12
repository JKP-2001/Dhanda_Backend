

function validateGenerateOrderId(parameters){
    const required = ['instructorId', 'studentId', 'amount','currency']
    required.forEach(parameter => {
       if (!parameters.hasOwnProperty(parameter)){
            throw new Error(`parameter ${parameter} is missing in request body`)
       }
    });
    const amount = Number(parameters.amount)
    if (amount === NaN){
        throw new Error('property amount is NaN')
    }
    if (amount%1 !==0){
        throw new Error('property amount should not contain decimal value')
    }
    const currency = parameters.currency
    if (currency != 'INR'){
        throw new Error('Only INR is supported as of now')
    }

    if (!parameters.hasOwnProperty('receipt')){
        parameters.receipt = "TODO: Replace with default receipt"
    }
}

module.exports = {validateGenerateOrderId}