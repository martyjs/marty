var uuid = require('./utils/uuid');
var _ = require('./utils/tinydash');
var ActionPayload = require('./action');
var diagnostics = require('./diagnostics');
var Actions = require('./internalConstants').Actions;
var DispatchMixin = require('./mixins/dispatchMixin');

function ActionCreators(options) {
  var creator = this;

  options || (options = {});

  this.getActionType = getActionType;

  _.extend.apply(_, [
    this,
    wrapFunctions(options)
  ].concat(options.mixins));


  function getActionType(name) {
    return name.replace(/([a-z\d])([A-Z]+)/g, '$1_$2').replace(/[-\s]+/g, '_').toUpperCase();
  }

  function extendActionCreator(mixins) {
    _.extend.apply(_, [creator].concat(mixins));
  }

  function wrapFunctions(functions) {
    _.each(functions, function (func, name) {
      if (!_.isFunction(func)) {
        return
      }

      functions[name] = function () {
        var token = uuid();
        var context, result;
        var actionType = creator.getActionType(name);

        dispatchStarting(arguments);

        try {
          result = func.apply(actionContext(), arguments);

          if (result instanceof Error) {
            dispatchError(result);
          } else {
            dispatchDone();
          }
        } catch (e) {
          dispatchError(e);
        }

        return token;

        function actionContext() {
          return _.extend({
            dispatch: function () {
              dispatch({
                type: actionType,
                arguments: arguments
              });
            }
          }, this);
        }

        function dispatchStarting(args) {
          dispatch({
            type: Actions.ACTION_STARTING,
            arguments: [{
              token: token,
              type: actionType,
              arguments: _.toArray(args)
            }]
          });
        }

        function dispatchDone() {
          dispatch({
            type: Actions.ACTION_DONE,
            arguments: [token]
          });
        }

        function dispatchError(err) {
          dispatch({
            type: Actions.ACTION_ERROR,
            arguments: [{
              token: token,
              error: err
            }]
          });
        }
      };
    });

    return functions;
  }

  function dispatch(payload) {
    options.dispatcher.dispatch(new ActionPayload(payload));
  }

  // function traceFunctions(actionCreator, functions) {
  //   _.each(functions, function (func, name) {
  //     if (!_.isFunction(func)) {
  //       return;
  //     }

  //     functions[name] = function () {
  //       var context = this;
  //       var creator = context.__creator || {
  //         action: name,
  //         type: 'ActionCreator',
  //         name: actionCreator.name,
  //         arguments: _.toArray(arguments)
  //       };

  //       if (!context.__creator) {
  //         context = _.extend({
  //           '__creator': creator
  //         }, actionCreator);
  //       }

  //       return func.apply(context, arguments);
  //     };
  //   });

  //   return functions;
  // }

}

module.exports = ActionCreators;