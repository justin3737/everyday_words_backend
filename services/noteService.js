const NoteModel = require('../models/Note');
const VocabularyModel = require('../models/Vocabulary');

async function addNote(noteData) {
  // 先查詢 Vocabulary
  const vocabulary = await VocabularyModel.findOne({ 
    word: { $regex: new RegExp(`^${noteData.word}$`, 'i') }
  });

  if (!vocabulary) {
    throw new Error('Vocabulary not found');
  }

  // 檢查是否已存在相同的筆記
  const existingNote = await NoteModel.findOne({
    vocabulary: vocabulary._id,
    user: noteData.user
  });

  if (existingNote) {
    throw new Error('Note already exists');
  }

  // 創建新筆記
  const newNote = new NoteModel({
    vocabulary: vocabulary._id,
    user: noteData.user
  });

  await newNote.save();
  return '筆記新增成功';
}

async function getNotes(userId) {
  // Add validation for userId
  if (!userId) {
    throw new Error('User ID is required');
  }

  const notes = await NoteModel.find({ user: userId })
    .populate('vocabulary')
    .populate('user', 'name email')
    .lean();
  
  // Add additional validation to ensure notes and their properties exist
  const validNotes = notes.filter(note => 
    note && 
    note.vocabulary != null && 
    note._id != null
  );
  
  return validNotes;
}

async function deleteNote(noteId, userId) {
  const note = await NoteModel.findOne({ _id: noteId, user: userId });
  
  if (!note) {
    throw new Error('Note not found');
  }

  await note.deleteOne();
  return '筆記已成功刪除';
}

module.exports = {
  addNote,
  getNotes,
  deleteNote
};
