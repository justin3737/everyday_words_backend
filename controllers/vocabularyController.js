const vocabularyService = require('../services/vocabularyService');

// 生成單字
async function generateVocabulary(req, res) {
  try {
    const allVocabulary = await vocabularyService.getVocabularyFromAnthropic();
    if (!allVocabulary || allVocabulary.content.length === 0) {
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
}

// 隨機查詢單字
async function getRandomVocabulary(req, res) {
  try {
    const vocabulary = await vocabularyService.getRandomVocabulary(10);
    res.json(vocabulary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// 查詢單字
async function getVocabularyByWord(req, res) {
  try {
    const { word } = req.params;
    const result = await vocabularyService.findWordInDB(word);
    
    if (!result) {
      return res.status(404).json({ error: `找不到單字: ${word}` });
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  generateVocabulary,
  getRandomVocabulary,
  getVocabularyByWord
}; 