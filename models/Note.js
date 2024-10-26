const mongoose = require('mongoose');

const exampleSchema = new mongoose.Schema({
  sentence: String,
  translation: String
});

const noteSchema = new mongoose.Schema({
  word: { type: String, required: true, unique: true },
  phonetic: String,
  translation: String,
  definition: String,
  examples: [exampleSchema]
});

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
