var sinon = require('sinon');
var expect = require('chai').expect;
var Router = require('../lib/router');

describe('Router', function () {
  var router, dispatcher;

  beforeEach(function () {
    dispatcher = {
      dispatch: sinon.spy()
    };

    router = new Router({
      dispatcher: dispatcher,
      initialize: sinon.spy(),
    });
  });

  it('should call initialize once', function () {
    expect(router.initialize).to.have.been.calledOnce;
  });
});
