const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  vocabulary: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vocabulary',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true  // 這會自動創建 createdAt 和 updatedAt
});

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
