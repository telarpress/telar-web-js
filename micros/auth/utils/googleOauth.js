const passport = require("passport");
const { appConfig } = require("../config");

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});
var userProfile;
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const GOOGLE_CLIENT_ID = appConfig.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = appConfig.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = appConfig.GOOGLE_CALLBACK_URL;
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
    },
    function (accessToken, refreshToken, profile, done) {
      userProfile = profile;
      return done(null, userProfile);
    }
  )
);
