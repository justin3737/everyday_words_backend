const mongoose = require('mongoose');

// 連接到 MongoDB
exports.connectToMongoDB = async (mongoURL) => {
  await mongoose.connect(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');
};

// 清空集合
exports.clearCollection = async (Model) => {
  await Model.deleteMany({});
  console.log(`Existing ${Model.modelName} data cleared`);
};

// 插入數據
exports.insertData = async (Model, data) => {
  const result = await Model.insertMany(data);
  console.log(`${result.length} ${Model.modelName} items imported successfully`);
  return result;
};

// 關閉數據庫連接
exports.closeConnection = () => {
  mongoose.connection.close();
};

// 確保 collection 存在
exports.ensureCollection = async (Model) => {
  const collectionName = Model.collection.name;
  const collections = await mongoose.connection.db.listCollections().toArray();
  const collectionExists = collections.some((col) => col.name === collectionName);
  
  if (!collectionExists) {
    await mongoose.connection.createCollection(collectionName);
    console.log(`Collection ${collectionName} created`);
  } else {
    console.log(`Collection ${collectionName} already exists`);
  }
};
