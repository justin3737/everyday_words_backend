require('dotenv').config(); // Add this line at the top of the file

const fs = require('fs');
const path = require('path');
const Vocabulary = require('../models/Vocabulary');
const { connectToMongoDB, clearCollection, insertData, closeConnection, ensureCollection } = require('./dbUtils');

// MongoDB 連接 URL
const mongoURL = process.env.MONGODB_URI;

// 讀取 JSON 文件
const jsonPath = path.join(__dirname, '../b2vocabulary.json');
const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

const importVocabulary = async () => {
  try {
    await connectToMongoDB(mongoURL);
    await ensureCollection(Vocabulary);
    await clearCollection(Vocabulary);
    await insertData(Vocabulary, jsonData.content);
  } catch (error) {
    console.error('Error importing data:', error);
  } finally {
    closeConnection();
  }
};

importVocabulary();
