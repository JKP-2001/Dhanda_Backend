const express = require('express')
const { createSlots, deleteSlotById, deleteAllSlots, getSlots, testingMomentJs, updateSlots } = require('../Controllers/Booking/BookingController')
const { checkUser } = require('../Middlewares/checkUser')
const bookingRouter = express.Router()

bookingRouter.post('/create-slots',checkUser,createSlots) 
bookingRouter.get('/get-slots',checkUser,getSlots)
bookingRouter.delete('/delete-slot-by-id',checkUser, deleteSlotById)
bookingRouter.delete('/delete-all-slots',checkUser, deleteAllSlots)
bookingRouter.get('/testing-moment-js', testingMomentJs)
bookingRouter.patch('/update-slots', updateSlots)


module.exports = bookingRouter