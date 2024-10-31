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

const handleLogout = (req, res) => {
  req.logout();
  res.redirect(process.env.FRONT_END_URL + '/');
};

module.exports = {
  handleGoogleCallback,
  handleLogout
}; 