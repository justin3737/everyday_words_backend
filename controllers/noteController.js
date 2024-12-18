const noteService = require('../services/noteService');

// 新增筆記
const addNote = async (req, res) => {
  try {
    const userId = req.user._id;
    const { word } = req.body;
    
    if (!word) {
      return res.status(400).json({ success: false, message: '必須提供單字' });
    }
    
    const newNote = await noteService.addNote({
      user: userId,
      word
    });
    
    res.status(201).json({ success: true, message: '筆記已成功新增', data: newNote });
  } catch (error) {
    console.error('Add note error:', error);
    if (error.message === 'Vocabulary not found') {
      return res.status(404).json({ success: false, message: '找不到此單字' });
    }
    if (error.message === 'Note already exists') {
      return res.status(400).json({ success: false, message: '此單字已經加入筆記' });
    }
    res.status(500).json({ success: false, message: '新增筆記時發生錯誤' });
  }
};

// 查詢筆記
const getNotes = async (req, res) => {
  try {
    const userId = req.user._id;
    const notes = await noteService.getNotes(userId);
    const vocabularyList = notes.map(note => note.vocabulary);
    
    res.json({ data: vocabularyList });
  } catch (error) {
    console.error('Error reading notes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 刪除筆記
const deleteNote = async (req, res) => {
  try {
    const userId = req.user._id;
    const word = req.params.word;
    
    const note = await noteService.deleteNote(word, userId);
    
    if (!note) {
      return res.status(404).json({ success: false, message: '找不到該筆記或無權限刪除' });
    }
    
    res.status(200).json({ success: true, message: '筆記已成功刪除' });
  } catch (error) {
    console.error('Delete note error:', error);
    if (error.message === 'Note not found') {
      res.status(404).json({ error: '找不到此筆記' });
    } else if (error.message === 'Unauthorized') {
      res.status(403).json({ error: '無權限刪除此筆記' });
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