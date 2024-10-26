const { addNote, getNotes } = require('../services/noteService');
const NoteModel = require('../models/Note');

// 模擬 NoteModel
jest.mock('../models/Note');

describe('Note Service', () => {
  beforeEach(() => {
    // 清除所有模擬調用和實例
    jest.clearAllMocks();
  });

  describe('addNote', () => {
    const validNoteData = {
      word: 'test',
      phonetic: 'tɛst',
      translation: '測試',
      definition: '一個測試單詞',
      examples: [
        { sentence: 'This is a test.', translation: '這是一個測試。' }
      ]
    };

    it('應該成功添加有效的筆記', async () => {
      NoteModel.findOne.mockResolvedValue(null);
      NoteModel.prototype.save.mockResolvedValue();

      const result = await addNote(validNoteData);
      expect(result).toBe('Note added successfully');
      expect(NoteModel.prototype.save).toHaveBeenCalled();
    });

    it('應該在筆記已存在時拋出錯誤', async () => {
      NoteModel.findOne.mockResolvedValue({ word: 'test' });

      await expect(addNote(validNoteData)).rejects.toThrow('已加入過筆記');
      expect(NoteModel.prototype.save).not.toHaveBeenCalled();
    });

    it('應該在無效的筆記數據時拋出錯誤', async () => {
      const invalidNoteData = { ...validNoteData, word: null };

      await expect(addNote(invalidNoteData)).rejects.toThrow('Invalid note data');
      expect(NoteModel.findOne).not.toHaveBeenCalled();
      expect(NoteModel.prototype.save).not.toHaveBeenCalled();
    });
  });

  describe('getNotes', () => {
    it('應該返回所有筆記', async () => {
      const mockNotes = [
        {
          word: 'test1',
          phonetic: 'tɛst1',
          translation: '測試1',
          definition: '第一個測試單詞',
          examples: [{ sentence: 'This is test 1.', translation: '這是測試1。' }]
        },
        {
          word: 'test2',
          phonetic: 'tɛst2',
          translation: '測試2',
          definition: '第二個測試單詞',
          examples: [{ sentence: 'This is test 2.', translation: '這是測試2。' }]
        }
      ];

      NoteModel.find.mockResolvedValue(mockNotes);

      const result = await getNotes();
      expect(result).toEqual(mockNotes);
      expect(NoteModel.find).toHaveBeenCalled();
    });
  });
});
