function serializeError(error) {
  if (!error) {
    return null;
  }

  let result = {
    name: error.name
  };

  Object.getOwnPropertyNames(error).forEach(function (key) {
    result[key] = error[key];
  });
  return result;
}

module.exports = serializeError;