const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');
const cron = require('node-cron');
const mongoose = require('mongoose');
const VocabularyModel = require('./models/Vocabulary');
const NoteModel = require('./models/Note'); 

const app = express();
const port = process.env.PORT || 3000;

// 啟用 CORS
app.use(cors());

app.use(express.json());

// MongoDB 連接
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// 使用導入的模型，而不是重新定義
const Vocabulary = VocabularyModel;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

async function callAnthropicAPI(prompt) {
  const response = await anthropic.beta.messages.create({
    model: 'claude-3-sonnet-20240229',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }],
    stream: false
  });

  return response.content[0].text;
}

/* 隨機單字 */
app.get('/api/vocabulary', async (req, res) => {
  try {
    const count = await Vocabulary.countDocuments();
    const random = Math.floor(Math.random() * count);
    const vocabularyList = await Vocabulary.find().skip(random).limit(10);
    res.json({ content: vocabularyList });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 輔助函數：從數組中隨機選擇指定數量的項目
function getRandomItems(array, count) {
  const shuffled = array.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

async function getRandomVocabulary() {
  const prompt = `請提供5個隨機的B2級別英語單詞，並為每個單詞提供以下信息：
  - 這個詞本身。
  - 相應的 KK 音標。
  - 單詞的中文翻譯。
  - 用繁體中文說明對單詞在英語中的含義的簡要說明。
  - 在上下文中使用單詞的兩個例句。
  - 每個例句的繁體中文翻譯。
  - 每個單詞都應有簡潔明瞭的解釋，以增強學習者的理解。
  請將結果直接以JSON格式返回，格式如下：
  {
    "content": [
      {
        "word": "單詞",
        "phonetic": "音標",
        "translation": "中文翻譯",
        "definition": "繁體中文定義",
        "examples": [
          {
            "sentence": "英文例句1",
            "translation": "中文翻譯1"
          },
          {
            "sentence": "英文例句2",
            "translation": "中文翻譯2"
          }
        ]
      },
      // ... 其他單詞 ...
    ]
  }
  請確保返回的是一個有效的JSON對象，包含一個名為"content"的數組，數組中的每個對象代表一個單詞及其相關信息。`;

  const result = await callAnthropicAPI(prompt);

  try {
    // 清理結果
    let cleanedResult = result.trim().replace(/^```json\s*/, '').replace(/\s*```$/, '');
    
    // 解析 JSON
    const parsedResult = JSON.parse(cleanedResult);
    
    // 確保結果包含 content 數組
    if (!parsedResult.content || !Array.isArray(parsedResult.content)) {
      throw new Error('Invalid response format: missing content array');
    }
    
    return parsedResult;
  } catch (error) {
    console.error('Failed to parse JSON. Raw response:', result);
    throw new Error('Invalid response format from Claude');
  }
}

// 新增 addNote API
app.post('/api/addNote', async (req, res) => {
  try {
    const noteData = req.body;
    if (!isValidNoteData(noteData)) {
      return res.status(400).json({ error: 'Invalid note data' });
    }

    // 檢查 word 是否已存在
    const existingNote = await NoteModel.findOne({ word: noteData.word });
    if (existingNote) {
      return res.status(409).json({ error: '已加入過筆記' });
    }

    const newNote = new NoteModel(noteData);
    await newNote.save();

    res.status(201).json({ message: 'Note added successfully' });
  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

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

// 修改 getNotes API
app.get('/api/notes', async (req, res) => {
  try {
    const notes = await NoteModel.find();  // 使用NoteModel
    const result = {
      content: notes.map(note => ({
        word: note.word,
        phonetic: note.phonetic,
        translation: note.translation,
        definition: note.definition,
        examples: note.examples
      }))
    };
    res.json(result);
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

// getB2vocabulary 函數
async function getB2vocabulary() {
  try {
    const newVocabularyList = await getRandomVocabulary();
    
    for (const item of newVocabularyList.content) {
      const existingWord = await Vocabulary.findOne({ word: { $regex: new RegExp('^' + item.word + '$', 'i') } });
      if (!existingWord) {
        const newVocabulary = new Vocabulary(item);
        await newVocabulary.save();
      }
    }

    console.log('B2 vocabulary updated successfully');
  } catch (error) {
    console.error('Error updating B2 vocabulary:', error);
  }
}

// 設置定時任務，每小時執行一次
cron.schedule('0 * * * *', () => {
  console.log('Running B2 vocabulary update task');
  getB2vocabulary();
});

// 修改 getB2vocabulary API
app.get('/api/getB2vocabulary', async (req, res) => {
  try {
    const vocabularyList = await Vocabulary.find();
    res.json({ content: vocabularyList });
  } catch (error) {
    console.error('Error reading B2 vocabulary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  // 服務器啟動時立即執行一次更新任務
  getB2vocabulary();
});
