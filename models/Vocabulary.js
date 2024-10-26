const mongoose = require('mongoose');

const vocabularySchema = new mongoose.Schema({
  word: String,
  phonetic: String,
  translation: String,
  definition: String,
  examples: [{
    sentence: String,
    translation: String
  }]
});

const Vocabulary = mongoose.model('Vocabulary', vocabularySchema);

module.exports = Vocabulary;
