const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');

// 新增筆記
router.post('/', noteController.addNote);
// 查詢筆記
router.get('/', noteController.getNotes);
// 刪除筆記
router.delete('/:word', noteController.deleteNote);

module.exports = router; 