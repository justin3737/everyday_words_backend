/**
 * 取得 http 回傳的內容
 * @param {string|array} data 回傳的內容
 * @returns {object} http 回傳的內容
 * @returns {string} http 回傳的message
 */
const getHttpResponse = ({ data = null, message = 'success', errors = null }) => {
  return {
    status: 'success',
    data,
    message,
    errors
  };
};

module.exports = { getHttpResponse }; 