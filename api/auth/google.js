// /api/auth/google.js

import passport from 'passport';
import nextConnect from 'next-connect';
import GoogleStrategy from 'passport-google-oauth20';

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.BASE_URL}/api/auth/callback`,
}, (accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));

const handler = nextConnect();

handler.use(passport.initialize());

handler.get(passport.authenticate('google', { scope: ['profile', 'email'] }));

export default handler;