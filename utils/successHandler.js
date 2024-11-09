/**
 * 取得 http 回傳的內容
 * @param {string|array} data 回傳的內容
 * @returns {object} http 回傳的內容
 * @returns {string} http 回傳的message
 */
const getHttpResponse = ({ success = true, token = null, user = null }) => {
  return {
    success,
    token,
    user
  };
};

module.exports = { getHttpResponse }; 