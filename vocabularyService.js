const { callAnthropicAPI } = require('./services/anthropicService');
const Vocabulary = require('./models/Vocabulary');



// get random vocabulary from Anthropic API
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

async function getRandomVocabularyFromDB() {
  const count = await Vocabulary.countDocuments();
  const random = Math.floor(Math.random() * count);
  return await Vocabulary.find().skip(random).limit(10);
}

module.exports = {
  getRandomVocabulary,
  getB2vocabulary,
  getRandomVocabularyFromDB
};
