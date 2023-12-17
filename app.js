require("dotenv").config();

const express = require("express");
const app = express();

const mongoose = require("mongoose");

const methodOverride = require("method-override");

const morgan = require("morgan")

const PORT = process.env.PORT;

const DB_URI = process.env.DB_URI;


app.use(express.json());
app.use(methodOverride())
app.use(morgan("dev"));
app.use('/uploads', express.static('uploads'));

// enable CORSn
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header(
        "Access-Control-Allow-Methods",
        "GET,HEAD,OPTIONS,POST,PUT,DELETE,PATCH"
    );
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization, security-key, auth-token,"
    );
    next();
});

app.use((req, res, next) => {

    if (req.originalMethod !== "GET" && req.headers["security-key"] !== process.env.SECURITY_KEY) {
        res.json({"message": "You are not authorized"});
        return;
    }
    next();
});


const connect = async ()=>{

    try{
        
        const conn = await mongoose.connect(DB_URI);
        console.log("DB connected successfully");

    }
    
    catch(err){
        console.log(err.toString());
    }
}


app.listen(PORT,(err)=>{
    if(err){
        console.log(err.toString());
    }
    else{
        connect();
        console.log(`server started on port ${PORT}`);
    }
});