"use strict";

module.exports = {
  id: "throwOnError",
  after: function after(res) {
    if (!res.ok) {
      throw res;
    }

    return res;
  }
};