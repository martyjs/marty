var FunctionCall = require('./functionCall');

function DataFlow() {
  this.root = null;
  this.stack = [];
}

DataFlow.prototype = {
  startFunctionCall: function (options, cb) {
    var call = new FunctionCall(options);

    if (!this.root) {
      this.root = call;
    } else {
      // Push it on to the current head of the call stack
      var head = this.stack[this.stack.length - 1];
      call.parent = head;
      head.children.push(call);
    }

    this.stack.push(call);

    if (!cb) {
      return call;
    }

    try {
      func.returnValue = cb();
      this.stack.pop();
      return func.returnValue;
    } catch (e) {
      func.exception = e;
      this.stack.pop();

      throw e;
    }
  },
  startAsyncOperation: function () {
    this.stack.pop();
  },
  endAsyncOperation: function (call) {
    // Once an async operation is complete we want
    // to return the call stack to its state before
    // the async operation occured
    var stack = [call];
    while (call.parent) {
      stack.push(call.parent);
      call = call.parent;
    }
    this.stack = stack.reverse();
  },
  endFunctionCall: function (returnValue) {
    this.stack.pop().returnValue = returnValue;
  },
  toJSON: function () {
    if (!this.root) {
      return null;
    }

    return this.root.toJSON();
  }
};


module.exports = DataFlow;