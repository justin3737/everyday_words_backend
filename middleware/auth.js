const authenticateUser = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({ error: 'Please login first' });
  }
};

module.exports = { authenticateUser }; 