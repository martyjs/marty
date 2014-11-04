var sinon = require('sinon');
var expect = require('chai').expect;
var ActionCreators = require('../lib/actionCreators');

describe('ActionCreators', function () {
  var actionCreators;

  beforeEach(function () {
    actionCreators = new ActionCreators({
      initialize: sinon.spy()
    });
  });

  it('should call initialize once', function () {
    expect(actionCreators.initialize).to.have.been.calledOnce;
  });
});
