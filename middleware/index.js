const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('../config/passport');

function setupMiddleware(app) {
  app.use(cors({
    origin: [
      process.env.BASE_URL, 
      process.env.FRONT_END_URL
    ],
    credentials: true
  }));

  app.use(express.json());
  
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false
  }));

  app.use(passport.initialize());
  app.use(passport.session());
}

module.exports = setupMiddleware; 