const { callAnthropicAPI } = require('./anthropicService');
const Vocabulary = require('../models/Vocabulary');

// 從 Anthropic API 獲取單字
async function getVocabularyFromAnthropic() {
  const prompt = `請提供5個隨機的C1級別英語單詞，並為每個單詞提供以下信息：
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
    let cleanedResult = result.trim().replace(/^```json\s*/, '').replace(/\s*```$/, '');
    const parsedResult = JSON.parse(cleanedResult);
    
    if (!parsedResult.content || !Array.isArray(parsedResult.content)) {
      throw new Error('Invalid response format: missing content array');
    }
    
    return parsedResult;
  } catch (error) {
    console.error('Failed to parse JSON. Raw response:', result);
    throw new Error('Invalid response format from Claude');
  }
}

// 創建精確的單字正則表達式
function createExactWordRegex(word) {
  return new RegExp('^' + word + '$', 'i');
}

// 在數據庫中查找單字
async function findWordInDB(word) {
  return await Vocabulary.findOne({ 
    word: { $regex: createExactWordRegex(word) }
  });
}

// 保存新的單字
async function saveNewVocabulary(vocabularyData) {
  const newVocabulary = new Vocabulary(vocabularyData);
  return await newVocabulary.save();
}

// 獲取單字總數
async function getVocabularyCount() {
  return await Vocabulary.countDocuments();
}

// 獲取所有單字
async function getAllVocabulary() {
  return await Vocabulary.find();
}

// 獲取隨機單字
async function getRandomVocabulary(limit = 10) {
  const count = await Vocabulary.countDocuments();
  const random = Math.floor(Math.random() * count);
  return await Vocabulary.find().skip(random).limit(limit);
}

module.exports = {
  getVocabularyFromAnthropic,
  findWordInDB,
  saveNewVocabulary,
  getVocabularyCount,
  getAllVocabulary,
  getRandomVocabulary
};
