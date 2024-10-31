const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('../config/passport');

require('dotenv').config();

const cron = require('node-cron');
const { vocabularyGenerator, getRandomVocabularyFromDB, getVocabularyByWord } = require('../services/vocabularyService');
const { addNote, getNotes, deleteNote } = require('../services/noteService');

const connectDB = require('../db');

const app = express();
const port = process.env.PORT || 3000;

// 啟用 CORS
app.use(cors({
  origin: [process.env.BASE_URL, process.env.FRONT_END_URL],
  credentials: true
}));

app.use(express.json());

// 添加 session 中間件
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

// 初始化 Passport
app.use(passport.initialize());
app.use(passport.session());

// 添加 Google 認證路由
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: process.env.FRONT_END_URL + '/'
  }),
  (req, res) => {
    const user = req.user;
    req.session.user = {
      name: user.displayName,
      email: user.emails[0].value,
      avatar: user.photos[0].value
    };
    console.log(req.session.user);
    
    res.redirect(process.env.FRONT_END_URL + '/word');
  }
);

// 驗證 mi
const authenticateUser = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.status(401).json({ error: 'Please login first' });
  }
};

// 登出路由
app.get('/auth/logout', (req, res) => {
  req.logout();
  res.redirect(process.env.FRONT_END_URL + '/');
});

// 調用連接數據庫的函數
connectDB();

// 隨機取得多個單字 from MongoDB
app.get('/api/randomVocabulary', async (req, res) => {
  try {
    const vocabularyList = await getRandomVocabularyFromDB();
    res.json({ content: vocabularyList });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 根據單字查詢詞彙
app.get('/api/vocabulary/:word', async (req, res) => {
  try {
    const word = req.params.word;
    const vocabulary = await getVocabularyByWord(word);
    console.log(vocabulary);
    
    if (!vocabulary) {
      return res.status(404).json({ error: 'Vocabulary not found' });
    }
    
    res.json(vocabulary);
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

// 添加 deleteNote API
app.delete('/api/notes/:word', async (req, res) => {
  try {
    const word = req.params.word;
    const result = await deleteNote(word);
    res.json({ message: result });
  } catch (error) {
    if (error.message === '找不到此單字') {
      res.status(444).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// 添加錯誤處理中間件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});


// 設置定時任務，每5分執行一次
cron.schedule('*/5 * * * *', () => {
  console.log('Running vocabulary update task');
  vocabularyGenerator();
});

// 取得 anthropic 的詞彙
app.get('/api/vocabularyGenerator', async (req, res) => {
  try {
    const allVocabulary = await vocabularyGenerator();
    if (!allVocabulary || allVocabulary.length === 0) {
      return res.status(404).json({ error: 'No vocabulary generated' });
    }
    res.json({ content: allVocabulary });
  } catch (error) {
    console.error('Error in vocabularyGenerator:', error);
    if (error.message === 'API rate limit exceeded') {
      res.status(429).json({ error: error.message });
    } else if (error.message === 'Invalid response from AI service') {
      res.status(502).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  // 服務器啟動時立即執行一次更新任務
  vocabularyGenerator();
});

module.exports = app;
