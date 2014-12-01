function NotFoundError(message) {
  this.name = 'Not found';
  this.message = message || '';
}

NotFoundError.prototype = Error.prototype;

module.exports = NotFoundError;