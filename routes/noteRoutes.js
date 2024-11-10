const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const { isAuth } = require('../middleware/auth');

// 新增筆記
router.post('/', isAuth, noteController.addNote);
// 查詢筆記
router.get('/', isAuth, noteController.getNotes);
// 刪除筆記
router.delete('/:id', isAuth, noteController.deleteNote);

module.exports = router; 