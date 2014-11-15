var CHANGE_EVENT = 'changed';
var _ = require('./utils/tinydash');
var EventEmitter = require('events').EventEmitter;

function Store(options) {
  var state;
  var defaultState = {};
  var emitter = new EventEmitter();

  _.extend(this, _.defaults(options, {
    handlers: {},
    waitFor: waitFor,
    setState: setState,
    getState: getState,
    hasChanged: hasChanged,
    handleAction: handleAction,
    getInitialState: getInitialState,
    addChangeListener: addChangeListener
  }));

  this.dispatchToken = options.dispatcher.register(_.bind(this.handleAction, this));
  state = this.getInitialState();

  if (_.isNull(state) || _.isUndefined(state)) {
    state = defaultState;
  }

  if (Object.defineProperty) {
    Object.defineProperty(this, 'state', {
      get: function () {
        return getState();
      },
      set: function (value) {
        this.setState(value);
      }
    });
  } else {
    this.state = state;
  }

  function getInitialState() {
    return defaultState;
  }

  function setState(newState) {
    if (state !== newState) {
      state = newState;
      this.hasChanged(state);
    }
  }

  function getState() {
    return state;
  }

  function addChangeListener(callback, context) {
    if (context) {
      callback = _.bind(callback, context);
    }

    emitter.on(CHANGE_EVENT, callback);

    return {
      dispose: function () {
        emitter.removeListener(CHANGE_EVENT, callback);
      }
    };
  }

  function hasChanged() {
    emitter.emit.call(emitter, CHANGE_EVENT, this.state, this);
  }

  function handleAction(action) {
    var handlers = _.object(_.map(this.handlers, getHandlerWithPredicates));
    _.each(handlers, function (predicates, handler) {
      _.each(predicates, function (predicate) {
        if (predicate(action)) {
          try {
            this.action = action;
            this[handler].apply(this, action.arguments);
          } finally {
            this.action = null;
          }
        }
      }, this);
    }, this);

    function getHandlerWithPredicates(actionPredicates, handler) {
      _.isArray(actionPredicates) || (actionPredicates = [actionPredicates]);

      var predicates = _.map(actionPredicates, toFunc);

      return [handler, predicates];

      function toFunc(actionPredicate) {
        if (_.isString(actionPredicate)) {
          actionPredicate = {
            type: actionPredicate
          };
        }

        return _.createCallback(actionPredicate);
      }
    }
  }

  function waitFor(stores) {
    if (!_.isArray(stores)) {
      stores = _.toArray(arguments);
    }

    options.dispatcher.waitFor(dispatchTokens(stores));

    function dispatchTokens(stores) {
      return _.chain(stores).map(storeOrToken).filter(nulls).value();

      function storeOrToken(store) {
        if (store.dispatchToken) {
          return store.dispatchToken;
        }

        if (_.isString(store)) {
          return store;
        }
      }

      function nulls(obj) {
        return obj;
      }
    }
  }
}

module.exports = Store;