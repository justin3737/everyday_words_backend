const { AUTH_MESSAGES } = require('../config/messages');

const authenticateUser = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({ error: AUTH_MESSAGES.LOGIN_REQUIRED });
  }
};

module.exports = { authenticateUser }; 