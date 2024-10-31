// /api/auth/callback.js

import passport from 'passport';
import nextConnect from 'next-connect';

const handler = nextConnect();

handler.use(passport.initialize());
handler.use(passport.session());

handler.get(
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/word');
  }
);

export default handler;