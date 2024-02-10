require("dotenv").config();

const express = require("express");
const cookieParser = require('cookie-parser');

const app = express();
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const morgan = require("morgan");
const interviwerRouter = require("./Routes/Interviewers");
const { getCurrentDate } = require("./Utils/SendMail");

const authRouter = require("./Routes/Auth/AuthRoutes");
const userRouter = require("./Routes/User/userRoutes");
const googleAuthRouter = require("./Routes/Auth/GoogleAuth");

const DecryptReq = require("./Middlewares/DecryptReq");
const { decryptFromJson } = require("./Utils/EncryptDecrypt");

process.env.AWS_SDK_JS_SUPPRESS_MAINTENANCE_MODE_MESSAGE = '1';

const PORT = process.env.PORT;

const DB_URI = process.env.DB_URI;

const BASE_URL = process.env.BASE_URL;

const passport = require("passport");

const session = require('express-session');
const microsoftAuthRouter = require("./Routes/Auth/MicrosoftAuth");
const postRouter = require("./Routes/Post/PostRoutes");
const { getEncryptedController } = require("./Controllers/dev_controllers/GetEncryptedController");





app.use(express.json());
app.use(methodOverride());
app.use(morgan("dev"));
app.use("/src/uploads", express.static("./src/uploads"));
app.use(cookieParser());


app.use(session({
  secret: 'hello google',
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());


passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});






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

//Only in DEV mode
if (process.env.DEVELOPMENT === 'true'){ 
  //assuing dev mode
    const swaggerUi = require('swagger-ui-express')
    const swaggerConfig = require("./configs/SwaggerConfig");
    app.use('/api-docs',swaggerUi.serve,swaggerUi.setup(swaggerConfig))
    app.post('/convert', getEncryptedController)
}


app.use((req, res, next) => {
  if (
    req.originalMethod !== "GET" &&
    req.headers["security-key"] !== process.env.SECURITY_KEY
  ) {
    res.json({ message: "You are not authorized" });
    return;
  }
  next();
});


app.use(DecryptReq);

const connect = async () => {
  try {
    const conn = await mongoose.connect(DB_URI);
    console.log("DB connected successfully");
  } catch (err) {
    console.log(err.toString());
  }
};

app.use(BASE_URL + "interviewers", interviwerRouter);

app.use(BASE_URL + "auth", authRouter);

app.use(BASE_URL + "user", userRouter);

app.use(BASE_URL, postRouter);

app.use(googleAuthRouter);

app.use(microsoftAuthRouter);

app.listen(PORT, async (err) => {
  const temp = getCurrentDate();



  if (err) {
    console.log(err.toString());

  } else {
    
    console.log(`server started on ${temp}`);
    console.log("DB Connection Started");
    await connect();
    console.log(`server started on port ${PORT}`);
    console.log('\x1b[34m%s\x1b[0m', 'View the apis at localhost:5000/api-docs');

  }
});
