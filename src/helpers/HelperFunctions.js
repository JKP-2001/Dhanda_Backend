// import { Instructor } from "../Models/peoples/Instructor";

const JSONTransport = require("nodemailer/lib/json-transport");
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


const levenshteinDistance = (s, t) => {
    if (!s.length) return t.length;
    if (!t.length) return s.length;
    s = s.toLowerCase()
    t = t.toLowerCase()
    const arr = [];
    for (let i = 0; i <= t.length; i++) {
      arr[i] = [i];
      for (let j = 1; j <= s.length; j++) {
        arr[i][j] =
          i === 0
            ? j
            : Math.min(
                arr[i - 1][j] + 1,
                arr[i][j - 1] + 1,
                arr[i - 1][j - 1] + (s[j - 1] === t[i - 1] ? 0 : 1)
              );
      }
    }
    return arr[t.length][s.length];
  };


module.exports = {getPeople, getRoleFromReq, levenshteinDistance}