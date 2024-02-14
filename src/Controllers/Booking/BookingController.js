const { FixedSlots } = require("../../Models/slots/fixedSlots");
const { RepeatingSlots } = require("../../Models/slots/repeatingSlots");
const utc = require('dayjs/plugin/utc');
const dayjs = require('dayjs');
const { encryptToJson } = require("../../Utils/EncryptDecrypt");
const moment = require("moment");

const DAYS_ARRAY = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
const DAYS_DICT = {
  "Sunday":0,
  "Monday":1,
  "Tuesday":2,
  "Wednesday":3,
  "Thursday":4,
  "Friday":5,
  "Saturday":6
} 

const isIntersecting = (startDate1,endDate1,startDate2,endDate2) => {
  const sd1 = startDate1.hour().toString().concat(startDate1.minute().toString());
  const ed1 = endDate1.hour().toString().concat(endDate1.minute().toString());
  const sd2 = startDate2.hour().toString().concat(startDate2.minute().toString());
  const ed2 = endDate2.hour().toString().concat(endDate2.minute().toString());
  console.log("sd1 = ",sd1,", ed1 = ",ed1,", sd2 = ",sd2,", ed2 = ",ed2)
  
  if(sd1>ed1 && sd2>ed2){
    console.log("Intersection 1")
    return true;
  }
  else if((sd1>ed1 || sd2>ed2) && sd2>ed1 && sd1>ed2){
    console.log("No Intersection")
    return false
  }
  else if(sd1>ed2 || sd2>ed1){
    console.log("No Intersection 2")
    return false
  }
  console.log("Intersection 2")
  return true
}

const checkIntersectionWithSlot = (slot,startDate,endDate,onlyOne = false)=>{
  console.log("Inside checkIntersectionWithSlot")
  if(slot.length===0)return false
  if(onlyOne){
    return isIntersecting(startDate,endDate,moment(slot[0]["startTime"]),moment(slot[0]["endTime"]))
  }
  for(let i=0;i<slot.length;i++){
    const slotStart = moment(slot[i]["startTime"])
    const slotEnd = moment(slot[i]["endTime"])
    if(isIntersecting(startDate,endDate,slotStart,slotEnd)){
      return true
    }
  }
  return false;
  // In this function, False means possible to create slot
}

const CheckForRepeatingSlots = async(startTimeStamp,endTimeStamp)=>{
  console.log("Inside CheckForRepeatingSlots")
  const startDateMoment = moment(startTimeStamp)
  const endDateMoment = moment(endTimeStamp)
  const startDayName = startDateMoment.format('dddd');
  const startHour = startDateMoment.hour()
  const slot3 = await RepeatingSlots.find(
    {
      "day":startDayName
    }
  )
  
  console.log("slot3 = ",slot3)
  if(checkIntersectionWithSlot(slot3,moment(startTimeStamp),moment(endTimeStamp))){
    console.log("arre ye to true ho gaya")
    return false
  }
  let slot4 = []
  if(startHour<=1){
    slot4 = await RepeatingSlots.find({
      "day":DAYS_ARRAY[DAYS_DICT[startDayName]-1>=0?DAYS_DICT[startDayName]-1:6]
    })
    slot4.sort((a,b)=>{
      const aMoment = moment(a["startTime"])
      const bMoment = moment(b["startTime"])
      const aStartHour = aMoment.hour()
      const bStartHour = bMoment.hour()
      const aMinutes = aMoment.minute()
      const bMinutes = bMoment.minute()
      return (aStartHour>bStartHour)||(aStartHour==bStartHour && aMinutes>bMinutes)
    })
  }
  else{
    slot4 = await RepeatingSlots.find({
      "day":DAYS_ARRAY[(DAYS_DICT[startDayName]+1)%7]
    })
    slot4.sort((a,b)=>{
      const aMoment = moment(a["startTime"])
      const bMoment = moment(b["startTime"])
      const aStartHour = aMoment.hour()
      const bStartHour = bMoment.hour()
      const aMinutes = aMoment.minute()
      const bMinutes = bMoment.minute()
      return (aStartHour<bStartHour)||(aStartHour==bStartHour && aMinutes<bMinutes)
    })
  }
  console.log("slot4 = ",slot4)
  if(checkIntersectionWithSlot(slot4,moment(startTimeStamp),moment(endTimeStamp),true)){
    return false
  }
  return true
  // false means not possible to create slots
}

const CheckForFixedSlots = async(startDateMoment, endDateMoment)=>{
  console.log("Inside CheckForFixedSlots")
    let slots = [{"_id":"#222#","startTime":new Date(startDateMoment.toISOString()),"endTime":new Date(endDateMoment.toISOString())}]
    // console.log("startDay = ",startDayName," ,endDay = ",endDayName)
    const slot1 =  await FixedSlots.find({
      endTime: {
        $gte: new Date(startDateMoment.toISOString()),
      }
    }).limit(40)
    const slot2 = await FixedSlots.find({
      startTime: {
        $lte: new Date(endDateMoment.toISOString()),
      }
    }).limit(40)
    slots.push(...slot1)  
    const myMap = {};
    for(let i=0;i<slot1.length;i++){
      myMap[slot1[i]["_id"]] = 1
    }
    for(let i=0;i<slot2.length;i++){
      if(!myMap[slot2[i]["_id"]]){
        slots.push(slot2[i]);
        myMap[slot2[i]["_id"]] = 1
      }
    }
    slots.sort((s1, s2) => s1.startTime - s2.startTime);
    console.log("slots = ",slots)
    for(let i=1;i<slots.length;i++){
      if(slots[i]["startTime"]<slots[i-1]["endTime"]){
        return false
        // Not possible to create slot
      }
    }
    return true
}


const checkRepeatingSlotsforFixedSlots = async(startTimeStamp,endTimeStamp)=>{
  console.log("Inside checkRepeatingSlotsforFixedSlots")
  const startDate = moment(startTimeStamp)
  const endDate = moment(endTimeStamp)
  const startDayName = startDate.format("dddd")
  const slot1 = await FixedSlots.find({
    "day":startDayName
  })
  const modifiedSlot1 = slot1.filter((slot)=>{
    return slot["endTime"]>=startDate
  })
  console.log("modifiedSlot1 = ",modifiedSlot1)
  let slot2 = []
  if(startDate.hour()<=1 ){
    slot2 = await FixedSlots.find({
      "day":DAYS_ARRAY[DAYS_DICT[startDayName]-1>=0?DAYS_DICT[startDayName]-1:6]
    })
    slot2.sort((a,b)=>{
      const aMoment = moment(a["startTime"])
      const bMoment = moment(b["startTime"])
      const aStartHour = aMoment.hour()
      const bStartHour = bMoment.hour()
      const aMinutes = aMoment.minute()
      const bMinutes = bMoment.minute()
      return (aStartHour>bStartHour)||(aStartHour==bStartHour && aMinutes>bMinutes)
    })
  }
  else{
    slot2 = await FixedSlots.find({
      "day":DAYS_ARRAY[(DAYS_DICT[startDayName]+1)%7]
    })
    slot2.sort((a,b)=>{
      const aMoment = moment(a["startTime"])
      const bMoment = moment(b["startTime"])
      const aStartHour = aMoment.hour()
      const bStartHour = bMoment.hour()
      const aMinutes = aMoment.minute()
      const bMinutes = bMoment.minute()
      return (aStartHour<bStartHour)||(aStartHour==bStartHour && aMinutes<bMinutes)
    })
  }
  console.log("slot2 = ",slot2)
  if(checkIntersectionWithSlot(modifiedSlot1,startDate,endDate)){
    return false
  }
  if(checkIntersectionWithSlot(slot2,startDate,endDate,true)){
    return false
  }
  return true
  // False means not possible to create slot
}

const createSlots = async (req, res) => {
  try {
    const startDateMoment = moment(req.body.startTimeStamp)
    const endDateMoment = moment(req.body.endTimeStamp)
    const timeDifference = endDateMoment - startDateMoment 
    const startDayName = startDateMoment.format('dddd');
    const endDayName = endDateMoment.format('dddd');
    const startHour = startDateMoment.hour()
    const endHour = endDateMoment.hour()
    const repeating = req.body.repeating
    
    const minutes = Math.floor((timeDifference % (1000)) / (1000 * 60));
    console.log("timeDifference = ",minutes)
    if(minutes<45){
      throw new Error("The time interval is lesser than 45 minutes")
    }
    if(minutes>90){
      throw new Error("The time interval is greater than 90 minutes")
    }
    if(!await CheckForFixedSlots(startDateMoment, endDateMoment)){
      throw new Error("The slot is conflicting with other free slots, try with different one")
    }
    console.log("Fixed Slots have been checked")

    if(!await CheckForRepeatingSlots(req.body.startTimeStamp, req.body.endTimeStamp, startDayName)){
      throw new Error("The slot is conflicting with other free slots, try with different one")
    }
    console.log("CheckForRepeatingSlots have been completed")
    if(repeating){
      if(!await checkRepeatingSlotsforFixedSlots(req.body.startTimeStamp, req.body.endTimeStamp)){
        throw new Error("The slot is conflicting with other free slots, try with different one")
      }
      console.log("checkRepeatingSlotsforFixedSlots have been completed")
    }

    // Create a New slot
    if(!repeating){
      const newSlot =  new FixedSlots({"startTime":req.body.startTimeStamp,"endTime":req.body.endTimeStamp,"day":
    startDayName})
      await newSlot.save();
      return res.status(200).json({success:true,data:newSlot})
    }
    const newSlot = new RepeatingSlots({"startTime":req.body.startTimeStamp,"endTime":req.body.endTimeStamp,"day":
    startDayName})
      await newSlot.save();
      return res.status(200).json({success:true,data:newSlot})

  } catch (error) {
    res.status(400).json({ success: false, msg: error.toString() });
  }
};

const getSlots = async(req,res)=>{
  try{
    if(req.body.repeating){
      const result = await RepeatingSlots.find({})
      if(!result){
        throw new Error("unable to fetch all the slots, try again")
      }
      return res.status(200).json({success:true, data:result})
    }
    const result = await FixedSlots.find({})
    if(!result){
      throw new Error("unable to fetch all the slots, try again")
    }
    return res.status(200).json({success:true, data:result})
  }catch(error){
    res.status(400).json({success:false,msg:error.toString()})
  }
}

const deleteSlotById = async(req,res)=>{
  try{
    await FixedSlots.findByIdAndDelete(req.body.id)
    return res.status(200).json({"success":true,data:"slot had been deleted"})
  }catch(error){
    return res.status(400).json({success:false,msg:error.toString()})
  }
}

const deleteAllSlots = async(req, res)=>{
  try{
    if(req.body.repeating){
      await RepeatingSlots.deleteMany({})
    }
    else{
      await FixedSlots.deleteMany({})
    }
    return res.status(200).json({success:true,data:"deleted all the slots"})
  }catch(error){
    return res.status(400).json({success:false,msg:error.toString()})
  }
}

const updateSlots = async(req,res) =>{
  try{
    const _id = req.body.id;
    const startDate = moment(req.body.startTimeStamp);
    const endDate = moment(req.body.endTimeStamp);
    console.log("StartDate = ",startDate,", endDate = ",endDate)
    const repeating = req.body.repeating
    const timeDifference = endDate - startDate 
    console.log("TimeDifference = ",timeDifference)
    const minutes = timeDifference/(1000 * 60);
    let previousSlot
    if(repeating){
      previousSlot = await RepeatingSlots.findById(_id)
      // console.log("previousSlot = ",previousSlot)
      if(!previousSlot){
        throw new Error("Slot didn't exist")
      }
      const booked =  previousSlot["bookings"]
      for(let i=0;i<booked.length;i++){
        if(moment(booking[i]).isBefore(startDate)){
          throw new Error("Can't update the slots, there are some slots which are already booked")
        }
      }
    }
    else{
      previousSlot = await FixedSlots.findById(_id)
      if(!previousSlot){
        throw new Error("Slot didn't exist")
      }
      if(previousSlot["isBooked"]){
        throw new Error("Can't update the slots, The slot has been booked by a Student")
      }
      if(previousSlot["suspended"]){
        throw new Error("Request has been failed, try again!")
      }
    }
    console.log("timeDifference = ",minutes)
    if(minutes<45){
      throw new Error("Can't update the slots, the time interval is lesser than 45 minutes")
    }
    if(minutes>90){
      throw new Error("Can't update the slots, the time interval is greater than 90 minutes")
    }
    if(!await CheckForFixedSlots(startDate, endDate)){
      throw new Error("Can't update the slots, the slot is conflicting with other free slots, try with different one")
    }
    console.log("Fixed Slots have been checked")

    if(!await CheckForRepeatingSlots(req.body.startTimeStamp, req.body.endTimeStamp, startDate.format('dddd'))){
      throw new Error("Can't update the slots, the slot is conflicting with other free slots, try with different one")
    }
    console.log("CheckForRepeatingSlots have been completed")
    if(repeating){
      if(!await checkRepeatingSlotsforFixedSlots(req.body.startTimeStamp, req.body.endTimeStamp)){
        throw new Error("Can't update the slots, the slot is conflicting with other free slots, try with different one")
      }
      console.log("checkRepeatingSlotsforFixedSlots have been completed")
    }
    
    // Create a slot, in case repeating 
    if(!repeating){
      const newSlot =  new FixedSlots({"startTime":req.body.startTimeStamp,"endTime":req.body.endTimeStamp,"day":
    startDayName})
      await newSlot.save();
      return res.status(200).json({success:true,data:newSlot})
    }
    const newSlot = new RepeatingSlots({"startTime":req.body.startTimeStamp,"endTime":req.body.endTimeStamp,"day":
    startDayName})
    await newSlot.save();
    return res.status(200).json({success:true,data:newSlot})
  }catch(error){
    return res.status(400).json({success:false,msg:error.toString()})
  }
}

const testingMomentJs = async(req,res)=>{
  try{
    const t1 = moment(req.body.timeStamp1);
    const t2 = moment(req.body.timeStamp2);
    const t3 = moment(req.body.timeStamp3);
    const t4 = moment(req.body.timeStamp4);
    
    const startDate1 = t1.format("HH:mm");
    const endDate1 = t2.format("HH:mm");
    const startDate2 = t3.format("HH:mm");
    const endDate2 = t4.format("HH:mm");
    const sd1 = t1.hour().toString().concat(t1.minute().toString());
    const ed1 = t2.hour().toString().concat(t2.minute().toString());
    const sd2 = t3.hour().toString().concat(t3.minute().toString());
    const ed2 = t4.hour().toString().concat(t4.minute().toString());
    console.log("sd1 = ",sd1,", ed1 = ",ed1,", sd2 = ",sd2,", ed2 = ",ed2)
    
    if(sd1>ed1 && sd2>ed2){
      console.log("Intersection 1")
    }
    else if((sd1>ed1 || sd2>ed2) && sd2>ed1 && sd1>ed2){
      console.log("No Intersection")
    }
    else if(sd1>ed2 || sd2>ed1){
      console.log("No Intersection 2")
    }
    else{
      console.log("Intersection 2")
    }
    return res.status(200).json({ "msg": "ho gaya" });


  }catch(error){
    res.status(400).json({success:false,msg:error.toString()})
  }
}
module.exports={createSlots, getSlots, deleteSlotById, deleteAllSlots, testingMomentJs, updateSlots}