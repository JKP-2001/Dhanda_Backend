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

var MicrosoftStrategy = require('passport-microsoft').Strategy;

const microsoftAuthRouter = require("express").Router();

const MICROSOFT_CLIENT_ID = process.env.MICROSOFT_CLIENT_ID;
const MICROSOFT_CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET_VALUE;

passport.use(new MicrosoftStrategy({

    clientID: MICROSOFT_CLIENT_ID,
    clientSecret: MICROSOFT_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/auth/microsoft/callback",
    scope: ['user.read'],
    tenant: 'common',

},
    async function (req, accessToken, refreshToken, profile, done) {
        try {


            const people = getPeople(ROLE);
            const antiPeople = getPeople(ROLE === ROLE_INSTRUCTOR ? ROLE_STUDENT : ROLE_INSTRUCTOR);
            const email = profile._json.mail;
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

            const name = profile._json.displayName;
            const firstName = name.split(" ")[0];
            const lastName = name.split(" ")[2] ? name.split(" ")[2] : name.split(" ")[1] ? name.split(" ")[1] : "";
            const middleName = name.split(" ")[2] ? name.split(" ")[1] : "";

            const newDATA = {
                email,
                firstName,
                middleName,
                lastName,
                role: ROLE,
                socialLoginId: profile.id,
                loginProvider: "microsoft"
            }

            const newUser = await people.create(newDATA);

            if (!newUser) {
                throw new Error("User not created");
            }



            return done(null, profile);

        } catch (err) {

            console.log(err);
        }
    }
));


microsoftAuthRouter.get('/auth/microsoft', ensureAuthenticated, setRoleMiddleware, passport.authenticate('microsoft', { prompt: 'select_account', }));

microsoftAuthRouter.get('/auth/microsoft/callback',

    passport.authenticate('microsoft', { failureRedirect: '/' }),

    async function (req, res) {
        if (req.ANTIUSER) {
            return res.redirect(`http://localhost:3000/google/auth/callback?status=antiuser`);
        }

        if (req.nonSocialUser) {
            return res.redirect(`http://localhost:3000/google/auth/callback?status=nonSocialUser`);
        }

        const unique_data = {
            email: req.user._json.mail,
            role: ROLE,
            createdAt: Date.now()
        }

        const unique = encryptToJson(unique_data, process.env.ENCRYPT_KEY);


        res.cookie('authToken', unique, { secure: true, sameSite: 'None' });

        res.redirect(`http://localhost:3000/google/auth/callback?status=success`);
    }
);

microsoftAuthRouter.get('/auth/google/logout', (req, res, next) => {



    try {
        const authToken = req.cookies.authToken;
        console.log({ authToken })

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


microsoftAuthRouter.use((err, req, res, next) => {
    if (err.isAntiUser) {
        return res.redirect(`http://localhost:3000/google/auth/callback?status=antiuser`);
    }

    if (err.isNonSocialUser) {
        return res.redirect(`http://localhost:3000/google/auth/callback?status=nonSocialUser`);
    }
});


module.exports = microsoftAuthRouter