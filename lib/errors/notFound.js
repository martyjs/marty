function NotFoundError() {
  this.message = '';
  this.name = 'Not found';
}

NotFoundError.prototype = Error.prototype;

module.exports = NotFoundError;