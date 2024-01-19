const express = require('express')
const { User } = require('../Models/User')
const router = express.Router()
const {interviewerListController} = require('../controllers/InterviewerListController')

router.get('/all',interviewerListController) 

router.post('/',(req,res)=>{
    const user = new User(req.body)
    user.save().then(()=>{res.send('added to db')})
    .catch((e)=>{res.send('Error'+e)})
})


module.exports = router