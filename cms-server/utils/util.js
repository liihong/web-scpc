/**
 * 工具类
 */
const crypto = require('crypto');

module.exports = {

  encrypt: function(data, key) { // 密码加密
    const cipher = crypto.createCipher('bf', key);
    let newPsd = '';
    newPsd += cipher.update(data, 'utf8', 'hex');
    newPsd += cipher.final('hex');
    return newPsd;
  },

  decrypt: function(data, key) { // 密码解密
    const decipher = crypto.createDecipher('bf', key);
    let oldPsd = '';
    oldPsd += decipher.update(data, 'hex', 'utf8');
    oldPsd += decipher.final('utf8');
    return oldPsd;
  },
  // 根据日期获取id
  getUUId: function() {
    const now = new Date();
    let month = now.getMonth() + 1;
    let day = now.getDate();
    const hour = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const milliseconds = now.getMilliseconds();
    if (month > 0 && month < 10) {
      month = '0' + month;
    }
    if (day > 0 && day < 10) {
      day = '0' + day;
    }
    return now.getFullYear().toString() + month.toString() + day + hour + minutes + seconds + milliseconds + (Math.round(Math.random() * 10000 + 100)).toString();
  },
  getNowTime: function() {
    const now = new Date();
    let month = now.getMonth() + 1;
    let day = now.getDate();
    const hour = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    if (month > 0 && month < 10) {
      month = '0' + month;
    }
    if (day > 0 && day < 10) {
      day = '0' + day;
    }
    return now.getFullYear().toString() + '-' + month.toString() + '-' + day + '-' + hour + ':' + minutes + ':' + seconds;
  },
  // 小写转换
  lowerJSONKey(jsonObj) {
    for (var key in jsonObj) {
      jsonObj[key.toLowerCase()] = jsonObj[key];
      delete (jsonObj[key]);
    }
    return jsonObj;
  }
};
