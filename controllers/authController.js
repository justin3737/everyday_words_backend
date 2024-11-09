const User = require("../models/User");
const { generateJwtToken } = require("../middleware/auth");
const { getHttpResponse } = require("../utils/successHandler");

const handleGoogleAuth = (req, res) => {
  // 這個函數實際上不需要實作，因為 passport.authenticate 會處理
  // 保留這個函數是為了保持 controller 的完整性
};

// 處理 Google 登入回調
const handleGoogleCallback = (req, res) => {
  const user = req.user;
  // 將用戶資訊存入 session
  req.session.user = {
    name: user.displayName,
    email: user.emails[0].value,
    avatar: user.photos[0].value
  };
  res.redirect(process.env.FRONT_END_URL + '/word');
};

// 處理登出
const handleLogout = (req, res) => {
  req.logout();
  res.redirect(process.env.FRONT_END_URL + '/');
};

// 處理本地登入
const handleLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ success: false, message: '找不到該用戶' });
    }

    const bcrypt = require('bcrypt');
    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      return res.status(401).json({ success: false, message: '密碼錯誤' });
    }

    const token = await generateJwtToken(user);
    if (!token) {
      return next(appError(400, "40003", "token 建立失敗"));
    }

    res.status(201).json(getHttpResponse({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    }));

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: '登入過程發生錯誤' });
  }
};

module.exports = {
  handleGoogleAuth,
  handleGoogleCallback,
  handleLogout,
  handleLogin
}; 