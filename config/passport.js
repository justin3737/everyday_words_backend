require('dotenv').config();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// 使用 Google 策略進行身份驗證
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BASE_URL}/auth/google/callback`
  },
  function(accessToken, refreshToken, profile, cb) {
    return cb(null, profile);
  }
));

// 序列化用戶
passport.serializeUser((user, done) => {
  done(null, user);
});

// 反序列化用戶
passport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = passport; 