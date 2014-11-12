var _ = require('lodash');
var functionCallProperties = [
  'name',
  'arguments',
  'context',
  'returnValue',
  'complete',
  'children'
];

function FunctionCall(options) {
  var finished = false;
  var returnValue = null;

  this.parent = null;
  this.children = [];
  this.toJSON = toJSON;
  this.exeception = null;
  this.name = options.name;
  this.toString = toString;
  this.context = options.context;
  this.arguments = _.toArray(options.arguments);

  Object.defineProperty(this, 'returnValue', {
    get: function () {
      return returnValue
    },
    set: function (val) {
      returnValue = val || null;
      finished = true;
    }
  });

  Object.defineProperty(this, 'exeception', {
    get: function () {
      return exeception
    },
    set: function (val) {
      exeception = val || null;
      finished = true;
    }
  });

  Object.defineProperty(this, 'complete', {
    get: function () {
      return finished
          && _.chain(this.children).pluck('complete').all().value();
    }
  });

  function toString() {
    return this.context.id + "#" + this.name;
  }

  function toJSON() {
    var json = _.pick(this, functionCallProperties);

    json.children = _.invoke(json.children, 'toJSON');

    return json;
  }
}

module.exports = FunctionCall;