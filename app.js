require('dotenv').config();

const express = require('express');
const connectDB = require('./db');
const setupMiddleware = require('./middleware/index');
const setupRoutes = require('./routes');
const { errorHandlerMainProcess } = require('./middleware/errorHandler');
const { initCronJobs } = require('./services/cronService');

const app = express();
const port = process.env.PORT || 3000;

// 設定 middleware
setupMiddleware(app);

// 連接資料庫
connectDB();

// 設定路由
setupRoutes(app);

// 錯誤處理
app.use(errorHandlerMainProcess);

// 啟動伺服器
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  // 初始化定時任務
  // initCronJobs();
});

module.exports = app;
