const express = require('express');
const router = express.Router();
const vocabularyController = require('../controllers/vocabularyController');

// 生成單字
router.get('/generator', vocabularyController.generateVocabulary);
// 隨機查詢單字
router.get('/random', vocabularyController.getRandomVocabulary);
// 查詢單字
router.get('/:word', vocabularyController.getVocabularyByWord);

module.exports = router; 