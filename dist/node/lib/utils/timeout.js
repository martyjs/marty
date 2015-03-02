"use strict";

function timeout(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

module.exports = timeout;