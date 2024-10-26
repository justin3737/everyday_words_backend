require('dotenv').config(); // Add this line at the top of the file

const fs = require('fs');
const path = require('path');
const Note = require('../models/Note');
const { connectToMongoDB, clearCollection, insertData, closeConnection, ensureCollection } = require('./dbUtils');

// MongoDB 連接 URL (使用環境變量)
const mongoURL = process.env.MONGODB_URI;

// 讀取 JSON 文件
const jsonPath = path.join(__dirname, '../note.json');
const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

const importNotes = async () => {
  try {
    await connectToMongoDB(mongoURL);
    await ensureCollection(Note);
    await clearCollection(Note);
    await insertData(Note, jsonData);
  } catch (error) {
    console.error('Error importing data:', error);
  } finally {
    closeConnection();
  }
};

importNotes();
