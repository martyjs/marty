function NotFoundError(message) {
  this.name = 'Not found';
  this.message = message || '';
  this.status = 404;
}

NotFoundError.prototype = Error.prototype;

module.exports = NotFoundError;