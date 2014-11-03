var sinon = require('sinon');
var expect = require('chai').expect;
var Store = require('../lib/store');

describe('Store', function () {
  var store, sandbox, dispatcher, dispatchToken = 'foo';

  beforeEach(function () {
    sandbox = sinon.sandbox.create();

    dispatcher = {
      register: sandbox.stub().returns(dispatchToken)
    };

    store = new Store({
      dispatcher: dispatcher,
      handlers: {
        testHandler: 'test-action'
      },
      initialize: sandbox.spy(),
      testHandler: sinon.spy()
    });
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('should call initialize once', function () {
    expect(store.initialize).to.have.been.calledOnce;
  });

  it('should have a dispatch token', function () {
    expect(store.dispatchToken).to.equal(dispatchToken);
  });

  it('should have registered onPayload with the dispatcher', function () {
    expect(dispatcher.register).to.have.been.calledWith(store.onPayload);
  });
});