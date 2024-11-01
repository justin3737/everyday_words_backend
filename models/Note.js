const mongoose = require('mongoose');

// 定義範例模型
const exampleSchema = new mongoose.Schema({
  sentence: String,
  translation: String
});

// 定義筆記模型
const noteSchema = new mongoose.Schema({
  word: { type: String, required: true, unique: true },
  phonetic: String,
  translation: String,
  definition: String,
  examples: [exampleSchema]
});

// 創建筆記模型
const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
