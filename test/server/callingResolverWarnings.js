var _ = require('underscore');
var expect = require('chai').expect;
var stubbedLogger = require('../lib/stubbedLogger');

describe('calling resolver warnings', function () {
  var Marty, logger;

  beforeEach(function () {
    logger = stubbedLogger();
    Marty = require('../../index').createInstance();
  });

  afterEach(function () {
    logger.restore();
  });

  describe('when calling an action creators resolver on node', function () {
    beforeEach(function () {
      var creators = Marty.createActionCreators({
        id: 'Foo',
        bar: _.noop
      });

      creators.bar();
    });

    it('should warn you that you should be resolving an instance', function () {
      expect(logger.warn).to.be.calledWith(
        'Warning: You are calling `bar` on the static instance of the ActionCreators \'Foo\'. ' +
        'You should resolve the instance for the current context'
      );
    });
  });

  describe('when calling a stores resolver on node', function () {
    beforeEach(function () {
      var store = Marty.createStore({
        id: 'Foo',
        bar: _.noop,
        getInitialState: function () {
          return {};
        }
      });

      store.bar();
    });

    it('should warn you that you should be resolving an instance', function () {
      expect(logger.warn).to.be.calledWith(
        'Warning: You are calling `bar` on the static instance of the Store \'Foo\'. ' +
        'You should resolve the instance for the current context'
      );
    });
  });

  describe('when calling a state sources resolver on node', function () {
    beforeEach(function () {
      var source = Marty.createStateSource({
        id: 'Foo',
        bar: _.noop
      });

      source.bar();
    });

    it('should warn you that you should be resolving an instance', function () {
      expect(logger.warn).to.be.calledWith(
        'Warning: You are calling `bar` on the static instance of the StateSource \'Foo\'. ' +
        'You should resolve the instance for the current context'
      );
    });
  });
});