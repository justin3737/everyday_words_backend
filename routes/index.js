const noteRoutes = require('./noteRoutes');
const authRoutes = require('./authRoutes');
const vocabularyRoutes = require('./vocabularyRoutes');

function setupRoutes(app) {
  app.use('/auth', authRoutes);
  app.use('/api/notes', noteRoutes);
  app.use('/api/vocabulary', vocabularyRoutes);
}

module.exports = setupRoutes; 