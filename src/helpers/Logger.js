function logger(...args){
    if (process.env.LOGGING_ENABLED === 'true')
    console.log(...args)
}

module.exports = logger