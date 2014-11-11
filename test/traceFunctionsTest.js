var sinon = require('sinon');
var expect = require('chai').expect;
var traceFunctions = require('../lib/diagnostics/traceFunctions');

describe.only('traceFunctions()', function () {
  var functions, traceId, functionType;

  beforeEach(function () {
    traceId = 'calc';
    functionType = 'Calculation';
    functions = {
      multiplier: 2,
      add: function (a, b) {
        return (a + b) * this.multiplier;
      },
      subtract: function (a, b) {
        return (a - b) * this.multiplier;
      }
    };

    tracer = {
      leftCalculation: sinon.spy(),
      enteredCalculation: sinon.stub().returns(traceId)
    };

    functions = traceFunctions(functions, functionType, tracer);
  });

  it('should not break existing functions', function () {
    expect(functions.add(1, 2)).to.equal(6);
    expect(functions.subtract(2, 1)).to.equal(2);
  });

  it('should call the tracer when you enter the function', function () {
    functions.add(1, 2);

    expect(tracer.enteredCalculation).to.have.been.called;
  });

  describe('when you enter the function', function () {
    it('should call the tracer with the instance, function name and args', function () {
      functions.add(1, 2);
      expect(tracer.enteredCalculation).to.have.been.calledWith(functions, 'add', [1, 2]);
    });
  });

  describe('when you leave the function', function () {
    it('should call the tracer with the trace id and any result', function () {
      functions.subtract(5, 1);
      expect(tracer.leftCalculation).to.have.been.calledWith(traceId, 8);
    });
  });
});
