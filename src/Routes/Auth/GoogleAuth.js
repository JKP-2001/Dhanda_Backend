const passport = require('passport');
const ensureAuthenticated = require('../../Middlewares/ensureAuthenticated');
const { getPeople } = require('../../helpers/HelperFunctions');

const { Instructor } = require('../../Models/peoples/Instructor');
const { Student } = require('../../Models/peoples/Student');
const { encryptToJson } = require('../../Utils/EncryptDecrypt');
const { ROLE_INSTRUCTOR, ROLE_STUDENT } = require('../../Utils/Constants');

let ROLE = "";

const setRoleMiddleware = (req, res, next) => {
  try {
    const role = req.query.role;

    if (!role) {
      throw new Error("Role not found in query parameters");
    }

    ROLE = role;
    req.ANTIUSER = false; // Initialize ANTIUSER for each request
    next();

  } catch (error) {
    res.status(400).json({ success: false, msg: error.toString() });
  }
}

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

const GoogleStrategy = require('passport-google-oauth20').Strategy;

const googleAuthRouter = require("express").Router();

const FRONT_END_URL = process.env.FRONT_END_URL

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true,
      stateless: true,
    },
    async function (req, accessToken, refreshToken, profile, done) {
      try {
        const people = getPeople(ROLE);
        const antiPeople = getPeople(ROLE === ROLE_INSTRUCTOR ? ROLE_STUDENT : ROLE_INSTRUCTOR);
        const email = profile._json.email;
        const user = await people.findOne({ email });
        const antiUser = await antiPeople.findOne({ email });

        if (antiUser) {
          req.ANTIUSER = true;
          const error = new Error("Anti-user found");
          error.isAntiUser = true;
          return done(error);
        }



        if (user) {
          
          if (user.socialLoginId === profile.id) {
            return done(null, profile);
          }
          req.nonSocialUser = true;
          const error = new Error("Non-social user found");
          error.isNonSocialUser = true;
          return done(error);
        }

        const name = profile._json.given_name;
        const firstName = name.split(" ")[0];
        const lastName = name.split(" ")[2] ? name.split(" ")[2] : name.split(" ")[1] ? name.split(" ")[1] : " ";
        const middleName = name.split(" ")[2] ? name.split(" ")[1] : " ";

        const newDATA = {
          email,
          firstName,
          middleName,
          lastName,
          role: ROLE,
          socialLoginId: profile.id,
          loginProvider: "google",
          profilePic: profile._json.picture,
        }

        const newUser = await people.create(newDATA);

        if (!newUser) {
          throw new Error("User not created");
        }



        return done(null, profile);
      } catch (error) {
        console.log({ error });
        return done(error);
      }
    })
);

googleAuthRouter.get('/auth/google', ensureAuthenticated, setRoleMiddleware,
  passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

googleAuthRouter.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  async function (req, res) {
    if (req.ANTIUSER) {
      return res.redirect(`${FRONT_END_URL}/google/auth/callback?status=antiuser`);
    }

    if (req.nonSocialUser) {
      return res.redirect(`${FRONT_END_URL}/google/auth/callback?status=nonSocialUser`);
    }

    const unique_data = {
      email: req.user._json.email,
      role: ROLE,
      createdAt: Date.now()
    }

    const unique = encryptToJson(unique_data, process.env.ENCRYPT_KEY);

    const urlEncryptedToken = encodeURIComponent(unique);

    res.cookie('authToken', unique, { secure: true, sameSite: 'None' });

    res.redirect(`${FRONT_END_URL}/google/auth/callback?status=success&token=${urlEncryptedToken}`);
  }
);

googleAuthRouter.get('/auth/google/logout', (req, res, next) => {



  try {
    const authToken = req.cookies.authToken;


    if (!authToken) {
      throw new Error("authToken not found");
    }

    res.clearCookie('authToken');

    req.logout(function (err) {
      if (err) {
        res.status(400).json({ success: false, msg: err.toString() });
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, msg: err.toString() });
  }

});

// Error handling middleware
googleAuthRouter.use((err, req, res, next) => {
  if (err.isAntiUser) {
    return res.redirect(`${FRONT_END_URL}/google/auth/callback?status=antiuser`);
  }

  if (err.isNonSocialUser) {
    return res.redirect(`${FRONT_END_URL}/google/auth/callback?status=nonSocialUser`);
  }
});

module.exports = googleAuthRouter;
