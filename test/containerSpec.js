var sinon = require('sinon');
var expect = require('chai').expect;
var Container = require('../lib/container');

describe('Container', function () {
  var container, action;

  beforeEach(function () {
    action = sinon.spy();
    container = new Container();
  });

  describe('registerActionCreator', function () {
    var expectedActionCreator, actualActionCreator;

    beforeEach(function () {
      expectedActionCreator = {
        id: 'foo',
        displayName: 'Foo',
        foo: action
      };
    });

    describe('when I register an action creator with an Id', function () {
      beforeEach(function () {
        container.registerActionCreator(expectedActionCreator);
      });

      it('should be able to create an instance of it', function () {
        actualActionCreator = container.resolveActionCreator(expectedActionCreator.id);
        expect(actualActionCreator).to.be.defined;
        actualActionCreator.foo();
        expect(action).to.be.called;
      });
    });

    describe('when the action creator only has a display name', function () {
      beforeEach(function () {
        delete expectedActionCreator.id;
        container.registerActionCreator(expectedActionCreator);
      });

      it('should use the displayName as an Id', function () {
        actualActionCreator = container.resolveActionCreator(expectedActionCreator.displayName);
        expect(actualActionCreator).to.be.defined;
        actualActionCreator.foo();
        expect(action).to.be.called;
      });
    });

    describe('when the action creator doesnt have an Id or displayName', function () {
      beforeEach(function () {
        delete expectedActionCreator.id;
        delete expectedActionCreator.displayName;
      });

      it('should throw an error', function () {
        expect(function () {
          container.registerActionCreator(expectedActionCreator);
        }).to.throw(Error);
      });
    });
  });
});