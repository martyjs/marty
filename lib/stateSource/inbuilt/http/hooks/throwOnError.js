module.exports = {
  id: 'throwOnError',
  after: function (res) {
    if (!res.ok) {
      throw res;
    }

    return res;
  }
};
