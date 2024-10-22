const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// 啟用 CORS
app.use(cors());

app.use(express.json());

// 添加緩存
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 3600 }); // 緩存1小時

// 控制是否啟用緩存的變數
const ENABLE_CACHE = true;

/* 隨機單字 */
app.get('/api/vocabulary', async (req, res) => {
  try {
    let vocabularyList;
    
    if (ENABLE_CACHE) {
      vocabularyList = cache.get('vocabularyList');
      if (vocabularyList) {
        console.log('Serving from cache');
        return res.json({ content: vocabularyList.content });
      }
    }

    vocabularyList = await getRandomVocabulary();
    
    if (ENABLE_CACHE) {
      cache.set('vocabularyList', vocabularyList);
    }

    res.json({ content: vocabularyList.content });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

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

  const response = await axios.post('https://api.anthropic.com/v1/messages', {
    model: 'claude-3-5-sonnet-20240620',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1000,
  }, {
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    timeout: 30000,
  });

  const result = response.data.content[0].text;

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
    // 驗證請求數據
    if (!isValidNoteData(noteData)) {
      return res.status(400).json({ error: 'Invalid note data' });
    }

    // 讀取現有的 note.json 文件
    let notes = [];
    try {
      const data = await fs.readFile(path.join(__dirname, 'note.json'), 'utf8');
      notes = JSON.parse(data);
    } catch (error) {
      // 如果文件不存在或為空，則使用空數組
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }

    // 檢查單字是否已存在
    const existingNote = notes.find(note => note.word.toLowerCase() === noteData.word.toLowerCase());
    if (existingNote) {
      return res.status(409).json({ 
        error: 'Word already exists', 
        existingNote: existingNote 
      });
    }

    // 添加新的筆記
    notes.push(noteData);

    // 將更新後的筆記寫回文件
    await fs.writeFile(path.join(__dirname, 'note.json'), JSON.stringify(notes, null, 2));

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

// 新增 getNotes API
app.get('/api/notes', async (req, res) => {
  try {
    // 讀取 note.json 文件
    const data = await fs.readFile(path.join(__dirname, 'note.json'), 'utf8');
    const notes = JSON.parse(data);

    // 將數據格式化為指定的 Result 格式
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
    if (error.code === 'ENOENT') {
      // 如果文件不存在，返回空的結果
      res.json({ content: [] });
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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
