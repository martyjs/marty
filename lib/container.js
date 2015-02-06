var Dispatcher = require('./dispatcher');
var Diagnostics = require('./diagnostics');
var ActionCreators = require('./actionCreators');

function Container() {
  this.actionCreators = new TypeContainer('action creator', createActionCreator);

  function createActionCreator(options) {
    return new ActionCreators(defaultOptions(options));
  }

  function defaultOptions(options) {
    options || (options = {});

    if (!options.dispatcher) {
      options.dispatcher = Dispatcher.getCurrent();
    }

    return options;
  }
}

Container.prototype = {
  registerActionCreator: function (options) {
    this.actionCreators.register(options);
  },
  resolveActionCreator: function (id) {
    return this.actionCreators.resolve(id);
  }
};

function TypeContainer(displayName, factory) {
  this.types = {};
  this.factory = factory;
  this.displayName = displayName;
}

TypeContainer.prototype = {
  id: function (options) {
    if (options.id) {
      return options.id;
    }

    if (options.displayName) {
      Diagnostics.warn(
        'Warning: The ',
        this.displayName,
        options.displayName,
        'does not have an Id'
      );
      return options.displayName;
    }

    throw new Error(
      'Cannot register ' +
      this.displayName +
      '. Does not have an Id'
    );
  },
  register: function (options) {
    this.types[this.id(options)] = options;
  },
  resolve: function (id) {
    var type = this.types[id];

    if (!type) {
      throw new Error(
        'Could not find ' +
        this.displayName +
        ' with Id ' + id
      );
    }

    return this.factory(type);
  }
};

module.exports = Container;