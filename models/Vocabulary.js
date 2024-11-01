const mongoose = require('mongoose');

// 定義單字模型
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

// 創建單字模型
const Vocabulary = mongoose.model('Vocabulary', vocabularySchema);

module.exports = Vocabulary;
