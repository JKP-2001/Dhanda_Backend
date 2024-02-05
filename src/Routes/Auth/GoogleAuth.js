const passport = require('passport');
const ensureAuthenticated = require('../../Middlewares/ensureAuthenticated');


const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET

const GoogleStrategy = require('passport-google-oauth20').Strategy;

const googleAuthRouter = require("express").Router();

passport.use(

  new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/auth/google/callback",
    passReqToCallback: true,
    stateless: true, // Use the stateless option
  }, 
  
  async function (req, accessToken, refreshToken, profile, done) {
    try {
      
      console.log({ profile });

      

      return done(null, profile);
    } catch (error) {
      console.log({ error });
      return done(error);
    }
  }));

googleAuthRouter.get('/auth/google', ensureAuthenticated,
  passport.authenticate('google', { scope: ['profile', 'email'] }));

googleAuthRouter.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  function (req, res) {
    res.redirect('http://localhost:3000');
  }
);

module.exports = googleAuthRouter