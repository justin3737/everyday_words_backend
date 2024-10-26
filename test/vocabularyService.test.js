const { getRandomVocabulary, getB2vocabulary, getRandomVocabularyFromDB } = require('../services/vocabularyService');
const { callAnthropicAPI } = require('../services/anthropicService');
const Vocabulary = require('../models/Vocabulary');

// Mock external dependencies
jest.mock('../services/anthropicService');
jest.mock('../models/Vocabulary');

describe('vocabularyService', () => {
  // Test for getRandomVocabulary
  describe('getRandomVocabulary', () => {
    it('should return parsed vocabulary data from Anthropic API', async () => {
      const mockApiResponse = `
      {
        "content": [
          {
            "word": "example",
            "phonetic": "/ɪɡˈzæmpəl/",
            "translation": "例子",
            "definition": "用來說明或證明某事的事物",
            "examples": [
              {
                "sentence": "This is a good example of modern architecture.",
                "translation": "這是現代建築的一個好例子。"
              },
              {
                "sentence": "Can you give me an example of what you mean?",
                "translation": "你能給我舉個例子說明你的意思嗎？"
              }
            ]
          }
        ]
      }`;

      callAnthropicAPI.mockResolvedValue(mockApiResponse);

      const result = await getRandomVocabulary();

      expect(result).toEqual({
        content: [
          {
            word: "example",
            phonetic: "/ɪɡˈzæmpəl/",
            translation: "例子",
            definition: "用來說明或證明某事的事物",
            examples: [
              {
                sentence: "This is a good example of modern architecture.",
                translation: "這是現代建築的一個好例子。"
              },
              {
                sentence: "Can you give me an example of what you mean?",
                translation: "你能給我舉個例子說明你的意思嗎？"
              }
            ]
          }
        ]
      });
    });

    it('should throw an error if API response is invalid', async () => {
      callAnthropicAPI.mockResolvedValue('Invalid JSON');

      await expect(getRandomVocabulary()).rejects.toThrow('Invalid response format from Claude');
    });
  });

  // Test for getB2vocabulary
  describe('getB2vocabulary', () => {
    it('should save new vocabulary items to the database', async () => {
      const mockVocabularyList = {
        content: [
          {
            word: "newWord",
            phonetic: "/njuː wɜːrd/",
            translation: "新詞",
            definition: "一個新的詞語",
            examples: [
              {
                sentence: "This is a new word.",
                translation: "這是一個新詞。"
              }
            ]
          }
        ]
      };

      const mockGetRandomVocabulary = jest.spyOn(require('../services/vocabularyService'), 'getRandomVocabulary');
      mockGetRandomVocabulary.mockResolvedValue(mockVocabularyList);

      Vocabulary.findOne.mockResolvedValue(null);
      Vocabulary.prototype.save.mockResolvedValue({});

      await getB2vocabulary();

      expect(Vocabulary.prototype.save).toHaveBeenCalled();
    });
  });

  // Test for getRandomVocabularyFromDB
  describe('getRandomVocabularyFromDB', () => {
    it('should return random vocabulary items from the database', async () => {
      const mockVocabularyItems = [
        { word: "word1" },
        { word: "word2" }
      ];

      Vocabulary.countDocuments.mockResolvedValue(10);
      Vocabulary.find.mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(mockVocabularyItems)
        })
      });

      const result = await getRandomVocabularyFromDB();

      expect(result).toEqual(mockVocabularyItems);
    });
  });
});
