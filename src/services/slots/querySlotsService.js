const { Instructor } = require("../../Models/peoples/Instructor")

async function getSlotDoc(instructorId, slotObjId, startTime){
    const instructor = await Instructor.findById(instructorId)    
    console.log('instructor is ', instructor)
    if (instructor == null){
        throw new Error('Instructor with id '+ instructorId+ ' not found')
    }
    
    
}

module.exports = {getSlotDoc}