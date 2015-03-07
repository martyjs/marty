var _ = require('./mindash');

function CompositeDisposable() {
  var disposables = _.toArray(arguments);

  this.add = add;
  this.dispose = dispose;
  this.addRange = addRange;

  function add(disposable) {
    this.disposables.push(disposable);
  }

  function addRange(disposables) {
    this.disposables = this.disposables.concat(disposables);
  }

  function dispose() {
    _.each(disposables, function (disposable) {
      if (_.isFunction(disposable.dispose)) {
        disposable.dispose();
      }
    });
  }
}

module.exports = CompositeDisposable;