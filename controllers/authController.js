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

module.exports = {
  handleGoogleAuth,
  handleGoogleCallback,
  handleLogout
}; 