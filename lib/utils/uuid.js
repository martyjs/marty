var format = require('util').format;

function uuid() {
  return format('%s%s-%s-%s-%s-%s%s%s', s4(), s4(), s4(), s4(), s4(), s4(), s4(), s4());
}

function s4() {
  return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}

module.exports = {
  generate: uuid,
  small: function () {
    return uuid().substring(0, 6);
  }
};