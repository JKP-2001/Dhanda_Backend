// User type
const ROLE_INSTRUCTOR = 'instructor'
const ROLE_STUDENT = 'student'

const currency = {
    INR:'inr'
}

const convertISOtoDate = (isoString) => {
    const date = new Date(isoString);
    // british format and Asia/Kolkata timezone

    const formattedDate = date.toLocaleDateString("en-GB", {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Kolkata'
    })
    
    return formattedDate;
}

const convertISOtoTime = (isoString) => {
    const date = new Date(isoString);
    // british format
    const formattedDate = date.toLocaleTimeString("en-GB", {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        timeZone: 'Asia/Kolkata'
    });
    return formattedDate;
}

module.exports = {ROLE_INSTRUCTOR, ROLE_STUDENT, currency, convertISOtoDate, convertISOtoTime}