const NoteModel = require('../models/Note');

// 驗證筆記數據的輔助函數
function isValidNoteData(data) {
  return (
    data &&
    typeof data.word === 'string' &&
    typeof data.phonetic === 'string' &&
    typeof data.translation === 'string' &&
    typeof data.definition === 'string' &&
    Array.isArray(data.examples) &&
    data.examples.every(example => 
      typeof example.sentence === 'string' &&
      typeof example.translation === 'string'
    )
  );
}

async function addNote(noteData) {
  if (!isValidNoteData(noteData)) {
    throw new Error('Invalid note data');
  }

  // 檢查 word 是否已存在
  const existingNote = await NoteModel.findOne({ word: noteData.word });
  if (existingNote) {
    throw new Error('已加入過筆記');
  }

  const newNote = new NoteModel(noteData);
  await newNote.save();
  return 'Note added successfully';
}

async function getNotes() {
  const notes = await NoteModel.find();
  return notes.map(note => ({
    word: note.word,
    phonetic: note.phonetic,
    translation: note.translation,
    definition: note.definition,
    examples: note.examples
  }));
}

async function deleteNote(word) {
  const result = await NoteModel.findOneAndDelete({ word });
  if (!result) {
    throw new Error('找不到此單字');
  }
  return '單字已成功刪除';
}

module.exports = {
  addNote,
  getNotes,
  deleteNote
};
