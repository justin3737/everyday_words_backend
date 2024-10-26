const express = require('express');
const cors = require('cors');
require('dotenv').config();

const cron = require('node-cron');
const { getRandomVocabulary, getB2vocabulary, getRandomVocabularyFromDB } = require('./services/vocabularyService');
const { addNote, getNotes } = require('./services/noteService');  // 新增這行

const VocabularyModel = require('./models/Vocabulary');
const NoteModel = require('./models/Note'); 
const connectDB = require('./db');  // 新增這行

const app = express();
const port = process.env.PORT || 3000;

// 啟用 CORS
app.use(cors());

app.use(express.json());

// 調用連接數據庫的函數
connectDB();

// 使用導入的模型，而不是重新定義
const Vocabulary = VocabularyModel;

// 取得單字 from MongoDB
app.get('/api/vocabulary', async (req, res) => {
  try {
    const vocabularyList = await getRandomVocabularyFromDB();
    res.json({ content: vocabularyList });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 修改 addNote API
app.post('/api/addNote', async (req, res) => {
  try {
    const result = await addNote(req.body);
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
});

// 修改 getNotes API
app.get('/api/notes', async (req, res) => {
  try {
    const notes = await getNotes();
    res.json({ content: notes });
  } catch (error) {
    console.error('Error reading notes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 添加錯誤處理中間件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});


// 設置定時任務，每小時執行一次
cron.schedule('0 * * * *', () => {
  console.log('Running B2 vocabulary update task');
  getB2vocabulary();
});

// getB2vocabulary from Anthropic API
app.get('/api/getB2vocabulary', async (req, res) => {
  try {
    const newVocabularyList = await getRandomVocabulary();

    for (const item of newVocabularyList.content) {
      const existingWord = await Vocabulary.findOne({ word: { $regex: new RegExp('^' + item.word + '$', 'i') } });
      if (!existingWord) {
        const newVocabulary = new Vocabulary(item);
        await newVocabulary.save()
      }
    }

    const allVocabulary = await Vocabulary.find();

    res.json({ 
      content: allVocabulary
    });
  } catch (error) {
    console.error('Error in getB2vocabulary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  // 服務器啟動時立即執行一次更新任務
  getB2vocabulary();
});
