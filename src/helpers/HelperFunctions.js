// import { Instructor } from "../Models/peoples/Instructor";

const { Instructor } = require("../Models/peoples/Instructor");
const { Student } = require("../Models/peoples/Student");
const { ROLE_INSTRUCTOR, ROLE_STUDENT } = require("../Utils/Constants");
const { decryptFromJson } = require("../Utils/EncryptDecrypt");




const getPeople = (role)=>{
    let people;
    if (role ==  ROLE_INSTRUCTOR){
        people = Instructor 
    }
    else if (role == ROLE_STUDENT){
        people = Student 
    }
    else {
        throw new Error("Incorrect role value")
    }
    return people

}

const getRoleFromReq = (req)=>{
    const authToken = req.headers["auth-token"]
    if (authToken == undefined)
        throw new Error("auth-token header missing")
    const decryptedAuthToken = decryptFromJson(authToken)
    if (!decryptedAuthToken.hasOwnProperty('role')){
        throw new Error("role property in auth token is missing")
    }
    return decryptedAuthToken.role
}

module.exports = {getPeople, getRoleFromReq}