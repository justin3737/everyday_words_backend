const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const authController = require('../controllers/authController');

// Google 認證路由
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: process.env.FRONT_END_URL + '/'
  }),
  authController.handleGoogleCallback
);

router.get('/logout', authController.handleLogout);

// 添加本地登入路由
router.post('/login', authController.handleLogin);

// 添加註冊路由
router.post('/register', authController.handleRegister);

module.exports = router;
