const noteService = require('../services/noteService');

// 新增筆記
const addNote = async (req, res) => {
  try {
    const result = await noteService.addNote(req.body);
    res.status(201).json({ message: result });
  } catch (error) {
    console.error('Error adding note:', error);
    if (error.message === 'Invalid note data') {
      res.status(400).json({ error: error.message });
    } else if (error.message === '已加入過筆記') {
      res.status(409).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

// 查詢筆記
const getNotes = async (req, res) => {
  try {
    const notes = await noteService.getNotes();
    res.json({ content: notes });
  } catch (error) {
    console.error('Error reading notes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 刪除筆記
const deleteNote = async (req, res) => {
  try {
    const word = req.params.word;
    const result = await noteService.deleteNote(word);
    res.json({ message: result });
  } catch (error) {
    if (error.message === '找不到此單字') {
      res.status(444).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = {
  addNote,
  getNotes,
  deleteNote
}; 