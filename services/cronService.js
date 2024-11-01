const cron = require('node-cron');
const { vocabularyGenerator } = require('./vocabularyService');

// 設置定時任務，每5分執行一次
function initCronJobs() {
  cron.schedule('*/5 * * * *', () => {
    console.log('Running vocabulary update task');
    vocabularyGenerator();
  });
}

module.exports = {
  initCronJobs
}; 